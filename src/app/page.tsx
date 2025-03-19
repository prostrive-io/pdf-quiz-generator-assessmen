"use client";

import Questions from "@/components/Questions";
import Uploader from "@/components/Uploader";
import { Question } from "@/lib/schema";
import { useState } from "react";

export default function Home() {
  const [questions, setQuestions] = useState<Question[] | undefined>();

  return (
    <div className="flex flex-col items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl font-bold">PDF Quiz Generator</h1>
      <Uploader setQuestions={setQuestions} />
      <Questions questions={questions} setQuestions={setQuestions} />
    </div>
  );
}
