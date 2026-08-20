import { z } from 'zod';

export const createQuizSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    course_id: z.string().uuid('Invalid course ID format'),
    time_limit: z.number().min(1, 'Time limit must be at least 1 minute').optional(),
    passing_score: z.number().min(0).max(100, 'Passing score must be between 0 and 100'),
    questions: z.array(
      z.object({
        question_text: z.string().min(1, 'Question text is required'),
        options: z.array(z.string()).min(2, 'At least 2 options required'),
        correct_answer: z.string().min(1, 'Correct answer is required'),
        points: z.number().min(1, 'Points must be at least 1').optional(),
      })
    ).optional(),
  }),
});

export const updateQuizSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid quiz ID format'),
  }),
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').optional(),
    description: z.string().optional(),
    time_limit: z.number().min(1, 'Time limit must be at least 1 minute').optional(),
    passing_score: z.number().min(0).max(100, 'Passing score must be between 0 and 100').optional(),
    questions: z.array(
      z.object({
        question_text: z.string().min(1, 'Question text is required'),
        options: z.array(z.string()).min(2, 'At least 2 options required'),
        correct_answer: z.string().min(1, 'Correct answer is required'),
        points: z.number().min(1, 'Points must be at least 1').optional(),
      })
    ).optional(),
  }),
});

export const submitQuizAttemptSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid quiz ID format'),
  }),
  body: z.object({
    answers: z.record(z.string(), z.any()).describe('Answers must be a valid object'),
  }),
});

export const getQuizResultsSchema = z.object({
  params: z.object({
    quizId: z.string().uuid('Invalid quiz ID format'),
  }),
});