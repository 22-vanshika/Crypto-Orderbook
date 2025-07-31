import ResizableNavbar from "@/components/ui/ResizableNavbar";
import "../styles/globals.css";
import { Vortex } from "@/components/ui/Vortex";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Real-Time Orderbook Viewer",
  description: "Simulate and visualize crypto orders in real-time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="text-white">
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#18181b',
              color: '#f4f4f5',
              border: '1px solid #3f3f46',
            },
          }}
        />
        <div className="relative min-h-screen w-full overflow-hidden">
          <Vortex
            backgroundColor="black"
            rangeY={800}
            particleCount={15}
            baseHue={60}
            containerClassName="fixed inset-0 w-full h-full z-0"
            className="w-full h-full"
          />
          <ResizableNavbar />
          <main className="flex-1 overflow-y-auto pb-1 py-4 pt-16 md:pt-[100px] lg:p-16 lg:pt-24">{children}</main>
        </div>
      </body>
    </html>
  );
}
