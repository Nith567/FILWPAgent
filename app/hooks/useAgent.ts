import { useState } from "react";
import { AgentRequest, AgentResponse, UploadRequest, UploadResponse, SearchResponse } from "../types/api";

/**
 * Sends a user message to the AgentKit backend API and retrieves the agent's response.
 *
 * @async
 * @function messageAgent
 * @param {string} userMessage - The message sent by the user.
 * @returns {Promise<string | null>} The agent's response message or `null` if an error occurs.
 *
 * @throws {Error} Logs an error if the request fails.
 */
async function messageAgent(userMessage: string): Promise<string | null> {
  try {
    const response = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage } as AgentRequest),
    });

    const data = (await response.json()) as AgentResponse;
    return data.response ?? data.error ?? null;
  } catch (error) {
    console.error("Error communicating with agent:", error);
    return null;
  }
}

/**
 * Uploads content to FileCoin Fed for monetization.
 *
 * @async
 * @function uploadContent
 * @param {UploadRequest} uploadData - The content to upload.
 * @returns {Promise<UploadResponse | null>} The upload response or `null` if an error occurs.
 */
async function uploadContent(uploadData: UploadRequest): Promise<UploadResponse | null> {
  try {
    const response = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(uploadData),
    });

    const data = (await response.json()) as UploadResponse;
    return data;
  } catch (error) {
    console.error("Error uploading content:", error);
    return null;
  }
}

/**
 * Searches for content in FileCoin Fed.
 *
 * @async
 * @function searchContent
 * @param {string} query - The search query.
 * @returns {Promise<SearchResponse | null>} The search results or `null` if an error occurs.
 */
async function searchContent(query: string): Promise<SearchResponse | null> {
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = (await response.json()) as SearchResponse;
    return data;
  } catch (error) {
    console.error("Error searching content:", error);
    return null;
  }
}

/**
 * This hook manages interactions with the AI agent and FileCoin Fed content system.
 * It handles chat messages, content uploads, and content searches.
 *
 * #### How It Works
 * - `sendMessage(input)` sends a message to `/api/agent` and updates state.
 * - `uploadContent(data)` uploads content to `/api/upload` for monetization.
 * - `searchContent(query)` searches content via `/api/search`.
 * - `messages` stores the chat history.
 * - `isThinking` tracks whether the agent is processing a response.
 *
 * @returns {object} An object containing:
 * - `messages`: The conversation history.
 * - `sendMessage`: A function to send a new message.
 * - `uploadContent`: A function to upload content for monetization.
 * - `searchContent`: A function to search for content.
 * - `isThinking`: Boolean indicating if the agent is processing a response.
 */
export function useAgent() {
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "agent" }[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  /**
   * Sends a user message, updates local state, and retrieves the agent's response.
   *
   * @param {string} input - The message from the user.
   */
  const sendMessage = async (input: string) => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { text: input, sender: "user" }]);
    setIsThinking(true);

    const responseMessage = await messageAgent(input);

    if (responseMessage) {
      setMessages(prev => [...prev, { text: responseMessage, sender: "agent" }]);
    }

    setIsThinking(false);
  };

  /**
   * Uploads content for monetization on FileCoin Fed.
   *
   * @param {UploadRequest} uploadData - The content to upload.
   */
  const uploadContentToFed = async (uploadData: UploadRequest) => {
    setIsThinking(true);
    const result = await uploadContent(uploadData);
    setIsThinking(false);
    return result;
  };

  /**
   * Searches for content in FileCoin Fed.
   *
   * @param {string} query - The search query.
   */
  const searchContentInFed = async (query: string) => {
    setIsThinking(true);
    const result = await searchContent(query);
    setIsThinking(false);
    return result;
  };

  return { 
    messages, 
    sendMessage, 
    uploadContent: uploadContentToFed,
    searchContent: searchContentInFed,
    isThinking 
  };
}
