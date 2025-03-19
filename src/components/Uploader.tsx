"use client";

import { Label } from "@radix-ui/react-label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import * as pdfjsLib from "pdfjs-dist";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Question } from "@/lib/schema";
import { Loader } from "lucide-react";
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface UploaderProps {
  setQuestions: (questions: Question[] | undefined) => void;
}

export default function Uploader({ setQuestions }: UploaderProps) {
  const [pdfText, setPdfText] = useState<string | null>();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setLoading] = useState(false);

  const handleTextExtraction = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      toast("Error", {
        description: (
          <p className="text-black">Please select a valid PDF file.</p>
        ),
      });
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    const fileURL = URL.createObjectURL(file);
    const pdf = await pdfjsLib.getDocument(fileURL).promise;

    if (pdf.numPages >= 10) {
      toast("Error", {
        description: (
          <p className="text-black">
            {" "}
            Please select a PDF file with less than 10 pages.
          </p>
        ),
      });
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    let extractedText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      extractedText +=
        textContent.items
          .filter((item) => "str" in item)
          .map((item) => item.str)
          .join(" ") + "\n";
    }
    setPdfText(extractedText);
  };

  const handleQuizGeneration = async () => {
    setLoading(true);
    if (!pdfText) {
      toast("Error", {
        description: (
          <p className="text-black">Please select a valid PDF file.</p>
        ),
      });
      setLoading(false);
      return;
    }

    const response = await fetch("/api/generate-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: pdfText }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      if (error) {
        toast("Error", {
          description: <p className="text-black">{error}</p>,
        });
      } else {
        toast("Error", {
          description: <p className="text-black">Error generating quiz</p>,
        });
      }
      setLoading(false);
      return;
    }

    const result = await response.json();
    setQuestions(result.quiz);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-xl items-center gap-1.5">
      <Label htmlFor="pdf">Upload pdf file</Label>
      <div className="flex w-full items-center space-x-2">
        <Input
          ref={inputRef}
          id="pdf"
          type="file"
          onChange={handleTextExtraction}
        />
        <Button
          type="button"
          onClick={isLoading ? undefined : handleQuizGeneration}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader className="animate-spin" />
              Generating Quiz
            </>
          ) : (
            <>Generate Quiz</>
          )}
        </Button>
      </div>
    </div>
  );
}
