import { QuizSchema } from "@/lib/schema";
import { NextResponse } from "next/server";
import OpenAI from "openai";
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const data = await req.json();
  const text = data.text;

  if (!text) {
    return NextResponse.json(
      { error: "Please select a valid PDF file." },
      { status: 400 }
    );
  }
  const prompt = `Generate 5 multiple-choice questions based on the following text. The response should be in valid JSON format, following this structure:
  type Options = {
    letter: string,
    value: string
  }
  
  type Question = {
    question: string,
    options: Options[],
    answer: string
  }

  Return the response data in a valid JSON inside an object
  - {"quiz": Question[]}
  - The answer should be the letter of the correct option
  
  The text to use for generating the question is as follows:
  ${text}
  `;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "developer", content: prompt }],
    });
    const result = JSON.parse(completion.choices[0].message.content || "{}");

    // Validate returned json
    const validation = QuizSchema.safeParse(result);

    if (validation.error) {
      return NextResponse.json(
        { error: "Generated quiz has invalid format" },
        { status: 500 }
      );
    }

    return NextResponse.json(validation.data);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error generating quiz" },
      { status: 500 }
    );
  }
}
