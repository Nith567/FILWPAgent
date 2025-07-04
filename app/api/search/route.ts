import { NextResponse } from "next/server";
import { db, tableName } from "../../../utils/tableLand";

async function extractKeywordsAI(query: string): Promise<string[]> {
  const prompt = `Extract the most relevant keywords from the following search query. Remove common stopwords, filler words, and words like 'the', 'and', 'of', etc. Return the keywords as a JSON array of strings, e.g., ["ram", "bheem", "adventure"].\n\nQuery: """${query}"""`;

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
      throw new Error(`Gemini API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.candidates[0].content.parts[0].text;
    const jsonMatch = aiContent.match(/\[[^\]]*\]/);
    if (!jsonMatch) throw new Error("AI did not return valid JSON array.");
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error extracting keywords from AI:", error);
    return [];
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ message: "Query parameter 'q' is required." }, { status: 400 });
    }

    // Use AI to extract keywords from the query
    const keywords = await extractKeywordsAI(query);
    if (!keywords.length) {
      return NextResponse.json({ results: [], total: 0 });
    }

    // Build SQL to calculate match_score for each row
    const matchScoreExpr = keywords.map(() => `
      (CASE WHEN LOWER(summary) LIKE ? OR LOWER(tags) LIKE ? OR LOWER(title) LIKE ? THEN 1 ELSE 0 END)
    `).join(' + ');
    const sql = `SELECT *, (${matchScoreExpr}) AS match_score FROM ${tableName} ORDER BY match_score DESC LIMIT 1;`;
    const params: string[] = [];
    for (const word of keywords) {
      const likeWord = `%${word.toLowerCase()}%`;
      params.push(likeWord, likeWord, likeWord);
    }

    const { results } = await db.prepare(sql).bind(...params).all();
    console.log("btw the table query resutls are : ", results);

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