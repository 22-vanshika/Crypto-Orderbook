import {
  getWebSocketUrl,
  getSubscriptionMessage,
  getPingMessage,
  transformAndStoreMessage,
} from './exchangeService';
import type { Venue } from "@/types/domain"; 

const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RETRY_DELAY = 1000;
const HEARTBEAT_INTERVAL = 25000; // 25 seconds

let ws: WebSocket | null = null;
let reconnectAttempts = 0;
let heartbeatInterval: NodeJS.Timeout | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;

const WebSocketManager = {
  connect: (venue: Venue, symbol: string) => {
    // Disconnect any existing connection before creating a new one
    WebSocketManager.disconnect();
    
    const url = getWebSocketUrl(venue);
    ws = new WebSocket(url);
    console.log(`Connecting to ${venue} for ${symbol}...`);

    ws.onopen = () => {
      console.log(`WebSocket connected to ${venue}.`);
      reconnectAttempts = 0;
      
      // Subscribe to the order book channel
      const subMessage = getSubscriptionMessage(venue, symbol);
      ws?.send(subMessage);
      
      // Start sending pings to keep the connection alive
      heartbeatInterval = setInterval(() => {
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(getPingMessage(venue));
        }
      }, HEARTBEAT_INTERVAL);
    };

    ws.onmessage = (message) => {
      transformAndStoreMessage(message, venue);
    };

    ws.onclose = () => {
      console.warn(`WebSocket disconnected from ${venue}.`);
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      
      // Attempt to reconnect with exponential backoff
      reconnectAttempts++;
      if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, reconnectAttempts - 1);
        console.log(`Attempting to reconnect in ${delay / 1000}s...`);
        reconnectTimeout = setTimeout(() => WebSocketManager.connect(venue, symbol), delay);
      } else {
        console.error(`Max reconnect attempts reached for ${venue}.`);
      }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for ${venue}:`, error);
      ws?.close(); // Trigger the onclose handler to attempt reconnection
    };
  },

  disconnect: () => {
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (ws) {
      ws.onclose = null; // Prevent the reconnect logic from firing on a manual disconnect
      ws.close();
      ws = null;
      console.log("WebSocket disconnected manually.");
    }
  },
};

export default WebSocketManager;