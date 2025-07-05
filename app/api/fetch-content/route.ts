import { NextResponse } from "next/server";
import { pinata } from "@/utils/config";

export async function POST(req: Request) {
  try {
    const { hash } = await req.json();
    
    if (!hash) {
      return NextResponse.json({ error: "Hash is required" }, { status: 400 });
    }

        // Get content directly from Pinata
    const res= await pinata.gateways.private.get(hash);
    return NextResponse.json({ content: res.data });
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json({ 
      error: "Failed to fetch content" 
    }, { status: 500 });
  }
} 