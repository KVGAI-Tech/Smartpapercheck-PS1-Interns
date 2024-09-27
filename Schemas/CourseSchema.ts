import { Description } from '@radix-ui/react-toast';
import { object, z } from 'zod';

export const courseSchema = z.object({
  id: z.string().min(1, "Course ID is required"),
  name: z.string().min(1, "Course name is required"),
  Description:z.string().min(0 , "Description cant be empty ")  ,
  studentsEnrolled: z.number().int().nonnegative("Number of students must be non-negative"),
  tasEnrolled: z.number().int().nonnegative("Number of TAs must be non-negative"),
});

export const urlschema  =z.object( {
  url:z.string().min(1 , "pls enter the url") 

})
export const  examSchema  = z.object({

})

export type Course = z.infer<typeof courseSchema>;
export type URL  = z.infer<typeof urlschema> ;
