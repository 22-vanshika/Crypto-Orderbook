import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SimulatedOrder } from "@/types/domain";


interface OrderHistoryState {
  orders: SimulatedOrder[];
  addOrder: (order: SimulatedOrder) => void;
}

export const useOrderHistoryStore = create<OrderHistoryState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) => {
        set((state) => ({ orders: [order, ...state.orders] }));
      },
    }),
    {
      name: 'order-history-storage',// Give it a unique name for localStorage
    }
  )
);