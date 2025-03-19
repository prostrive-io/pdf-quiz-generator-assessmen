import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0
  });

export async function POST(req: Request) {
    try {
        let score = 0;
        const { quiz, answers } = await req.json();

        for (let qIndex = 0; qIndex < quiz.quiz.length; qIndex++) {
            const question = quiz.quiz[qIndex];
            const answer = question.answer;
            const userAnswer = answers[`question-${qIndex}`];

            if (question.choices && question.choices.length) {
                if (userAnswer === answer) {
                    score++;
                }
            } else {
                const prompt = await ChatPromptTemplate.fromMessages([
                    [
                        "system",
                        "Evaluate the user's answer to the following question. Return 1 if it is considered correct, and 0 if it is considered incorrect.",
                    ],
                    [
                        "human",
                        `Question: ${question}\n\nAnswer: ${answer}\n\nUser Answer: ${userAnswer}`
                    ]
                ])
                
                const chain = prompt.pipe(model);
                const response = await chain.invoke({ question: question.question, answer, userAnswer });
                score += (Number(response.content));
            }
        }

        return new NextResponse(JSON.stringify({ score }), { status: 200 });
    } catch (error) {
        console.log("[EVALUATE POST]", error);
        return new NextResponse("Failed to evaluate quiz", { status: 500 });
    }
}