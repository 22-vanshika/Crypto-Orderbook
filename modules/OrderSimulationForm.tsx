"use client";

import { useEffect, useState } from "react";
import { useExchangeStore } from "@/stores/exchangeStore";
import { useSimulationStore } from "@/stores/simulationStore";
import { useOrderHistoryStore } from "@/stores/orderHistoryStore";
import type { SimulatedOrder } from "@/types/domain";
import toast from "react-hot-toast";
import {
  ArrowRightLeft,
  ChevronsUpDown,
  TrendingUp,
  TrendingDown,
  CircleDollarSign,
  Package,
  Clock,
  Send,
} from "lucide-react";

export default function OrderSimulationForm() {

  const {
    activeExchange,
    selectedPair,
    exchanges,
    pairLists,
    isLoadingPairs,
    setActiveExchange,
    setSelectedPair,
    fetchPairsForActiveExchange,
  } = useExchangeStore();

  const { addOrder } = useOrderHistoryStore();
  const { setPendingOrder } = useSimulationStore();

  useEffect(() => {
    fetchPairsForActiveExchange();
  }, [activeExchange, fetchPairsForActiveExchange]);

  // Local state for form inputs
  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Limit');
  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [delay, setDelay] = useState(0);

  useEffect(() => {
    const numPrice = parseFloat(price);
    const numQuantity = parseFloat(quantity);

    // If the inputs are valid, update the pending order
    if ((orderType === 'Limit' && numPrice > 0) || (orderType === 'Market' && numQuantity > 0)) {
      setPendingOrder({
        type: orderType,
        side: side,
        price: numPrice,
        quantity: numQuantity,
      });
    } else {
      // Otherwise, clear the pending order
      setPendingOrder(null);
    }
  }, [price, quantity, side, orderType, setPendingOrder]);

  // Form submission logic 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPendingOrder(null);
    const numQuantity = parseFloat(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0) { toast.error("Please enter a valid quantity."); return; }
    const numPrice = parseFloat(price);
    if (orderType === 'Limit' && (isNaN(numPrice) || numPrice <= 0)) { toast.error("Please enter a valid price for a limit order."); return; }
    if (!selectedPair) { toast.error("Please select a symbol/pair first."); return; }
    const newOrder: SimulatedOrder = {
      id: Date.now(), venue: activeExchange, symbol: selectedPair, type: orderType, side,
      quantity: numQuantity, price: orderType === 'Limit' ? numPrice : undefined,
      status: 'Executed', timestamp: new Date(),
    };
    setTimeout(() => {
      addOrder(newOrder);
      toast.success(`${side} order for ${quantity} ${selectedPair} placed!`);
    }, delay);

    setPrice('');
    setQuantity('');
  };

  const currentPairList = pairLists[activeExchange.toLowerCase() as keyof typeof pairLists] || [];
  const handleOrderTypeChange = (newType: 'Market' | 'Limit') => {
    if (newType === 'Market') {
      setPrice(''); // Clear the price
    }
    setOrderType(newType);
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-1 text-xs md:text-sm">
      <div className="grid grid-cols-2 gap-3">
        <SideButton active={side === 'Buy'} onClick={() => setSide('Buy')} type="Buy" />
        <SideButton active={side === 'Sell'} onClick={() => setSide('Sell')} type="Sell" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">


        <FormRow icon={<ArrowRightLeft size={16} />} label="Venue">
          <select value={activeExchange} onChange={(e) => setActiveExchange(e.target.value)} className="form-input w-[60%] ">
            {exchanges.map(ex => <option key={ex} value={ex} >{ex}</option>)}
          </select>
        </FormRow>



        <FormRow icon={<ChevronsUpDown size={16} />} label="Symbol">
          {/* Use the isLoadingPairs state from the store */}
          <select value={selectedPair} onChange={(e) => setSelectedPair(e.target.value)} className="form-input w-[60%]" disabled={isLoadingPairs || currentPairList.length === 0}>
            {isLoadingPairs ? <option>Loading...</option> : currentPairList.map(pair => <option key={pair} value={pair}>{pair}</option>)}
          </select>
        </FormRow>


        <FormRow icon={<ChevronsUpDown size={16} />} label="Type">
          <select value={orderType} onChange={(e) => handleOrderTypeChange(e.target.value as any)} className="form-input w-[60%]">
            <option value="Limit">Limit</option>
            <option value="Market">Market</option>
          </select>
        </FormRow>


        <FormRow icon={<CircleDollarSign size={16} />} label="Price">
          <input type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} disabled={orderType === 'Market'} className="form-input w-[60%] text-left disabled:bg-neutral-800/50 disabled:cursor-not-allowed" />
        </FormRow>
      </div>

      <FormRow icon={<Package size={16} />} label="Quantity">
        <input type="number" placeholder="0.0000" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="form-input w-[60%] text-left" />
      </FormRow>

      <FormRow icon={<Clock size={16} />} label="Timing">
        <div className="flex space-x-2 w-[60%] overflow-y-auto no-scrollbar" >
          {[0, 5, 10, 30].map(sec => (
            <button type="button" key={sec} onClick={() => setDelay(sec * 1000)} className={`flex-1 p-2 rounded-md transition-all text-tiny md:text-xs border ${delay === sec * 1000 ? 'bg-cyan-400/20 border-cyan-400/70 text-cyan-300 font-semibold' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
              {sec === 0 ? 'Now' : `${sec}s`}
            </button>
          ))}
        </div>
      </FormRow>

      <div className="pt-2">
        <button type="submit" className={`w-full p-3 rounded-lg text-white font-semibold text-base flex items-center justify-center gap-2 transition-all duration-300 border hover:shadow-lg ${side === 'Buy' ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20 hover:border-green-500/80 hover:shadow-green-500/20' : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/80 hover:shadow-red-500/20'}`}>
          <Send size={16} />
          Place {side} Order
        </button>
      </div>
    </form>
  );
}

const FormRow = ({ children, label, icon }: { children: React.ReactNode, label: string, icon: React.ReactNode }) => (
  <div className="flex items-center justify-between">
    <label className="flex items-center gap-2 text-neutral-400 ">{icon}{label}</label>
    {children}
  </div>
);

const SideButton = ({ active, onClick, type }: { active: boolean, onClick: () => void, type: 'Buy' | 'Sell' }) => {
  const isActive = active;
  const color = type === 'Buy' ? 'green' : 'red';
  const Icon = type === 'Buy' ? TrendingUp : TrendingDown;

  const baseClasses = "p-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all duration-200 border";
  const activeClasses = `bg-${color}-500/20 border-${color}-500/30 text-${color}-400 shadow-lg shadow-${color}-500/10`;
  const inactiveClasses = "border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10";

  return (
    <button type="button" onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      <Icon size={16} /> {type}
    </button>
  );
};