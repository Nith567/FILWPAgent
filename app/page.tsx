"use client";

import { useState, useEffect, useRef } from "react";
import { useAgent } from "./hooks/useAgent";
import ReactMarkdown from "react-markdown";

/**
 * FileCoin Fed - Content Monetization Platform
 *
 * @returns {React.ReactNode} The home page
 */
export default function Home() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, isThinking } = useAgent();

  // Ref for the messages container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSendMessage = async () => {
    if (!input.trim() || isThinking) return;
    const message = input;
    setInput("");
    await sendMessage(message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold">F3</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  FileCoin Fed
                </h1>
                <p className="text-sm text-gray-300">Decentralized Content Monetization</p>
              </div>
            </div>
            <div className="text-sm text-gray-300">
              AI-Powered Content Discovery
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl">
            {/* Chat Messages */}
            <div className="h-[70vh] overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Welcome to FileCoin Fed</h3>
                  <p className="text-gray-300 mb-4">
                    Ask me about content, blockchain interactions, or search for monetized content!
                  </p>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>💡 Try: &quot;Search for web3 content&quot;</p>
                    <p>💡 Try: &quot;Show me monetized tutorials&quot;</p>
                    <p>💡 Try: &quot;What blockchain tools are available?&quot;</p>
                    <p>💡 Try: &quot;Find filecoin storage content&quot;</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                          : "bg-white/10 backdrop-blur-sm border border-white/20"
                      }`}
                    >
                      <ReactMarkdown
                        components={{
                          a: props => (
                            <a
                              {...props}
                              className="text-blue-300 underline hover:text-blue-200"
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          ),
                          code: props => (
                            <code
                              {...props}
                              className="bg-black/30 px-2 py-1 rounded text-sm"
                            />
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))
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
                  placeholder="Ask about content, blockchain, or search for monetized content..."
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
