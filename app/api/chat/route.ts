import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, context } = body;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: context },
                { role: "user", content: message },
            ],
            temperature: 0.7,
        });

        const response = completion.choices[0].message.content;

        try {
            // AI 응답을 JSON으로 파싱
            const parsedResponse = JSON.parse(response || "{}");
            return NextResponse.json(parsedResponse, {
                headers: {
                    "Cache-Control": "no-store, must-revalidate",
                    "Content-Type": "application/json",
                },
            });
        } catch {
            // JSON 파싱 실패 시 텍스트 응답만 반환
            return NextResponse.json({
                message: response,
                sceneUpdate: null,
            });
        }
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
