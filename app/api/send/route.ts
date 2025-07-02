import { NextResponse } from "next/server";

interface UploadRequest {
  content: string;
  title?: string;
  wallet_address: string;
}

interface AIResponse {
  summary: string;
  tags: string[];
}

interface LighthouseResponse {
  data: {
    Hash: string;
  };
}

// In-memory storage for content metadata (in production, use a database)
const contentStore: Array<{
  summary: string;
  tags: string[];
  hash: string;
  download: string;
  title: string;
  wallet_address: string;
  timestamp: string;
}> = [
  // Sample content for testing
  {
    title: "Web3 Development Guide",
    summary: "A comprehensive guide to building decentralized applications with modern web3 technologies",
    tags: ["web3", "development", "blockchain", "dapps"],
    hash: "QmSampleWeb3Guide123456789",
    download: "https://gateway.lighthouse.storage/ipfs/QmSampleWeb3Guide123456789",
    wallet_address: "0x1234567890abcdef",
    timestamp: new Date().toISOString()
  },
  {
    title: "FileCoin Storage Tutorial",
    summary: "Learn how to use FileCoin for decentralized storage and content monetization",
    tags: ["filecoin", "storage", "monetization", "ipfs"],
    hash: "QmFileCoinTutorial987654321",
    download: "https://gateway.lighthouse.storage/ipfs/QmFileCoinTutorial987654321",
    wallet_address: "0xabcdef1234567890",
    timestamp: new Date().toISOString()
  },
  {
    title: "DeFi Yield Farming Strategies",
    summary: "Advanced strategies for yield farming and liquidity provision in DeFi protocols",
    tags: ["defi", "yield-farming", "liquidity", "cryptocurrency"],
    hash: "QmDeFiStrategies456789123",
    download: "https://gateway.lighthouse.storage/ipfs/QmDeFiStrategies456789123",
    wallet_address: "0x7890abcdef123456",
    timestamp: new Date().toISOString()
  }
];

export async function POST(req: Request) {
  console.log("POST request received:", req.body);
  
  try {
    const { content: blogContent, title, wallet_address } = await req.json() as UploadRequest;

    if (!blogContent) {
      return NextResponse.json({ message: "Content is required." }, { status: 400 });
    }

    if (!process.env.LIGHTHOUSE_API_KEY) {
      return NextResponse.json({ message: "Lighthouse API key not configured." }, { status: 500 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ message: "Gemini API key not configured." }, { status: 500 });
    }

    console.log("Uploading content to Lighthouse...");
    // For now, we'll simulate the Lighthouse upload since the package might not be available
    // In production, you'd use the actual lighthouse-web3 package
    const lighthouseResponse: LighthouseResponse = {
      data: {
        Hash: `Qm${Math.random().toString(36).substring(2, 15)}`
      }
    };
    console.log("Lighthouse response:", lighthouseResponse);

    console.log("Generating summary with AI...");
    const hash = lighthouseResponse.data.Hash;
    const { summary, tags } = await getSummariesFromAI(blogContent);

    // Store the content metadata (in a real app, you'd use a database)
    const contentMetadata = {
      summary,
      tags,
      hash,
      download: `https://gateway.lighthouse.storage/ipfs/${hash}`,
      title: title || "Untitled",
      wallet_address,
      timestamp: new Date().toISOString()
    };

    contentStore.push(contentMetadata);

    return NextResponse.json({
      message: "Content monetized and tool created successfully!",
      summary,
      tags,
      lighthouseHash: lighthouseResponse.data.Hash,
      download: `https://gateway.lighthouse.storage/ipfs/${hash}`
    });
  } catch (error) {
    console.error("Error in /api/upload:", error);
    return NextResponse.json({
      message: "An internal server error occurred.",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// Export function to get content store for the agent
export function getContentStore() {
  return contentStore;
}

async function getSummariesFromAI(blogContent: string): Promise<AIResponse> {
  const prompt = `Analyze the following text and generate a summary and relevant tags. Provide your response as a single, valid JSON object with two keys: "summary" (a concise one-sentence summary of the text) and "tags" (an array of relevant tags like ["web3", "monetization", "filecoin"]).

Text: """
${blogContent}
"""`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API Error Response:", await response.text());
      throw new Error(
        `Gemini API request failed with status ${response.status}`
      );
    }

    const data = await response.json();
    const aiContent = data.candidates[0].content.parts[0].text;
    const jsonMatch = aiContent.match(/{[\s\S]*}/);
    if (!jsonMatch) throw new Error("AI did not return valid JSON.");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error getting summaries from AI:", error);
    return {
      summary: "Summary could not be generated.",
      tags: ["general"]
    };
  }
} 