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
    const prompt = `Generate 5 multiple-choice questions from the following text: "${extractedText}". Each question should have 4 answer choices and indicate the correct answer. Format the response as a JSON object.`;

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
