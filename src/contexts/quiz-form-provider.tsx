"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

import {
    createContext,
    useContext,
} from "react";

interface QuizFormContextType {
  form: any | undefined;
}

const QuizFormContext = createContext<QuizFormContextType>({form: undefined});

export const FormSchema = z.object({
  "question-0": z.string(),
  "question-1": z.string(),
  "question-2": z.string(),
  "question-3": z.string(),
  "question-4": z.string(),
});

export function QuizFormProvider({children}: {children: React.ReactNode}) {

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  return (
      <QuizFormContext.Provider value={{ form }}>
          {children}
      </QuizFormContext.Provider>
  )

}

export const useQuizForm = () => useContext(QuizFormContext);