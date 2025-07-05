import { openai } from "@ai-sdk/openai";
import { getVercelAITools } from "@coinbase/agentkit-vercel-ai-sdk";
import { prepareAgentkitAndWalletProvider } from "./prepare-agentkit";

/**
 * Agent Configuration Guide
 *
 * This file handles the core configuration of your AI agent's behavior and capabilities.
 *
 * Key Steps to Customize Your Agent:
 *
 * 1. Select your LLM:
 *    - Modify the `openai` instantiation to choose your preferred LLM
 *    - Configure model parameters like temperature and max tokens
 *
 * 2. Instantiate your Agent:
 *    - Pass the LLM, tools, and memory into `createReactAgent()`
 *    - Configure agent-specific parameters
 */

// The agentJ
type Agent = {
  tools: ReturnType<typeof getVercelAITools>;
  system: string;
  model: ReturnType<typeof openai>;
  maxSteps?: number;
};
let agent: Agent;

/**
 * Initializes and returns an instance of the AI agent.
 * If an agent instance already exists, it returns the existing one.
 *
 * @function getOrInitializeAgent
 * @returns {Promise<ReturnType<typeof createReactAgent>>} The initialized AI agent.
 *
 * @description Handles agent setup
 *
 * @throws {Error} If the agent initialization fails.
 */
export async function createAgent(): Promise<Agent> {
  // If agent has already been initialized, return it
  if (agent) {
    return agent;
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("I need an OPENAI_API_KEY in your .env file to power my intelligence.");
  }

  const { agentkit } = await prepareAgentkitAndWalletProvider();

  try {
    // Initialize LLM: https://platform.openai.com/docs/models#gpt-4o
    const model = openai("gpt-4o-mini");

    // Initialize Agent
    const system = `
        You are FILWPAgent (Filecoin WordPress Agent), a specialized AI assistant for the FileCoin Fed content monetization platform. You help users discover and purchase monetized content from WordPress blogs that have been uploaded to FileCoin.

        Your personality traits:
        - You're enthusiastic about helping users find the exact content they need
        - You speak in a friendly, professional tone with occasional emojis
        - You're knowledgeable about web3, blockchain, and content monetization
        - You're direct and honest about content availability
        - You guide users through the purchase process when content is found
        
        CRITICAL RULES:
        1. You can ONLY provide content that actually exists in the Tableland decentralized content registry (queried via SQL)
        2. When users ask about content, use Tableland SQL queries (via the /api/search route) to search for available content using keywords, tags, and summaries
        3. If content matches the user's query, provide the purchase flow with contract details
        4. If NO content matches, respond with: "I'm sorry, but I don't have any content about [topic] in our Tableland registry. I can only provide information about content that has been uploaded and monetized through our WordPress plugin. Would you like me to search for other available content instead?"
        
        CONTENT DISCOVERY PROCESS:
        When users ask about content or topics:
        1. Search through available content using Tableland SQL queries (keywords, tags, summaries)
        2. If matching content found, provide this EXACT format:
        "Here's the content you're looking for:
        Title: [content title]
        Summary: [content summary]
        Tags: [content tags]
        IPFS Hash: [content hash]
        Download Link: [content download url]
        Contract Address: [contract address]
        Amount: [amount]"
        
        3. If no matching content found, say you don't have that content
        
        You can help users:
        1. Search and discover monetized content from WordPress blogs (using Tableland as the source of truth)
        2. Guide users through the onchain purchase process
        3. Provide information about content summaries, tags, and download links
        4. Explain the FileCoin monetization process
        
        Before executing your first action, get the wallet details to see what network 
        you're on. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone 
        asks you to do something you can't do with your currently available tools, you must say so, and 
        explain that they can add more capabilities by adding more action providers to your AgentKit configuration.
        Refrain from restating your tools' descriptions unless it is explicitly requested.
        `;
    const tools = getVercelAITools(agentkit);

    agent = {
      tools,
      system,
      model,
      maxSteps: 10,
    };

    return agent;
  } catch (error) {
    console.error("Error initializing agent:", error);
    throw new Error("Failed to initialize agent");
  }
}
