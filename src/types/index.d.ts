
export type Quiz = {
    questions: QuizQuestion[];
};
  
export type QuizQuestion = {
    question: string;
    choices: string[];
    correct_answer: string;
};