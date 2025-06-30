import { NextRequest, NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export async function POST(req: NextRequest) {
    const { transcript_text } = await req.json();

    if (!transcript_text) {
        return NextResponse.json(
            { error: "Transcript text is required" },
            { status: 400 }
        );
    }

    const prompt = `
    Based on the provided English transcript, generate a structured JSON output. The JSON must contain a single main field: 'analysis'.

    **CRITICAL RULE:** All string values within the JSON output MUST have internal double quotes properly escaped with a backslash (e.g., "He said, \"Hi!\""). This is essential for valid JSON.

    The 'analysis' field must be an object containing:
    - 'summary': A concise summary of the video content in KOREAN (1-2 sentences).
    - 'keywords': An array of 5 key English terms that would be useful for a learner.
    - 'slang_expressions': An array of objects, where each object has an 'expression' (the English slang/idiom) and a 'meaning' (its explanation in KOREAN).
    - 'main_questions': An array of 2 *single, concise, and simple* questions in ENGLISH based on the video's content, designed to encourage speaking practice.

    Ensure the entire output is a single, strictly valid JSON object.
    `;

    try {
        const geminiRequestBody = {
            contents: [
                {
                    parts: [
                        { text: prompt },
                        { text: `Transcript: \"\"\"${transcript_text}\"\"\"` },
                    ],
                },
            ],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        analysis: {
                            type: "OBJECT",
                            properties: {
                                summary: { type: "STRING" },
                                keywords: {
                                    type: "ARRAY",
                                    items: { type: "STRING" },
                                },
                                slang_expressions: {
                                    type: "ARRAY",
                                    items: {
                                        type: "OBJECT",
                                        properties: {
                                            expression: { type: "STRING" },
                                            meaning: { type: "STRING" },
                                        },
                                        propertyOrdering: [
                                            "expression",
                                            "meaning",
                                        ],
                                    },
                                },
                                main_questions: {
                                    type: "ARRAY",
                                    items: { type: "STRING" },
                                },
                            },
                            propertyOrdering: [
                                "summary",
                                "keywords",
                                "slang_expressions",
                                "main_questions",
                            ],
                        },
                    },
                    propertyOrdering: ["analysis"],
                },
            },
        };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(geminiRequestBody),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                `Gemini API error: ${
                    errorData?.error?.message || response.statusText
                }`
            );
        }

        const data = await response.json();
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textContent) {
            throw new Error("No analysis content received from Gemini API.");
        }

        let analysis;
        try {
            const cleanedText = textContent.replace(/```json|```/g, "").trim();
            analysis = JSON.parse(cleanedText);
        } catch (parseError: any) {
            console.error(
                "[ANALYZE_TRANSCRIPT_PARSE_ERROR] Failed to parse Gemini JSON response:",
                parseError.message
            );
            console.error(
                "[ANALYZE_TRANSCRIPT_PARSE_ERROR] Problematic textContent:",
                textContent
            );
            throw new Error(
                "AI가 생성한 분석 데이터의 형식이 올바르지 않습니다."
            );
        }

        return NextResponse.json(analysis, { status: 200 });
    } catch (error: any) {
        console.error("[ANALYZE_TRANSCRIPT_API_ERROR]", error);
        return NextResponse.json(
            {
                error:
                    error.message ||
                    "An unknown internal server error occurred.",
            },
            { status: 500 }
        );
    }
}
