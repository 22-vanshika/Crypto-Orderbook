"use client";
import { useOrderbookStore } from "@/stores/orderbookStore";
import { useExchangeStore } from "@/stores/exchangeStore";
import { useMemo, useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { Order } from "@/types/domain"; 

function useWindowSize() {
  const [windowSize, setWindowSize] = useState<{ width: number | undefined }>({
    width: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
      });
    }
    
    window.addEventListener("resize", handleResize);
    handleResize(); // Call handler right away so state gets updated with initial window size
    
    return () => window.removeEventListener("resize", handleResize);
  }, []); 

  return windowSize;
}
// --- End of hook definition ---


export default function DepthChart() {
  const { okx, bybit, deribit } = useOrderbookStore();
  const { activeExchange } = useExchangeStore();
  
  // Call the local hook
  const { width } = useWindowSize();
  const isMobile = width ? width < 768 : false;

  const chartData = useMemo(() => {
    const books: { [key: string]: { bids: Order[]; asks: Order[] } } = { okx, bybit, deribit };
    const book: { bids: Order[]; asks: Order[] } = books[activeExchange.toLowerCase()] || { bids: [], asks: [] };

    let bidTotal = 0;
    const processedBids = [...book.bids]
      .sort((a, b) => b[0] - a[0])
      .map(([price, size]) => {
        bidTotal += size;
        return { price, bids: bidTotal };
      });

    let askTotal = 0;
    const processedAsks = [...book.asks]
      .sort((a, b) => a[0] - b[0])
      .map(([price, size]) => {
        askTotal += size;
        return { price, asks: askTotal };
      });

    return { bids: processedBids.reverse(), asks: processedAsks };
  }, [activeExchange, okx, bybit, deribit]);
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const bidData = payload.find((p: any) => p.dataKey === 'bids');
      const askData = payload.find((p: any) => p.dataKey === 'asks');
      const data = bidData || askData;

      return (
        <div className="bg-neutral-800 border border-neutral-700 rounded-md p-2 text-xs shadow-lg">
          <p className="label text-neutral-400">{`Price: ${label.toFixed(2)}`}</p>
          <p className={`intro font-semibold ${bidData ? 'text-green-400' : 'text-red-400'}`}>
            {`Depth: ${data.value.toFixed(4)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer>
        <AreaChart margin={{ top: 10, right: isMobile ? 5: 20, left: isMobile ? 5: 20, bottom: 0 }}>
          <defs>
            <linearGradient id="bidGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="askGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="price" 
            type="number" 
            domain={['dataMin', 'dataMax']} 
            stroke="#6b7280" 
            fontSize={10}
            tickFormatter={(price) => price.toFixed(1)}
            tickCount={isMobile ? 4 : 8}
            dy={5}
          />
          <YAxis hide={true} domain={[0, 'dataMax']} />
          <Tooltip content={<CustomTooltip />} />
          <CartesianGrid stroke="#374151" strokeDasharray="3 3" vertical={false} />
          
          <Area type="monotone" dataKey="bids" data={chartData.bids} stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#bidGradient)" />
          <Area type="monotone" dataKey="asks" data={chartData.asks} stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#askGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}