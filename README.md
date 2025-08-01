
## Overview
This is a Next.js application that displays real-time orderbooks from OKX, Bybit, and Deribit, with features to simulate orders and visualize their market impact. It includes a dynamic landing page, responsive design, and bonus elements like market depth charts and slippage warnings. Built to meet the assignment requirements for simulating trades safely and educationally.

## Features
- Real-time orderbook display with at least 15 levels of best bids/asks per venue.
- Order simulation form with validation, types (Market/Limit), sides, price, quantity, and delays.
- Visualization of where simulated orders fit in the orderbook, with highlights.
- Impact metrics: fill percentage, slippage estimation, market impact, and warnings.
- Bonus: Market depth chart, imbalance indicators, and responsive UI.
- Live updates via WebSockets with error handling and fallbacks.

## How to Run Locally
1. **Clone the Repository**:  

2. **Install Dependencies**:  
   Navigate to the project folder and run:  
   `npm install`

3. **Set Up Environment Variables**:  
   Create a `.env.local` file in the root and add these (get values from exchange docs):  
`NEXT_PUBLIC_OKX_WSS_URL="wss://ws.okx.com/ws/v5/public"`
`NEXT_PUBLIC_BYBIT_WSS_URL="wss://stream.bybit.com/v5/public/spot"`
`NEXT_PUBLIC_DERIBIT_WSS_URL="wss://www.deribit.com/ws/api/v2"`

`NEXT_PUBLIC_OKX_REST_API="https://www.okx.com/api/v5/public/instruments?instType=SPOT"`
`NEXT_PUBLIC_BYBIT_REST_API="https://api.bybit.com/v5/market/instruments-info?category=spot"`
`NEXT_PUBLIC_DERIBIT_BTC_REST_API="https://www.deribit.com/api/v2/public/get_instruments?currency=BTC&kind=future&expired=false"`
`NEXT_PUBLIC_DERIBIT_ETH_REST_API="https://www.deribit.com/api/v2/public/get_instruments?currency=ETH&kind=future&expired=false"`


4. **Start the App**:  
   Run `npm run dev`. Open http://localhost:3000 in your browser.  
   - The app will connect to exchanges automatically. If data doesn't load, check your internet or env vars.

5. **Build for Production**:  
   Run `npm run build` then `npm start` for a production preview.

Note: Requires Node.js v18+ and a stable internet connection for API/WebSocket access.

## Assumptions Made
- Focused on free/public API endpoints to avoid costs or authentication (e.g., no private keys needed for demo).
- Assumed spot trading pairs (e.g., BTC-USDT) for simplicity; the app can be extended for futures.
- Handled edge cases like no data (shows placeholders) or disconnections (status indicators and fallbacks to hardcoded lists).
- Rate limiting is managed with delays (e.g., 1-2 seconds between fetches) and error retries, assuming standard limits (e.g., Bybit: 10 req/sec).
- Mobile responsiveness prioritizes hiding non-essential elements (e.g., labels) while keeping core functions usable.

## Libraries Used
- **Next.js**: Framework for building the app with server-side rendering and API routes.
- **Framer Motion**: For animations like the landing scroll effect and fade-ins.
- **Recharts**: Charting library for the market depth visualization.
- **Zustand**: Lightweight state management for stores (e.g., orderbook data, simulations).
- **Aceternity UI**: For visual components like container scroll animation, glowing effects, and Vortex background.
- **Lucide React**: Icon library for UI elements (e.g., info icons, arrows).
- **React Hot Toast**: For user notifications (e.g., order submitted).
- **Tailwind CSS**: Styling with responsive utilities and dark theme.

## API Documentation References and Rate Limiting
- **OKX API**: [OKX Docs](https://www.okx.com/docs-v5/) – Used public WebSocket for orderbooks (wss://ws.okx.com:8443/ws/v5/public) and REST for instruments. Rate limit: 10 req/sec; handled with throttling in code.
- **Bybit API**: [Bybit Docs](https://bybit-exchange.github.io/docs/v5/intro) – Public WebSocket (wss://stream.bybit.com/v5/public/spot) and REST for data. Rate limit: 10 req/sec per IP; added retries and fallbacks for overload.
- **Deribit API**: [Deribit Docs](https://docs.deribit.com/) – Public WebSocket (wss://www.deribit.com/ws/api/v2) and REST endpoints. Rate limit: 20 req/sec; code includes delays to stay under limits.

For full details on error handling (e.g., API failures trigger UI warnings), see the services folder in the code.

## Deployment
Deployed on Vercel: (https://crypto-orderbook-sand.vercel.app/). Environment variables are set in Vercel dashboard for production.

If you encounter issues, check the console for logs or contact me.
