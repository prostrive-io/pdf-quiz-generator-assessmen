'use client'

import React, { useState } from 'react'
import { Label } from './ui/label'
import { Input } from './ui/input'

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

        setError(null)
        setSelectedFile(file)
        onFileSelect(file)
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