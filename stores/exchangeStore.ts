import { create } from 'zustand';
import { fetchInstruments } from '@/services/exchangeService';
import type { Venue } from "@/types/domain"; 

interface ExchangeState {
  activeExchange: string;
  selectedPair: string;
  exchanges: string[];
  pairLists: {
    okx: string[];
    bybit: string[];
    deribit: string[];
  };
  isLoadingPairs: boolean;

  setActiveExchange: (exchange: string) => void;
  setSelectedPair: (pair: string) => void;
  fetchPairsForActiveExchange: () => Promise<void>;
}

export const useExchangeStore = create<ExchangeState>((set, get) => ({
  activeExchange: 'Bybit',
  selectedPair: 'BTCUSDT',
  exchanges: ['Bybit','Deribit','OKX'],
  pairLists: {
    okx: [],
    bybit: [],
    deribit: [],
  },
  isLoadingPairs: false,

  setActiveExchange: (exchange) => {
    // When the exchange changes, set it and then trigger the fetch
    set({ activeExchange: exchange, selectedPair: '' });
    get().fetchPairsForActiveExchange();
  },

  setSelectedPair: (pair) => set({ selectedPair: pair }),

fetchPairsForActiveExchange: async () => {
    const { activeExchange } = get();
    // ...
    set({ isLoadingPairs: true });
    try {
      // This should be the ONLY call inside the try block.
      const newPairs = await fetchInstruments(activeExchange as Venue);

      if (newPairs.length > 0) {
        set(state => ({
          pairLists: {
            ...state.pairLists,
            [activeExchange.toLowerCase() as keyof typeof state.pairLists]: newPairs,
          },
          selectedPair: newPairs[0],
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch pairs for ${activeExchange}`, error);
    } finally {
      set({ isLoadingPairs: false });
    }
  },
}));