import type { Metadata } from "next";
import "./globals.css";
import { QuizProvider } from "@/contexts/quiz-provider";
import { QuizFormProvider } from "@/contexts/quiz-form-provider";


export const metadata: Metadata = {
  title: "PDF Quiz Generator",
  description: "Generate quizzes from PDFs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QuizFormProvider>
      <QuizProvider>
        <html lang="en">
          <body
            className={`antialiased`}
            >
            {children}
          </body>
        </html>
      </QuizProvider>
    </QuizFormProvider>
  );
}
