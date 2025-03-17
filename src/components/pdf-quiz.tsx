'use client'

import React, { useState } from 'react'
import UploadPDF from './upload-pdf'
import { Button } from './ui/button'
import { extractTextFromPDF } from '@/lib/utils'

const PDFQuiz = () => {
    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const [extractedText, setExtractedText] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    const handleExtractText = async () => {
        if(!pdfFile) {
            alert("Please upload a PDF First.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
          const text = await extractTextFromPDF(pdfFile);
          setExtractedText(text);
        } catch (err) {
            console.error("Error extracting text:", err);
          setError("Failed to extract text. Please try again.");
        } finally {
          setLoading(false);
        }
    }

    return (
        <div className='p-6 space-y-12'>
            <h1 className="text-4xl font-bold">PDF Quiz Generator</h1>
            <UploadPDF onFileSelect={setPdfFile}/>
            <Button onClick={handleExtractText} disabled={!pdfFile || loading}>
                {loading ? "Extracting..." : "Extract Text"}
            </Button>

        
            {error && <p className="text-red-500">{error}</p>}
            {extractedText && (
                <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <h2 className="text-lg font-semibold">Extracted Text:</h2>
                <p className="text-sm whitespace-pre-line">{extractedText}</p>
                </div>
            )}
        </div>
    )
}

export default PDFQuiz