import { z } from 'zod';

export const courseSchema = z.object({
  id: z.string().min(1, "Course ID is required"),
  name: z.string().min(1, "Course name is required"),
  studentsEnrolled: z.number().int().nonnegative("Number of students must be non-negative"),
  tasEnrolled: z.number().int().nonnegative("Number of TAs must be non-negative"),
});

export type Course = z.infer<typeof courseSchema>;