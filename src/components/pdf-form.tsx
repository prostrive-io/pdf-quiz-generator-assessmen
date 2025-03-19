"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import * as pdfjs from "pdfjs-dist";

import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { useQuiz } from "@/contexts/quiz-provider";
import { useQuizForm } from "@/contexts/quiz-form-provider";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

const FormSchema = z.object({
    pdf: z
        .instanceof(File)
        .refine((file) => "application/pdf" === file.type, {
            message: "Invalid file type",
        }),
});

export type PdfPageContent = {
    dir: string;
    fontName: string;
    hasEOL: boolean;
    height: number;
    str: string;
    transform: number[];
    width: number;
};

export default function PdfForm() {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    });

    const { setQuiz } = useQuiz();
    const quizFormProvider = useQuizForm();
    const quizForm = quizFormProvider.form;

    function handleSubmit(data: z.infer<typeof FormSchema>) {
        async function generateQuiz() {
            const buffer = Buffer.from(await data.pdf.arrayBuffer());
            const loadingTask = await pdfjs.getDocument({ data: buffer });
            const pdf = await loadingTask.promise;

            const numPages = await pdf.numPages;
            let textContent = "";

            if (numPages >= 10) {
                throw new Error("PDF must have less than 10 pages");
            }

            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const pageContent = await page.getTextContent();

                const pageText = pageContent.items
                    .map(
                        (item) =>
                            `${(item as PdfPageContent).str}${
                                (item as PdfPageContent).hasEOL ? "\n" : ""
                            }`
                    )
                    .join("");
                textContent += pageText + "\n";
            }

            const response = await fetch("/api/generate-quiz", {
                method: "POST",
                body: JSON.stringify({ text: textContent }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to generate quiz");
            }
            
            const quiz = await response.json();

            setQuiz(quiz);
            
            await quizForm.reset();
        }

        return generateQuiz();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col items-center">
                <FormField
                    control={form.control}
                    name="pdf"
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    render={({ field: { value, onChange, ...props } }) => (
                        <FormItem className="my-4"> 
                            <FormLabel>Upload PDF</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="PDF"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => {
                                        onChange(
                                            e.target.files && e.target.files[0]
                                        );
                                    }}
                                    {...props}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type="submit" className="m-4">Generate Quiz</Button>
            </form>
        </Form>
    );
}
