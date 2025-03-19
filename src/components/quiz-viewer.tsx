"use client"

import { z } from "zod";
import { useState } from "react";

import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { useQuiz } from "@/contexts/quiz-provider";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { QuizResultsDialog } from "./quiz-results-dialog";
import { FormSchema, useQuizForm } from "@/contexts/quiz-form-provider";


export default function QuizViewer() {
  const [score, setScore] = useState<number>(0);
  const [isScoreDialogOpen, setIsScoreDialogOpen] = useState(false);

  const { form } = useQuizForm();

  const { quiz } = useQuiz();

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    async function evaluateQuiz() {
      const response = await fetch("/api/evaluate-quiz", {
        method: "POST",
        body: JSON.stringify({ quiz, answers: data }),
        headers: {
            "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
          throw new Error("Failed to evaluate quiz");
      }
  
      const score = await response.json();
      setScore(score.score);
      setIsScoreDialogOpen(true);
    }

    evaluateQuiz();
  }

  return (
    <>
      <h1 className="font-bold text-2xl tracking-wide">Try the generated quiz below!</h1>
      <QuizResultsDialog score={score} isScoreDialogOpen={isScoreDialogOpen} setIsScoreDialogOpen={setIsScoreDialogOpen} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-center" >
          <div>
            {quiz.quiz.map((question, index) => (
              <div key={`question-${index}`} className="my-4">
                <h2>{question.question}</h2>
                <FormField
                  control={form.control}
                  name={`question-${index}`}
                  render={({field}) => (
                    <FormItem>
                      <FormControl>
                        {question.choices && question.choices.length ? (
                          <Select key={`question-${index}`} {...field} onValueChange={async (value) => await form.setValue(`question-${index}`, value)} value={form.watch(`question-${index}`) || ""}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an answer" />
                            </SelectTrigger>
                            <SelectContent>
                                {question.choices.map((choice: string, choiceIndex: number) => (
                                  <SelectItem key={`choice-${choiceIndex}`} value={choice}>{choice}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            placeholder="Enter your answer here"
                            {...field}
                            onChange={async (e) => await form.setValue(`question-${index}`, e.target.value)}
                            value={form.watch(`question-${index}`) || ""}
                          />)}
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>
          <Button type="submit" className="m-4">Submit</Button>
        </form>
      </Form>
    </>
  )
}