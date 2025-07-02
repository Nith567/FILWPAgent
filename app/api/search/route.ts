import { NextResponse } from "next/server";
import { getContentStore } from "../send/route";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ message: "Query parameter 'q' is required." }, { status: 400 });
    }

    const contentStore = getContentStore();
    
    // Simple search implementation - in production, use a proper search engine
    const results = contentStore.filter(content => {
      const searchText = query.toLowerCase();
      const contentText = `${content.summary} ${content.tags.join(' ')} ${content.title}`.toLowerCase();
      return contentText.includes(searchText);
    });

    return NextResponse.json({
      results,
      total: results.length
    });
  } catch (error) {
    console.error("Error in /api/search:", error);
    return NextResponse.json({
      message: "An internal server error occurred.",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 