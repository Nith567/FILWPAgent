"use client";

import { WagmiProvider } from "wagmi";
import { filecoinCalibration } from "wagmi/chains";
import { http, createConfig } from "@wagmi/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ConfettiProvider } from "@/providers/ConfettiProvider";

const queryClient = new QueryClient();

const config = createConfig({
  chains: [filecoinCalibration],
  connectors: [],
  transports: {
    [filecoinCalibration.id]: http(),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ConfettiProvider>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={config}>
            <RainbowKitProvider
              modalSize="compact"
              initialChain={filecoinCalibration.id}
            >
              {children}
            </RainbowKitProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </ConfettiProvider>
    </ThemeProvider>
  );
} 