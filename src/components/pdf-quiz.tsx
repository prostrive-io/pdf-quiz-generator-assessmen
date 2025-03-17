'use client'

import React, { useState } from 'react'
import UploadPDF from './upload-pdf'
import { Button } from './ui/button'

const PDFQuiz = () => {
    const [pdfFile, setPdfFile] = useState<File | null>(null)

    const handleUpload = () => {
        if(!pdfFile) {
            alert("Please upload a PDF First.");
            return;
        }

        console.log("Processing PDF", pdfFile)
    }

    return (
        <div className='p-6 space-y-12'>
            <h1 className="text-4xl font-bold">PDF Quiz Generator</h1>
            <UploadPDF onFileSelect={setPdfFile}/>
            <Button onClick={handleUpload} disabled={!pdfFile}>Generate Quiz</Button>
        </div>
    )
}

export default PDFQuiz