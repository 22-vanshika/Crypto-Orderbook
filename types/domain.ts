// This file centralizes all of the core data structures for your application.

// -- Core Types --
export type Venue = 'OKX' | 'Bybit' | 'Deribit';
export type Order = [number, number]; // [price, size]

export interface Orderbook {
  bids: Order[];
  asks: Order[];
}

// -- Order Simulation & History Types --

export type SimulatedOrder = {
  id: number;
  venue: string;
  symbol: string;
  type: 'Market' | 'Limit';
  side: 'Buy' | 'Sell';
  price?: number;
  quantity: number;
  status: 'Pending' | 'Executed';
  timestamp: Date;
};

export type PendingOrder = {
  type: 'Market' | 'Limit';
  side: 'Buy' | 'Sell';
  price?: number;
  quantity?: number;
};

export interface SelectOption {
  value: string;
  label: string;
}