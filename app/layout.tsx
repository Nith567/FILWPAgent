import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "../providers/Providers";
import { Navbar } from "../component/ConnectWalletButton";

/**
 * Metadata for the page
 */
export const metadata: Metadata = {
  title: "FILWPAgent - Decentralized Content Monetization",
  description: "Upload, monetize, and discover content on FileCoin with AI-powered search and blockchain integration",
};

/**
 * Root layout for the page
 *
 * @param {object} props - The props for the root layout
 * @param {React.ReactNode} props.children - The children for the root layout
 * @returns {React.ReactNode} The root layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-100 dark:bg-gray-900 dark flex flex-col min-h-screen">
        <Providers>
          <main className="flex-grow">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
