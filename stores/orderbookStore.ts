import { create } from "zustand";
import type { Order } from "@/types/domain"; 


// Helper function to merge updates into an existing order book
const mergeOrderbookLevels = (
  currentLevels: Order[],
  updates: Order[],
  isSnapshot: boolean,
  sortOrder: 'asc' | 'desc'
): Order[] => {
  // If it's a snapshot, we completely replace the old data
  if (isSnapshot) {
    return updates;
  }

  // If it's a delta update, we need to merge
  const levelMap = new Map<number, number>(currentLevels);

  // Apply updates to the map
  for (const [price, size] of updates) {
    if (size === 0) {
      // A size of 0 means the level should be removed
      levelMap.delete(price);
    } else {
      // Add or update the level
      levelMap.set(price, size);
    }
  }

  // Convert map back to array and sort
  const sortedLevels = Array.from(levelMap.entries());
  sortedLevels.sort((a, b) => (sortOrder === 'asc' ? a[0] - b[0] : b[0] - a[0]));

  return sortedLevels;
};

interface OrderbookState {
  okx: { bids: Order[]; asks: Order[]; };
  bybit: { bids: Order[]; asks: Order[]; };
  deribit: { bids: Order[]; asks: Order[]; };

  // This is the action our services will call
  updateOrderbook: (
    exchange: 'okx' | 'bybit' | 'deribit',
    bids: Order[],
    asks: Order[],
    isSnapshot: boolean
  ) => void;

  clearOrderbook: (exchange?: string) => void;
}

export const useOrderbookStore = create<OrderbookState>((set, get) => ({
  okx: { bids: [], asks: [] },
  bybit: { bids: [], asks: [] },
  deribit: { bids: [], asks: [] },

  updateOrderbook: (exchange, newBids, newAsks, isSnapshot) => {
    set(state => {
      const currentBook = state[exchange];
      
      const mergedBids = mergeOrderbookLevels(currentBook.bids, newBids, isSnapshot, 'desc');
      const mergedAsks = mergeOrderbookLevels(currentBook.asks, newAsks, isSnapshot, 'asc');

      return {
        ...state,
        [exchange]: {
          bids: mergedBids.slice(0, 15),
          asks: mergedAsks.slice(0, 15),
        }
      };
    });
  },
  
  clearOrderbook: (exchange) => {
     if (exchange) {
      const exchangeKey = exchange.toLowerCase() as 'okx' | 'bybit' | 'deribit';
      set({ [exchangeKey]: { bids: [], asks: [] } });
    } else {
      set({ okx: { bids: [], asks: [] }, bybit: { bids: [], asks: [] }, deribit: { bids: [], asks: [] } });
    }
  },
}));

