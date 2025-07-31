import { create } from "zustand";

// This type defines what a "pending" order looks like as you type it
export type PendingOrder = {
  type: 'Market' | 'Limit';
  side: 'Buy' | 'Sell';
  price?: number;
  quantity?: number;
};

// This interface defines the shape of our new store's state
interface SimulationState {
  pendingOrder: PendingOrder | null; // It can hold one pending order, or be null
  setPendingOrder: (order: PendingOrder | null) => void; // An action to update it
}

// This creates the actual store
export const useSimulationStore = create<SimulationState>((set) => ({
  pendingOrder: null,
  setPendingOrder: (order) => set({ pendingOrder: order }),
}));