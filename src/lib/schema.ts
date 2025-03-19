import z from "zod";

export const OptionSchema = z.object({
  value: z.string(),
  letter: z.string(),
});

export type Option = z.infer<typeof OptionSchema>;

export const QuestionSchema = z.object({
  question: z.string(),
  options: z.array(OptionSchema),
  answer: z.string(),
  choice: z.string().optional(),
});

export type Question = z.infer<typeof QuestionSchema>;

export const QuizSchema = z.object({
  quiz: z.array(QuestionSchema),
});

export type Quiz = z.infer<typeof QuizSchema>;
