"use client";

import { useMemo } from "react";
import { useSimulationStore } from "@/stores/simulationStore";
import { useOrderbookStore } from "@/stores/orderbookStore";
import { useExchangeStore } from "@/stores/exchangeStore";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

// Define the slippage threshold for showing a warning
const SLIPPAGE_WARNING_THRESHOLD = 0.5;

export default function OrderImpactMetrics() {
    const { pendingOrder } = useSimulationStore();
    const { activeExchange } = useExchangeStore();
    const { okx, bybit, deribit } = useOrderbookStore();

    const metrics = useMemo(() => {
        // If there's no valid pending order, return a default "zero" object
        // This calculation logic remains the same.
        if (!pendingOrder || !pendingOrder.quantity || pendingOrder.quantity <= 0 || isNaN(pendingOrder.quantity)) {
            return { fillPercent: 0, avgPrice: 0, slippage: 0, impactPrice: 0 };
        }

        const book = ({
            okx,
            bybit,
            deribit,
        } as Record<string, { bids: [number, number][]; asks: [number, number][]; }>)[activeExchange.toLowerCase()] || { bids: [], asks: [] };

        const { side, quantity, price, type } = pendingOrder;

        let fillableQuantity = 0;
        let totalCost = 0;
        let impactPrice = 0;

        if (side === 'Buy') {
            const asks = [...book.asks].sort((a, b) => a[0] - b[0]);
            let quantityToFill = quantity;
            for (const [askPrice, askSize] of asks) {
                if (type === 'Limit' && price && askPrice > price) break;
                const amountToTake = Math.min(quantityToFill, askSize);
                fillableQuantity += amountToTake;
                totalCost += amountToTake * askPrice;
                quantityToFill -= amountToTake;
                impactPrice = askPrice;
                if (quantityToFill <= 0) break;
            }
        } else {
            const bids = [...book.bids].sort((a, b) => b[0] - a[0]);
            let quantityToFill = quantity;
            for (const [bidPrice, bidSize] of bids) {
                if (type === 'Limit' && price && bidPrice < price) break;
                const amountToTake = Math.min(quantityToFill, bidSize);
                fillableQuantity += amountToTake;
                totalCost += amountToTake * bidPrice;
                quantityToFill -= amountToTake;
                impactPrice = bidPrice;
                if (quantityToFill <= 0) break;
            }
        }

        const fillPercent = (fillableQuantity / quantity) * 100;
        const avgPrice = fillableQuantity > 0 ? totalCost / fillableQuantity : 0;
        const bestPrice = side === 'Buy' ? book.asks[0]?.[0] : book.bids[0]?.[0];
        const slippage = bestPrice && avgPrice > 0 ? Math.abs(((avgPrice - bestPrice) / bestPrice) * 100) : 0;

        return { fillPercent, avgPrice, slippage, impactPrice };

    }, [pendingOrder, activeExchange, okx, bybit, deribit]);


    // This check determines whether to show the calculated values or the default placeholders.
    const showCalculatedValues = pendingOrder && pendingOrder.quantity && pendingOrder.quantity > 0;
    const isHighSlippage = showCalculatedValues && metrics.slippage > SLIPPAGE_WARNING_THRESHOLD;

    // --- Generate a comment based on the metrics ---
    const orderAnalysis = useMemo(() => {
        if (!showCalculatedValues) {
            return { level: 'info', text: 'Enter an order to see a real-time analysis.' };
        }
        if (isHighSlippage) {
            return { level: 'warning', text: 'Warning: This order is large and may have significant slippage, increasing your cost.' };
        }
        if (metrics.fillPercent < 100) {
            return { level: 'warning', text: 'Warning: This order may not fill completely as its size exceeds the visible liquidity.' };
        }
        if (metrics.slippage > 0.1) {
            return { level: 'info', text: 'This order should fill completely with a small amount of slippage.' };
        }
        return { level: 'good', text: 'Good execution expected. This order should fill completely with minimal price slippage.' };
    }, [showCalculatedValues, isHighSlippage, metrics.fillPercent, metrics.slippage]);


    return (
        <div className="space-y-3 text-xs md:text-sm h-full flex flex-col justify-around">

            <div>
                <MetricRow
                    label="Est. Fillable"
                    value={showCalculatedValues ? `${metrics.fillPercent.toFixed(2)}%` : '-- %'}
                />
                <MetricRow
                    label="Avg. Fill Price"
                    value={showCalculatedValues ? metrics.avgPrice.toFixed(2) : '--'}
                />
                <div className="flex justify-between items-center bg-transparent p-2.5 rounded-md border border-cyan-400/30">
                    <span className="text-neutral-400">Slippage</span>
                    <span className={`font-mono font-semibold flex items-center gap-1.5 ${isHighSlippage ? 'text-amber-400' : 'text-white'}`}>
                        {isHighSlippage && <AlertTriangle size={14} />}
                        {showCalculatedValues ? `${metrics.slippage.toFixed(4)}%` : '-- %'}
                    </span>
                </div>
                <MetricRow
                    label="Price Impact"
                    value={showCalculatedValues && metrics.impactPrice > 0 ? `~ ${metrics.impactPrice.toFixed(2)}` : '--'}
                />

            </div>


            <div>
                <div className={`p-2.5 rounded-md border flex items-start gap-2.5 text-xs
        ${orderAnalysis.level === 'good' ? 'bg-green-500/10 border-green-500/30 text-green-400' : ''}
        ${orderAnalysis.level === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : ''}
        ${orderAnalysis.level === 'info' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : ''}
      `}>
                    {orderAnalysis.level === 'good' && <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />}
                    {orderAnalysis.level === 'warning' && <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />}
                    {orderAnalysis.level === 'info' && <Info size={16} className="mt-0.5 flex-shrink-0" />}
                    <p>{orderAnalysis.text}</p>
                </div>


                {showCalculatedValues && metrics.fillPercent < 100 && (
                    <div className="p-2 text-xs text-neutral-500 flex items-start gap-2">
                        <Info size={16} className="flex-shrink-0 mt-0.5" />
                        <p>
                            Note: Analysis is limited to the top 15 visible price levels. The actual impact may be greater.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

const MetricRow = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between items-center bg-transparent p-2.5 rounded-md border border-cyan-500/50 ">
        <span className="text-neutral-400">{label}</span>
        <span className="font-mono text-white font-semibold">{value}</span>
    </div>
);