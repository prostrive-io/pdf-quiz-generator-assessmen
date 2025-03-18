import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getDocument, PDFDocumentProxy,  } from "pdfjs-dist";

import "@/lib/pdf-worker-setup";
import { TextContent, TextItem } from "pdfjs-dist/types/src/display/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export async function extractTextFromPDF(file: File): Promise<string> {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const pdf: PDFDocumentProxy = await getDocument({ data: arrayBuffer }).promise;
        let text = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content: TextContent = await page.getTextContent();
          text += content.items
            .filter((item): item is TextItem => "str" in item) 
            .map((item:TextItem) => item.str)
            .join(" ") + "\n";
        }

        resolve(text);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}