import { useOrderbookStore } from "@/stores/orderbookStore";
import type { Order , Venue } from "@/types/domain"; 


export async function fetchInstruments(venue: Venue): Promise<string[]> {
  // Hardcoded lists are our final fallback in case the API route fails
  const defaultLists: Record<Venue, string[]> = {
    Bybit: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT'],
    Deribit: ['BTC-PERPETUAL', 'ETH-PERPETUAL'],
    OKX: ['BTC-USDT', 'ETH-USDT', 'SOL-USDT', 'LTC-USDT', 'XRP-USDT'],
  };

  try {
    // We now call our own local API route, which is reliable
    const response = await fetch(`/api/instruments?venue=${venue}`);
    if (!response.ok) {
      throw new Error(`API route failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return data; // Return the live data from the API route
    } else {
      console.warn(`API for ${venue} returned no instruments, using fallback list.`);
      return defaultLists[venue];
    }
  } catch (error) {
    console.error(`Failed to fetch instruments for ${venue}, using fallback list:`, error);
    return defaultLists[venue];
  }
}


// --- The functions below are for WebSockets  ---

export const getWebSocketUrl = (venue: Venue): string => {
  const urls: Record<Venue, string | undefined> = {
    OKX: process.env.NEXT_PUBLIC_OKX_WSS_URL,
    Bybit: process.env.NEXT_PUBLIC_BYBIT_WSS_URL,
    Deribit: process.env.NEXT_PUBLIC_DERIBIT_WSS_URL
  };
  const url = urls[venue];
  if (!url) {
    throw new Error(`WebSocket URL for venue ${venue} is not defined in environment variables.`);
  }
  return url;
};

export const getSubscriptionMessage = (venue: Venue, symbol: string): string => {
  let message: object;
  switch (venue) {
    case 'OKX': 
      message = { op: 'subscribe', args: [{ channel: 'books', instId: symbol }] };
      break;
    case 'Bybit': 
      message = { op: "subscribe", args: [`orderbook.200.${symbol}`] };
      break;
    case 'Deribit': 
      message = { jsonrpc: '2.0', id: Date.now(), method: 'public/subscribe', params: { channels: [`book.${symbol}.100ms`] } };
      break;
  }
  return JSON.stringify(message);
};

export const getPingMessage = (venue: Venue): string => {
  let message: object;
  switch (venue) {
    case 'OKX': 
    case 'Bybit':
      message = { op: 'ping' };
      break;
    case 'Deribit': 
      message = { jsonrpc: '2.0', id: Date.now(), method: 'public/test' };
      break;
  }
  return JSON.stringify(message);
};

export function transformAndStoreMessage(message: any, venue: Venue) {
  try {
    const parsedData = JSON.parse(message.data);

    if (parsedData.event || parsedData.op === 'pong' || parsedData.method === 'heartbeat' || (venue === 'Deribit' && parsedData.id)) {
      return; 
    }
    
    let isSnapshot = false;
    let bids: Order[] = [];
    let asks: Order[] = [];

    if (venue === 'OKX' && parsedData.arg?.channel === 'books' && parsedData.data?.[0]) {
      isSnapshot = parsedData.action === 'snapshot';
      const book = parsedData.data[0];
      bids = book.bids?.map((o: string[]) => [parseFloat(o[0]), parseFloat(o[1])]) || [];
      asks = book.asks?.map((o: string[]) => [parseFloat(o[0]), parseFloat(o[1])]) || [];
    }
    else if (venue === 'Bybit' && parsedData.topic?.includes('orderbook')) {
      isSnapshot = parsedData.type === 'snapshot';
      const book = parsedData.data;
      bids = book.b?.map((o: string[]) => [parseFloat(o[0]), parseFloat(o[1])]) || [];
      asks = book.a?.map((o: string[]) => [parseFloat(o[0]), parseFloat(o[1])]) || [];
    }
    else if (venue === 'Deribit' && parsedData.params?.data) {
      isSnapshot = parsedData.params.data.type === 'snapshot';
      const book = parsedData.params.data;
      const parseLevels = (levels: any[]): Order[] => {
        const parsed = (levels || []).map((l: any) =>
          l.length === 2 ? [parseFloat(l[0]), parseFloat(l[1])] :
          l[0] === 'delete' ? [parseFloat(l[1]), 0] :
          [parseFloat(l[1]), parseFloat(l[2])]
        ).filter(l => !isNaN(l[0])) as [number, number][];
        return parsed as Order[];
      };
      bids = parseLevels(book.bids);
      asks = parseLevels(book.asks);
    }

    if (bids.length > 0 || asks.length > 0) {
      useOrderbookStore.getState().updateOrderbook(venue.toLowerCase() as 'okx'|'bybit'|'deribit', bids, asks, isSnapshot);
    }
    
  } catch (error) {
  }
}