"use client";
import { useOrderHistoryStore } from "@/stores/orderHistoryStore";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils"; 
import { ChevronLeft, ChevronRight } from "lucide-react"; 

export default function OrderHistory() {
  const orders = useOrderHistoryStore((state) => state.orders);
  const [isMounted, setIsMounted] = useState(false); // For hydration safety
  const [currentPage, setCurrentPage] = useState(0); // Pagination state
  const pageSize = 5; // Limit to 5 visible orders per page (and fixed slots)

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate paginated data
  const totalPages = Math.ceil(orders.length / pageSize);
  const paginatedOrders = orders.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  // Handlers for pagination
  const goToPrevious = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };
  const goToNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  if (!isMounted) return null; // Prevent hydration mismatch

  return (
    <div className="rounded-xl border border-neutral-700 bg-neutral-900/20 shadow-md overflow-hidden flex flex-col h-full">
     
      <div className="overflow-auto flex-grow">
        <table className="w-full text-xs text-neutral-300">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-500">
              <th className="py-2 px-3 text-left">Time</th>
              <th className="py-2 px-3 text-left">Symbol</th>
              <th className="py-2 px-3 text-left">Side</th>
              <th className="py-2 px-3 text-right">Price</th>
              <th className="py-2 px-3 text-right">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length === 0 ? (
              <tr className="h-8"> 
                <td colSpan={5} className="py-4 text-center text-neutral-500">
                  No orders simulated yet
                </td>
              </tr>
            ) : (
              Array.from({ length: pageSize }).map((_, index) => { //  Always render exactly 6 rows
                const order = paginatedOrders[index];
                if (order) {
                  // Render real order row
                  return (
                    <tr
                      key={order.id}
                      className="h-8 border-b border-neutral-800 last:border-0 hover:bg-neutral-800/50" 
                    >
                      <td className="py-2 px-3">
                        {new Date(order.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2 px-3">{order.symbol}</td>
                      <td className="py-2 px-3">
                        <span
                          className={cn(
                            "font-semibold",
                            order.side === "Buy" ? "text-green-400" : "text-red-400"
                          )}
                        >
                          {order.side}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {order.price?.toFixed(2) ?? 'Market'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {order.quantity?.toFixed(4) ?? 'N/A'}
                      </td>
                    </tr>
                  );
                } else {
                  // Render empty placeholder row to maintain height
                  return (
                    <tr
                      key={`placeholder-${index}`}
                      className="h-8 border-b border-neutral-800/50" 
                    >
                      <td colSpan={5} className="py-2 px-3 text-neutral-700 text-center">
                        &nbsp;
                      </td>
                    </tr>
                  );
                }
              })
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="px-3 py-2 border-t border-neutral-800 flex justify-between items-center text-xs text-neutral-400">
          <button
            onClick={goToPrevious}
            disabled={currentPage === 0}
            title="Previous Page"
            className={cn(
              "p-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50"
            )}
          >
            <ChevronLeft className="w-4 h-4 text-neutral-400 hover:text-neutral-200" />
          </button>
          <span>
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={goToNext}
            disabled={currentPage === totalPages - 1}
            title="Next Page"
            className={cn(
              "p-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50"
            )}
          >
            <ChevronRight className="w-4 h-4 text-neutral-400 hover:text-neutral-200" />
          </button>
        </div>
      )}
    </div>
  );
}

