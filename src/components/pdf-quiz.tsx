'use client'

import React, { useState } from 'react'
import UploadPDF from './upload-pdf'
import { Button } from './ui/button'
import { extractTextFromPDF } from '@/lib/utils'
import { Quiz, QuizQuestion } from '@/types'

const PDFQuiz = () => {
    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const [quiz, setQuiz] = useState<Quiz  | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    const handleGenerateQuiz = async () => {
        if(!pdfFile) {
            alert("Please upload a PDF First.");
            return;
        }

        setLoading(true);
        setError(null);
        setShowResults(false);
        setScore(null);
        setSelectedAnswers({});

        try {
            const extractedText = await extractTextFromPDF(pdfFile);

            const response = await fetch('/api/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ extractedText }),
            });
        
            const data = await response.json();
            if (response.ok) {
                setQuiz(data.quiz);
            } else {
                setError(data.error || 'Failed to generate quiz.');
            }
        } catch (err) {
            console.error('Quiz Generation Error:', err);
            setError('An error occurred while generating the quiz.');
        } finally {
            setLoading(false);
        }
      };
      
    const handleAnswerSelect = (questionIndex: number, choice: string) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionIndex]: choice,
        }));
    };

    const handleSubmitQuiz = () => {
        if (!quiz) return;

        let correctCount = 0;
        quiz.questions.forEach((question, index) => {
            if (selectedAnswers[index] === question.correct_answer) {
                correctCount++;
            }
        });

        setScore(correctCount);
        setShowResults(true);
    };

    return (
        <div className='p-6 space-y-12'>
            <h1 className="text-4xl font-bold">PDF Quiz Generator</h1>
            <UploadPDF onFileSelect={setPdfFile}/>
            <Button onClick={handleGenerateQuiz} disabled={!pdfFile || loading}>
                {loading ? "Generating quiz..." : "Generate Quiz"}
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
                                    {question.choices.map((choice, choiceIndex) => (
                                        <label key={choiceIndex} className="block">
                                            <input
                                                type="radio"
                                                name={`question-${index}`}
                                                value={choice}
                                                checked={selectedAnswers[index] === choice}
                                                onChange={() => handleAnswerSelect(index, choice)}
                                                className="mr-2"
                                            />
                                            {choice}
                                        </label>
                                    ))}
                                </div>
                                {showResults && (
                                    <p className={`mt-2 font-semibold ${selectedAnswers[index] === question.correct_answer ? 'text-green-600' : 'text-red-600'}`}>
                                        Correct Answer: {question.correct_answer}
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

