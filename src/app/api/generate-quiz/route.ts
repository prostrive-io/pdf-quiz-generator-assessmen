import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { Quiz } from "@/types/quiz";

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 1
});

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        const formatInstructions = `Respond only in valid JSON. The JSON object you return should match the following schema:
        {{ quiz: [{{ question: "string", choices: "array of string", answer: "string" }}] }}

        Where quiz is an array of objects, each with question and answer, and optionally, choices fields.
        `;

        const parser = new JsonOutputParser<Quiz>();

        const prompt = await ChatPromptTemplate.fromMessages([
            [
                "system",
                "Generate a 5-question quiz based on the following text. Include multiple-choice and short-answer questions. Wrap the output in `json` tags\n{format_instructions}",
            ],
            [
                "human",
                "{text}",
            ]
        ]).partial({
            format_instructions: formatInstructions,
        })

        const chain = prompt.pipe(model).pipe(parser);
        const response = await chain.invoke({ text });

        return new NextResponse(JSON.stringify(response), { status: 200 });
    } catch (error) {
        console.log("[GENERATE POST]", error);
        return new NextResponse("Failed to generate quiz", { status: 500 });
    }
}