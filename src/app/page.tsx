"use client"

import PdfForm from "@/components/pdf-form";
import QuizViewer from "@/components/quiz-viewer";
import { useQuiz } from "@/contexts/quiz-provider";
import { Quiz } from "@/types/quiz";

export default function Home() {
  const { quiz } = useQuiz();
  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
     <h1 className="text-4xl font-bold tracking-wide text-center">PDF Quiz Generator</h1>
     <PdfForm />
     {(quiz as unknown as Quiz).quiz.length ? <QuizViewer /> : null}
    </div>
  );
}
