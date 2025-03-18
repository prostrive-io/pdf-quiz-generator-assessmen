'use client'

import React, { useState } from 'react'
import UploadPDF from './upload-pdf'
import { Button } from './ui/button'
import { extractTextFromPDF } from '@/lib/utils'
import { Quiz } from '@/types'

const PDFQuiz = () => {
    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const [quiz, setQuiz] = useState<Quiz  | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateQuiz = async () => {
        if(!pdfFile) {
            alert("Please upload a PDF First.");
            return;
        }

        setLoading(true);
        setError(null);

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
      
        try {
          
        } catch (err) {
          console.error('Quiz Generation Error:', err);
          setError('An error occurred while generating the quiz.');
        } finally {
          setLoading(false);
        }
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
                JSON.stringify(quiz)
            )}

        </div>
    )
}

export default PDFQuiz