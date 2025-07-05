"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useAccount } from "wagmi";
import { useContract } from "./hooks/useContract";
import { ConnectWalletButton } from "../component/ConnectWalletButton";

interface ContentResult {
  summary: string;
  tags: string; // JSON string
  hash: string;
  download: string;
  title: string;
  wallet_address: string;
  amount: string;
  contractAddress: string;
  timestamp: string;
}

/**
 * FILWPAgent - Content Monetization Platform
 *
 * @returns {React.ReactNode} The home page
 */
export default function Home() {
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState<ContentResult[]>([]);
  const [contentMap, setContentMap] = useState<Record<string, string>>({}); // hash -> content
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<string[]>([]); // Store user messages
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const account = useAccount();

  // Automatically trigger claimAccessContent for the top result
  useEffect(() => {
    if (
      searchResults.length > 0 &&
      account.address &&
      searchResults[0].contractAddress &&
      searchResults[0].amount
    ) {
      claimAccessContent(
        account.address
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResults, account.address]);

  // Use the contract hook for the top result
  const {
    claimAccessContent,
    isApprovePending,
    isApprovalConfirming,
    isApprovalConfirmed,
    isPurchasePending,
    isPurchaseConfirming,
    isPurchaseConfirmed,
    error,
  } = useContract(
    searchResults[0]?.contractAddress || "",
    searchResults[0]?.amount || "0"
  );

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [searchResults, contentMap, messages]);

  async function searchContent(query: string) {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  }

  // Fetch content from IPFS for all search results
  async function fetchAllContents(results: ContentResult[]) {
    const newContentMap: Record<string, string> = {};
    await Promise.all(
      results.map(async (content) => {
        if (content.download) {
          try {
            const res = await fetch(content.download);
            const text = await res.text();
            newContentMap[content.hash] = text;
          } catch {
            newContentMap[content.hash] = "Failed to fetch content.";
          }
        } else {
          newContentMap[content.hash] = "No download link.";
        }
      })
    );
    setContentMap(newContentMap);
  }

  const onSendMessage = async () => {
    if (!input.trim() || isThinking) return;
    setIsThinking(true);
    setSearchResults([]);
    setContentMap({});
    setMessages((prev) => [...prev, input]); // Add user message
    const results = await searchContent(input);
    setIsThinking(false);
    setSearchResults(results);
    if (results.length > 0) {
      fetchAllContents(results);
    }
    setInput("");
  };

  // Helper to render tags safely
  function renderTags(tags: unknown) {
    if (Array.isArray(tags)) return tags.join(", ");
    try {
      const parsed = JSON.parse(tags as string);
      if (Array.isArray(parsed)) return parsed.join(", ");
      return String(parsed);
    } catch {
      return String(tags);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <ConnectWalletButton />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl">
            {/* Chat/Search Messages */}
            <div className="h-[70vh] overflow-y-auto p-6 space-y-4">
              {/* Show user messages as chat bubbles */}
              {messages.map((msg, idx) => (
                <div key={idx} className="flex justify-end">
                  <div className="max-w-[80%] p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {msg}
                  </div>
                </div>
              ))}

              {searchResults.length === 0 && !isThinking && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Welcome to FILWPAgent</h3>
                  <p className="text-gray-300 mb-4">
                    Reward Creators and consume the content with Filecoin Network Storage!
                  </p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-bold mb-2">Search Results</h3>
                  {/* Show transaction status */}
                  <div className="mb-4">
                    {isApprovePending && <div>Approving token transfer...</div>}
                    {isApprovalConfirming && <div>Waiting for approval confirmation...</div>}
                    {isApprovalConfirmed && !isPurchaseConfirmed && <div>Approval confirmed. Purchasing access...</div>}
                    {isPurchasePending && <div>Purchasing access...</div>}
                    {isPurchaseConfirming && <div>Waiting for purchase confirmation...</div>}
                    {isPurchaseConfirmed && <div>Access purchased! Showing content below.</div>}
                    {error && <div className="text-red-400">{error}</div>}
                  </div>
                  {searchResults.map((content, idx) => (
                    <div key={idx} className="p-4 mb-4 bg-white/10 rounded-xl">
                      <div><strong>Title:</strong> {content.title}</div>
                      <div><strong>Summary:</strong> {content.summary}</div>
                      <div><strong>Blog Tags:</strong> {renderTags(content.tags)}</div>
                      <div><strong>Amount to be paid for Creator:</strong> {content.amount} USDFC</div>
                      <div>
                        <strong>Contract Address:</strong>{' '}
                        <a
                          href={`https://filecoin-testnet.blockscout.com/address/${content.contractAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-sm text-blue-300 underline hover:text-blue-200"
                        >
                          {content.contractAddress}
                        </a>
                      </div>
                      <div><strong>Wallet Address:</strong> <span className="break-all text-sm">{content.wallet_address}</span></div>
                      <div><strong>Timestamp:</strong> {content.timestamp}</div>
                      {isPurchaseConfirmed && (
                        <div className="mt-4 p-4 bg-white/10 rounded-lg">
                          <strong className="text-green-300 block mb-2">Content:</strong>
                          <strong className="text-green-300 block mb-2">Proof of Log Hash: {content.hash}</strong>
                          <ReactMarkdown>{contentMap[content.hash] || "Loading..."}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Thinking Indicator */}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-gray-300">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Invisible div to track the bottom */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <div className="p-6 border-t border-white/10">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  className="flex-grow p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search for monetized content..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && onSendMessage()}
                  disabled={isThinking}
                />
                <button
                  onClick={onSendMessage}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    isThinking
                      ? "bg-gray-600 cursor-not-allowed text-gray-400"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                  }`}
                  disabled={isThinking}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
