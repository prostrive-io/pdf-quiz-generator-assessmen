'use client'

import React, { useState } from 'react'
import UploadPDF from './upload-pdf'
import { Button } from './ui/button'
import { extractTextFromPDF } from '@/lib/utils'
import { Quiz, QuizQuestion } from '@/types'
import { Loader2 } from 'lucide-react'

const PDFQuiz = () => {
    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const [quiz, setQuiz] = useState<Quiz  | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    const handleGenerateQuiz = async () => {
        if (!pdfFile) return setError("Please upload a PDF file.")
        if (pdfFile.type !== "application/pdf") return setError("Invalid file type. Please upload a PDF file.")
    
        setLoading(true);
        setError(null);
        setShowResults(false);
        setScore(null);
        setSelectedAnswers({});

        try {
            const extractedText = await extractTextFromPDF(pdfFile);
            if (!extractedText.trim()) throw new Error("No readable text found in the PDF.")

            const response = await fetch('/api/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ extractedText }),
            });

            if (!response.ok) {
                const { error } = await response.json()
                throw new Error(error || "Quiz generation failed.")
            }
        
            const data = await response.json();

            // Validate the API response before updating state
            if (!data.quiz || !Array.isArray(data.quiz.questions)) {
                throw new Error("Invalid quiz format received from API.");
            }

            data.quiz.questions.forEach((q: QuizQuestion, i:number) => {
                if (typeof q.question !== "string" || !Array.isArray(q.choices) || typeof q.answer !== "string") {
                    throw new Error(`Invalid question format at index ${i}`);
                }
            });

            setQuiz(data.quiz);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
      };
      
    const handleAnswerSelect = (questionIndex: number, choice: string) => {
        setSelectedAnswers(prev => ({ ...prev, [questionIndex]: choice }))
    }

    const handleSubmitQuiz = () => {
        if (!quiz) return;

        const correctCount = quiz.questions.reduce((count, question, index) =>
            count + (selectedAnswers[index] === question.answer ? 1 : 0), 0)

        setScore(correctCount)
        setShowResults(true)
    };

    return (
        <div className='max-sm:p-2 p-6 space-y-12'>
            <h1 className="text-4xl font-bold">PDF Quiz Generator</h1>
            <UploadPDF onFileSelect={setPdfFile}/>
            <Button onClick={handleGenerateQuiz} disabled={!pdfFile || loading}>
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating...
                    </>
                ) : (
                    "Generate Quiz"
                )}
            </Button>

        
            {error && <p className="text-red-500">{error}</p>}

            {quiz && (
                <div className="p-4 bg-gray-100 rounded-lg">
                    <h2 className="text-xl font-semibold">Generated Quiz</h2>
                    <div className="space-y-6">
                        {quiz.questions.map((question: QuizQuestion, index: number) => (
                            <div key={index} className="p-4 bg-white shadow rounded-lg">
                                <p className="text-lg font-medium">{index + 1}. {question.question}</p>
                                <div className="mt-2 space-y-2">
                                {Array.isArray(question.choices) ? (
                                    question.choices.map((choice, choiceIndex) => (
                                        <label key={choiceIndex} className="block">
                                            <input
                                                type="radio"
                                                name={`question-${index}`}
                                                value={choice}
                                                disabled={showResults}
                                                checked={selectedAnswers[index] === choice}
                                                onChange={() => handleAnswerSelect(index, choice)}
                                                className="mr-2"
                                            />
                                            {choice}
                                        </label>
                                    ))
                                ) : (
                                    <p className="text-red-500">⚠️ Error: Invalid choices format</p>
                                )}

                                </div>
                                {showResults && (
                                    <p className={`mt-2 font-semibold ${selectedAnswers[index] === question.answer ? 'text-green-600' : 'text-red-600'}`}>
                                        Correct Answer: {question.answer}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {!showResults && (
                        <Button className="mt-4" onClick={handleSubmitQuiz} disabled={Object.keys(selectedAnswers).length < quiz.questions.length}>
                            Submit Quiz
                        </Button>
                    )}

                    {showResults && (
                        <p
                            className={`mt-4 text-xl font-bold ${
                                (score ?? 0) / quiz.questions.length >= 0.8
                                    ? 'text-green-600' // High Score (80%+)
                                    : (score ?? 0) / quiz.questions.length >= 0.5
                                    ? 'text-yellow-500' // Average Score (50%-79%)
                                    : 'text-red-600' // Low Score (<50%)
                            }`}
                        >
                            {(score ?? 0) / quiz.questions.length >= 0.8
                                ? '🎉 Excellent! '
                                : (score ?? 0) / quiz.questions.length >= 0.5
                                ? '🙂 Good effort! '
                                : '😞 Keep practicing! '}
                            Your Score: {score ?? 0} / {quiz.questions.length} 
                            ({(((score ?? 0) / quiz.questions.length) * 100).toFixed(2)}%)
                        </p>
                    )}



                </div>
            )}

        </div>
    )
}

export default PDFQuiz

