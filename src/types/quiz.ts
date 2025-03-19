export type Question = {
    question: string;
    choices?: string[];
    answer: string;
}

export type Quiz = {
    quiz: Question[];
};