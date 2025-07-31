
"use client";

import { useEffect, useRef } from "react"; 
import { Sparkles, Lock, Settings, BarChart3,  Info } from "lucide-react"; 
import { GlowingEffect } from "@/components/ui/glowing-effect";
import OrderBookChart from "@/modules/OrderBookChart";
import { useExchangeStore } from "@/stores/exchangeStore";
import WebSocketManager from "@/services/WebSocketManager";
import type { Venue } from "@/types/domain";
import OrderImpactMetrics from "@/modules/OrderImpactMetrics";
import OrderSimulationForm from "@/modules/OrderSimulationForm";
import OrderHistory from "@/modules/OrderHistory";
import DepthChart from "@/modules/DepthChart";
import { ContainerScroll } from "@/components/ui/ContainerScroll";
import { motion, useInView } from "framer-motion";

export default function HomePage() {
  const { activeExchange, selectedPair } = useExchangeStore();
  useEffect(() => {
    // If we have a venue and a symbol, tell the manager to connect
    if (activeExchange && selectedPair) {
      WebSocketManager.connect(activeExchange as Venue, selectedPair);
    }
    return () => {
      WebSocketManager.disconnect();
    };
  }, [activeExchange, selectedPair]);


  const contentRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(contentRef, { once: true, amount: 0.2 }); 

  return (
    <div className="min-h-screen bg-neutral-900 text-white">

      <ContainerScroll
        titleComponent={
          <div className="text-center">
            <p className="mt-4 text-2xl text-neutral-400">Scroll to simulate and visualize real-time crypto orders.</p>
            <h1 className="text-4xl font-bold md:text-8xl text-white/80 mb-6">Welcome to GoQuant</h1>
          </div>
        }
      >
        {/* Content inside the animated card (e.g., a teaser or mockup) */}
        <div className="h-full w-full flex items-center justify-center text-neutral-300">
          {/* Example: Add an image, video, or simple text teaser */}
          <img src="/teaser.png" alt="App Teaser" className="max-h-full rounded-lg" /> {/* Replace with your asset */}
        </div>
      </ContainerScroll>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 h-full p-4">
        {/* --- LEFT COLUMN (Visualizations) --- */}
        <div className="flex flex-col">
          <GridItem
            icon={<BarChart3 className="h-5 w-5 text-neutral-400" />}
            title="Multi-Venue Orderbook"
            description={
              <div className="flex flex-col h-full">
                <div className="flex-grow">
                  <OrderBookChart />
                </div>
                <div className="h-[40vh] lg:h-1/2 border-t border-neutral-800 flex flex-col">
                  <h3 className="text-lg font-semibold text-neutral-300 px-4 pt-12 pb-4 text-center">
                    Market Depth
                  </h3>
                  <div className="flex-grow">
                    <DepthChart />
                  </div>
                </div>
              </div>
            }
            infoDescription="This area shows live buy and sell offers from different trading platforms, like a price list in a marketplace. It displays up to 15 top offers with activity bars and stats like price gaps and balance. Below, a chart stacks offers to show market depth, updating in real time."

          />
        </div>

        {/* --- RIGHT COLUMN (Interaction & History) --- */}
        <div className="flex flex-col gap-8">
          <GridItem
            icon={<Settings className="h-5 w-5 text-neutral-400" />}
            title="Order Simulation"
            description={<OrderSimulationForm />}
            infoDescription="This form lets you simulate buy or sell orders, choosing type (limit or market), side, price, amount, and delay. It previews results, saves them, and shows a quick note , great for practicing trades safely."
          />
          <GridItem
            icon={<Lock className="h-5 w-5 text-neutral-400" />}
            title="Order Impact Analysis"
            description={<OrderImpactMetrics />}
            infoDescription="Get a simple check on how your simulated order might affect prices, including slippage, fill rate, average cost, and risk warnings based on current market data."
          />
          <GridItem
            icon={<Sparkles className="h-5 w-5 text-neutral-400" />}
            title="Order History"
            description={<OrderHistory />}
            infoDescription="A table of your pretend trades, listing time, item, buy/sell, price, and amount. Shows 6 at a time with buttons for older ones, for easy review."
          />
        </div>
      </div>
    </div>
  );
}

interface GridItemProps {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  infoDescription: string; 
}

const GridItem = ({ icon, title, description, infoDescription }: GridItemProps) => {
  return (
    <div className="h-full">
      <div className="relative h-full rounded-2xl p-2 md:rounded-3xl md:p-3">
        <GlowingEffect blur={1} borderWidth={3} spread={80} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
        <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
    
          <div className="absolute top-4 right-4 z-20 group"> 
            <Info className="w-4 h-4 text-neutral-400 hover:text-neutral-200 cursor-help" />
            <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg text-xs text-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              {infoDescription}
            </div>
          </div>

          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="flex gap-3 justify-center items-center">
              <div className="w-fit rounded-lg border border-gray-100 p-1.5">{icon}</div>
              <h3 className="pt-0.5 font-sans text-md font-semibold dark:text-white">{title}</h3>
            </div>
            <div className="flex-1 mt-4">{description}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
