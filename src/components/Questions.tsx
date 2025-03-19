import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { Button } from "./ui/button";
import { Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { toast } from "sonner";
import { Question } from "@/lib/schema";

interface QuestionsProps {
  questions: Question[] | undefined;
  setQuestions: (questions: Question[] | undefined) => void;
}

export default function Questions({ questions, setQuestions }: QuestionsProps) {
  const [showResult, setShowResult] = useState(false);
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(0);
  if (!questions) {
    return null;
  }

  const handleSelectAnswer = (index: number, choice: string) => {
    if (!questions) {
      toast("Error", { description: "Invalid question data" });
      return;
    }
    const temp = questions.map((question, i) => {
      if (i === index) {
        return { ...question, choice };
      }
      return question;
    });

    setQuestions(temp);
  };

  const handleSubmitAnswer = () => {
    // Check if all questions are answered
    if (questions.some((question) => question.choice === undefined)) {
      toast("Please answer all questions");
      return;
    }

    // Get score
    setScore(
      questions.reduce((acc, question) => {
        if (question.choice === question.answer) {
          return acc + 1;
        }
        return acc;
      }, 0)
    );
    setOpen(true);
    setShowResult(true);
  };

  const getAnswer = (question: Question) => {
    return question.options.find((option) => option.letter === question.answer)
      ?.value;
  };

  return (
    <div className="w-full max-w-xl">
      {showResult && (
        <div className="text-center mb-5">
          <h1 className="font-bold text-xl">
            Score: {score}/{questions.length}
          </h1>
          <p>Congratulations on completing the quiz!</p>
        </div>
      )}
      {questions.map((question, index) => (
        <div key={index} className="flex flex-col gap-4 mb-6">
          <h2 className="text-xl font-bold">
            {index + 1}. {question.question}
          </h2>
          <RadioGroup
            id={`rg-${index + 1}`}
            className="flex flex-col gap-2 ml-4"
            onValueChange={(value) => handleSelectAnswer(index, value)}
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <RadioGroupItem id={option.letter} value={option.letter} />
                <label htmlFor={option.letter}>{option.value}</label>
              </div>
            ))}
          </RadioGroup>
          {showResult && (
            <p className="flex flex-row gap-2 font-bold">
              {question.choice === question.answer ? (
                <Check className="text-green-500" />
              ) : (
                <X className="text-red-500" />
              )}
              Correct Answer:{" "}
              <span className="font-normal">{getAnswer(question)}</span>
            </p>
          )}
        </div>
      ))}
      <Button type="button" onClick={handleSubmitAnswer}>
        Submit
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Congratulations</DialogTitle>
            <DialogDescription></DialogDescription>
            <div className="w-full flex flex-col items-center justify-center">
              <span>Congratulations on completing the quiz. Good job!</span>
              <h2 className="text-xl font-bold">
                Score: {score} / {questions.length}
              </h2>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
