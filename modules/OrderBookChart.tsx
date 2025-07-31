"use client";
import { useOrderbookStore } from "@/stores/orderbookStore";
import { useExchangeStore } from "@/stores/exchangeStore";
import { useSimulationStore } from "@/stores/simulationStore";
import { useEffect, useState, useMemo } from "react";
import type { Order } from "@/types/domain";


export default function OrderBookChart() {
  const { okx, bybit, deribit } = useOrderbookStore();
  const { activeExchange, selectedPair } = useExchangeStore();
  const pendingOrder = useSimulationStore((state) => state.pendingOrder);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const selectedData: { bids: Order[]; asks: Order[] } = useMemo(() => {
    const allOrderbooks = { okx, bybit, deribit };
    const exchangeKey = activeExchange.toLowerCase() as keyof typeof allOrderbooks;

    return allOrderbooks[exchangeKey] || { bids: [], asks: [] };
  }, [activeExchange, okx, bybit, deribit]);

  useEffect(() => {
    if (selectedData.bids.length > 0 || selectedData.asks.length > 0) {
      setLastUpdated(new Date().toLocaleTimeString());
    }
  }, [selectedData]);

  const priceDecimalPlaces = useMemo(() => {
    const price = selectedData.bids[0]?.[0] || selectedData.asks[0]?.[0] || 1;
    if (price < 0.1) return 5;
    if (price < 1) return 4;
    if (price < 100) return 2;
    return 1;
  }, [selectedData]);

  const maxVolume = useMemo(() => {
    const allLevels = [...selectedData.bids, ...selectedData.asks];
    if (allLevels.length === 0) return 1;
    return Math.max(...allLevels.map(level => level[1]));
  }, [selectedData]);

  const bookMetrics = useMemo(() => {
    const bestAsk = selectedData.asks[0]?.[0];
    const bestBid = selectedData.bids[0]?.[0];
    const spread = bestAsk && bestBid ? bestAsk - bestBid : 0;
    const totalAsksSize = selectedData.asks.reduce((sum, level) => sum + level[1], 0);
    const totalBidsSize = selectedData.bids.reduce((sum, level) => sum + level[1], 0);
    const totalVolume = totalBidsSize + totalAsksSize;
    const imbalance = totalVolume > 0 ? (totalBidsSize / totalVolume) * 100 : 50;
    return { spread, totalAsksSize, totalBidsSize, imbalance };
  }, [selectedData]);

  const renderLevels = (
    levels: [number, number][],
    colorClass: string,
    type: "bids" | "asks"
  ) => {
   
    let mergedLevels = [...levels]; // Copy to avoid mutating original

    if (pendingOrder && pendingOrder.price && pendingOrder.type === 'Limit') {
      const orderPrice = pendingOrder.price;
      const orderQuantity = pendingOrder.quantity;
      const isBuy = pendingOrder.side === 'Buy'; 

      if ((isBuy && type === 'bids') || (!isBuy && type === 'asks')) {
        // Find if price already exists (to aggregate quantities)
        const existingIndex = mergedLevels.findIndex(([price]) => price === orderPrice);
        if (existingIndex !== -1) {
          // Aggregate quantity if price matches
          mergedLevels[existingIndex][1] += orderQuantity!;
        } else {
          // Insert as new level at correct sorted position
          const insertIndex = mergedLevels.findIndex(([price]) =>
            type === 'bids' ? price < orderPrice : price > orderPrice
          );
          if (insertIndex === -1) {
            mergedLevels.push([orderPrice, orderQuantity!]); // Add to end
          } else {
            mergedLevels.splice(insertIndex, 0, [orderPrice, orderQuantity!]);
          }
        }
      }
    }

    // Sort the merged levels (descending for bids, ascending for asks)
    const sortedLevels = [...mergedLevels].sort((a, b) => (type === 'bids' ? b[0] - a[0] : a[0] - b[0]));

    // Always prepare exactly 15 display rows (slice to 15, fill empties if under)
    const displayRows = Array(15).fill(null).map((_, index) => sortedLevels[index] || null);

    return displayRows.map((levelData, index) => {
      const depthPercentage = levelData ? (levelData[1] / maxVolume) * 100 : 0;

      const barDirection = type === 'asks' ? 'right' : 'left';
      const depthBarStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        bottom: 0,
        [barDirection]: 0,
        width: `${depthPercentage}%`,
        backgroundColor: type === 'asks' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
        transition: 'width 0.3s ease-in-out',
        zIndex: 1,
      };

      if (levelData) {
        const [price, size] = levelData;
       //Check if this is the pending order level (based on price matching the inserted one)
        let isPendingOrderLevel = false;
        let isMarketAffected = false;
        if (pendingOrder && pendingOrder.price && pendingOrder.type === 'Limit') {
          if ((pendingOrder.side === 'Buy' && type === 'bids') || (pendingOrder.side === 'Sell' && type === 'asks')) {
            if (price === pendingOrder.price) {
              isPendingOrderLevel = true;
            }
          }
        }

        if (pendingOrder && pendingOrder.type === 'Market') {
          const isBuy = pendingOrder.side === 'Buy';
          if ((isBuy && type === 'asks') || (!isBuy && type === 'bids')) { 
            // Market buy affects asks, sell affects bids
            // Here, we'd ideally accumulate quantity from top levels to see if this index is affected
            // For simplicity, highlight the top N levels (e.g., first 3) as potentially impacted
            if (index < 3) { 
              isMarketAffected = true;
            }
          }
        }

        // Render a row with data
        return (
              <div 
            key={index} 
            className={`h-7 relative grid grid-cols-2 items-center px-3 text-xs transition-colors duration-150 hover:bg-neutral-700/50 
              ${isPendingOrderLevel ? 'ring-1 ring-cyan-400/80 bg-cyan-500/10' : ''}
              ${isMarketAffected ? 'bg-cyan-500/10 ring-1 ring-cyan-400/80' : ''}`}
          >
            <div style={depthBarStyle}></div>
            <div className={`relative z-10 text-right font-mono ${colorClass} flex items-center justify-end`}>
              {price.toFixed(priceDecimalPlaces)}
              {isPendingOrderLevel && <span className="ml-1 text-cyan-500/75 text-[10px] hidden md:inline">(Simulated)</span>} 
              {isMarketAffected && <span className="ml-1 text-cyan-500/75 text-[10px] hidden md:inline">(Simulated)</span>} 
            </div>
            <div className="relative z-10 text-right font-mono text-white">{size.toFixed(4)}</div>
          </div>
        );
      } else {
        
        return (
          <div key={index} className="h-7">
            <span className="font-mono">&nbsp;</span>
          </div>
        );
      }
    });
  };

  return (
    <div className="rounded-xl border border-neutral-700 bg-neutral-900/50 shadow-md overflow-hidden flex flex-col h-full ">

      <div className="px-3 py-2 md:px-4 border-b border-neutral-800 flex justify-between items-center text-white text-xs md:text-sm">
        <div>
          <h2 className="font-bold">{activeExchange} Orderbook</h2>
        </div>
        <div className="flex items-center gap-2 text-neutral-400">
          <div className={`w-2 h-2 rounded-full transition-colors ${selectedData.bids?.length > 0 ? "bg-green-500" : "bg-red-500"}`} />
          <span>{lastUpdated ? `Updated: ${lastUpdated}` : "Waiting..."}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 text-xs font-semibold text-neutral-400 text-center border-b border-neutral-800">
        <div className="py-1 px-3 text-center text-red-400">Asks(Price/Size)</div>
        <div className="py-1 px-3 text-center text-green-400">Bids(Price/Size)</div>
      </div>
      <div className="grid grid-cols-2 divide-x divide-neutral-800 flex-grow min-h-0 text-tiny md:text-sm" >
        <div className="overflow-y-hidden ">
          {renderLevels(selectedData.asks || [], "text-red-400", "asks")}
        </div>
        <div className="overflow-y-hidden">
          {renderLevels(selectedData.bids || [], "text-green-400", "bids")}
        </div>
      </div>
      <div className="px-3 py-1.5 md:px-4 text-xs text-neutral-500 border-t border-neutral-800 bg-neutral-900/80 flex justify-between">
        <span>Status: {selectedData.bids?.length > 0 ? "Live" : "Disconnected"}</span>
        <span>{activeExchange} • {selectedPair}</span>
      </div>
      <div className="px-3 pt-2 pb-3 border-t border-neutral-800 bg-black/20">
        <div className="text-xs text-neutral-400/80 text-center mb-2 font-semibold">Book Imbalance</div>
        <div
          title={`Bids: ${bookMetrics.imbalance.toFixed(0)}% | Asks: ${(100 - bookMetrics.imbalance).toFixed(0)}%`}
          className="w-full bg-black/30 rounded-full h-5 flex items-center relative overflow-hidden border border-neutral-700 shadow-inner"
        >
          <div
            className="h-full bg-green-400/30 rounded-l-full transition-all duration-300 ease-in-out flex items-center justify-start pl-3"
            style={{ width: `${bookMetrics.imbalance}%` }}
          >
            <span className="text-white/50 font-mono text-xs font-semibold">
              {bookMetrics.imbalance > 15 && `${bookMetrics.imbalance.toFixed(0)}%`}
            </span>
          </div>
          <div
            className="h-full bg-red-500/40 rounded-r-full transition-all duration-300 ease-in-out flex items-center justify-end pr-3"
            style={{ width: `${100 - bookMetrics.imbalance}%` }}
          >
            <span className="text-white/50 font-mono text-xs font-semibold">
              {(100 - bookMetrics.imbalance) > 15 && `${(100 - bookMetrics.imbalance).toFixed(0)}%`}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 text-center text-xs p-2 border-t border-neutral-800 bg-black/20">
        <div>
          <span className="text-neutral-500 block">Total Asks</span>
          <span className="font-mono text-red-400">{bookMetrics.totalAsksSize.toFixed(4)}</span>
        </div>
        <div>
          <span className="text-neutral-500 block">Spread</span>
          <span className="font-mono text-white">{bookMetrics.spread.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-neutral-500 block">Total Bids</span>
          <span className="font-mono text-green-400">{bookMetrics.totalBidsSize.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
}
