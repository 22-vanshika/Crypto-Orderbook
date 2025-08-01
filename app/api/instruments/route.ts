import { NextResponse } from 'next/server';
import type { Venue } from '@/types/domain';

const REST_APIS = {
  // Uses env var with fallback
  OKX: process.env.NEXT_PUBLIC_OKX_REST_API || 'https://www.okx.com/api/v5/public/instruments?instType=SPOT', 
  Bybit: process.env.NEXT_PUBLIC_BYBIT_REST_API || 'https://api.bybit.com/v5/market/instruments-info?category=spot',
  Deribit: {
    BTC: process.env.NEXT_PUBLIC_DERIBIT_BTC_REST_API || 'https://www.deribit.com/api/v2/public/get_instruments?currency=BTC&kind=future&expired=false', 
    ETH: process.env.NEXT_PUBLIC_DERIBIT_ETH_REST_API || 'https://www.deribit.com/api/v2/public/get_instruments?currency=ETH&kind=future&expired=false' 
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const venue = searchParams.get('venue') as Venue | null;

  if (!venue || !REST_APIS[venue]) {
    return NextResponse.json({ error: "Invalid or missing venue parameter" }, { status: 400 });
  }

  try {
    let instrumentNames: string[] = [];
    switch (venue) {
      case 'OKX':
        const okxResponse = await fetch(REST_APIS.OKX, { mode: 'cors' });
        const okxData = await okxResponse.json();
        if (okxData.code === '0' && okxData.data) {
          instrumentNames = okxData.data
            .filter((inst: any) => inst.state === 'live')
            .map((inst: any) => inst.instId);
        }
        break;
      
      case 'Bybit':
        const bybitResponse = await fetch(REST_APIS.Bybit);
        const bybitData = await bybitResponse.json();
        if (bybitData.retCode === 0 && bybitData.result?.list) {
          instrumentNames = bybitData.result.list
            .filter((inst: any) => inst.status === 'Trading')
            .map((inst: any) => inst.symbol);
        }
        break;

      case 'Deribit':
        const [btcResponse, ethResponse] = await Promise.all([
          fetch(REST_APIS.Deribit.BTC),
          fetch(REST_APIS.Deribit.ETH)
        ]);
        const [btcData, ethData] = await Promise.all([btcResponse.json(), ethResponse.json()]);
        
        const btcInstruments = btcData.result?.filter((i: any) => i.is_active).map((inst: any) => inst.instrument_name) || [];
        const ethInstruments = ethData.result?.filter((i: any) => i.is_active).map((inst: any) => inst.instrument_name) || [];
        instrumentNames = [...new Set([...btcInstruments, ...ethInstruments])]; // Use a Set to remove duplicates
        break;
    }
    return NextResponse.json(instrumentNames);
  } catch (error: any) {
    console.error(`[API Route] Failed to fetch ${venue} instruments:`, error);
    return NextResponse.json({ error: `Failed to fetch instruments for ${venue}` }, { status: 500 });
  }
}