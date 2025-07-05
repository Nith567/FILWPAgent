import { NextResponse } from "next/server";
import { privateKeyToAccount } from "viem/accounts";
import { deployContract } from "../../../utils/deployContract";
import { insertData, FilwpAgentRow } from '../../../utils/tableLand';
import { pinata } from "@/utils/config";

interface UploadRequest {
  content: string;
  title?: string;
  wallet_address: string;
  amount: string;
}

interface AIResponse {
  summary: string;
  tags: string[];
}


export async function POST(req: Request) {
  console.log("POST request received:", req.body);
  
  try {
    const { content: blogContent, title, wallet_address, amount } = await req.json() as UploadRequest;

    if (!blogContent) {
      return NextResponse.json({ message: "Content is required." }, { status: 400 });
    }
    if (!amount) {
      return NextResponse.json({ message: "Amount is required." }, { status: 400 });
    }
    if (!process.env.LIGHTHOUSE_API_KEY) {
      return NextResponse.json({ message: "Lighthouse API key not configured." }, { status: 500 });
    }
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ message: "Gemini API key not configured." }, { status: 500 });
    }
    if (!process.env.PRIVATE_KEY) {
      return NextResponse.json({ message: "Agent private key not configured." }, { status: 500 });
    }

console.log("Uploading content to Pinata...");
const file = new File([blogContent], "blog.txt", { type: "text/plain" });
const pinataResponse = await pinata.upload.private.file(file);
const hash=pinataResponse?.cid;
console.log("Pinata response:", pinataResponse);

    // console.log("Uploading content to Lighthouse...");
    // // Using @lighthouse-web3/sdk for text upload
    // const lighthouseResponse = await lighthouse.uploadText(
    //   blogContent,
    //   process.env.LIGHTHOUSE_API_KEY,
    //   wallet_address
    // );
    // console.log("Lighthouse response:", lighthouseResponse);

    // console.log("Generating summary with AI...");
    // const hash = lighthouseResponse.data.Hash;
    // const fetchResponse = await fetch(
    //   `https://gateway.lighthouse.storage/ipfs/${hash}`
    // );
    // const text = await fetchResponse.text();

    const { data } = await pinata.gateways.private.get(hash);
    const text = typeof data === "string" ? data : "";
    const { summary, tags } = await getSummariesFromAI(text);

   // Initialize WalletProvider from agentkit: https://docs.cdp.coinbase.com/agentkit/docs/wallet-management

    const agentAccount = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
    const contractAddress = await deployContract(hash, amount, agentAccount);
    console.log("Deployed contract address:", contractAddress);

    const contentMetadata: FilwpAgentRow = {
      summary,
      tags: JSON.stringify(tags),
      hash,
      download: hash,
      title: title || "Untitled",
      wallet_address,
      amount,
      contractAddress: contractAddress || "",
      timestamp: new Date().toISOString()
    };

    // Insert into Tableland instead of contentStore.push
    await insertData(contentMetadata);
    console.log("Inserted content into Tableland");

    console.log("Content summary:", summary);
    console.log("Content tags:", tags);

    return NextResponse.json({
      message: "Content monetized successfully!",
      summary,
      tags,
      cid:hash,
      contractAddress
    });
  } catch (error) {
    console.error("Error in /api/send:", error);
    return NextResponse.json({
      message: "An internal server error occurred.",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
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