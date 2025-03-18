'use client'

import React, { useState } from 'react'
import { Label } from './ui/label'
import { Input } from './ui/input'

import "@/lib/pdf-worker-setup";
import { getDocument } from 'pdfjs-dist';
interface UploadPDFProps {
    onFileSelect: (file: File | null) => void
}

const UploadPDF = ({ onFileSelect }: UploadPDFProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if(!file) return

        if(file.type !== 'application/pdf') {
            setError("Only PDF files are allowed.")
            setSelectedFile(null)
            onFileSelect(null)
            return
        }

         // Read PDF page count
         try {
            const reader = new FileReader()
            reader.readAsArrayBuffer(file)
            reader.onload = async () => {
                if (!reader.result) {
                    setError("Failed to read PDF data.")
                    onFileSelect(null)
                    setSelectedFile(null)
                    return
                }

                const uint8Array = new Uint8Array(reader.result as ArrayBuffer)
                
                const pdf = await getDocument({ data: uint8Array }).promise
                if (pdf.numPages > 10) {
                    setError("PDF exceeds the 10-page limit.")
                    onFileSelect(null)
                    setSelectedFile(null)
                } else {
                    setError(null)
                    setSelectedFile(file)
                    onFileSelect(file)
                }
            }
        } catch (err) {
            console.error(err)
            setError("Failed to read PDF.")
            onFileSelect(null)
            setSelectedFile(null)
        }
    }

  return (
    <div className='flex flex-col gap-2 w-full'>
        <Label className='font-medium text-gray-700'>Upload PDF</Label>
        <Input type='file' accept='application/pdf' className='cursor-pointer' onChange={handleFileChange}/>

        {error && <p className='text-red-500 text-sm'>{error}</p>}

        {selectedFile && (
            <p className='text-sm text-gray-700'>Selected: <span>{selectedFile.name}</span></p>
        )}

    </div>
  )
}

export default UploadPDF