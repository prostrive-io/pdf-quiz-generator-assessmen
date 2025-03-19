"use client";

import { Quiz } from "@/types/quiz";
import {
    createContext,
    useContext,
    useState,
} from "react";

interface QuizContextType {
    quiz: Quiz;
    setQuiz: (quiz: Quiz) => void;
}

const QuizContext = createContext<QuizContextType>({quiz: {quiz: []}, setQuiz: () => {}})

export function QuizProvider({children}: {children: React.ReactNode}) {
    const [quiz, setQuiz] = useState<Quiz>({quiz: []})

    return (
        <QuizContext.Provider value={{ quiz, setQuiz }}>
            {children}
        </QuizContext.Provider>
    )

}

export const useQuiz = () => useContext(QuizContext);