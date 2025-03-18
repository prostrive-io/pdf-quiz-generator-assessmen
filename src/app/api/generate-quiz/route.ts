import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(req: Request) {
    const data = await req.json();
    const { extractedText } = data

    if (!extractedText) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

  try {
    const prompt = `Generate 5 multiple-choice questions from the following text: "${extractedText}". 

    Each question should be formatted as a JSON object with:
    - "question": (string) The quiz question.
    - "choices": (array of 4 strings) The multiple-choice options.
    - "answer": (string) The correct answer.

    Return the response as a valid JSON array inside an object: { "questions": [ ... ] }. 

    DO NOT use "correct_answer". Always use "answer" as the key for the correct choice.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: 'system', content: prompt }],
      temperature: 0.7,
    });
    
    const quiz = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
}
}
