'use client'
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form , FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Upload, Loader2, PlusIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { usePathname } from 'next/navigation';
import { Course, courseSchema } from '@/Schemas/CourseSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import CourseCard from '@/app/components/CourseCard';
 export interface CourseInterface {
    id: string;
    name: string;
    studentsEnrolled: number;
    tasEnrolled: number;
}


const Page = () => {
    const pathname = usePathname();
    const [courses, setCourses] = useState<CourseInterface[]>([]);
    const Coursearray = [
        {
            id: 'CS 11',
            name: 'Introduction to Computer Science',
            studentsEnrolled: 150,
            tasEnrolled: 5,
        },
        {
            id: 'CS 12',
            name: 'Data Structures and Algorithms',
            studentsEnrolled: 120,
            tasEnrolled: 3,
        },
        {
            id: 'CS 13',
            name: 'Web Development',
            studentsEnrolled: 130,
            tasEnrolled: 4,
        },
        {
            id: 'CS 14',
            name: 'Database Systems',
            studentsEnrolled: 110,
            tasEnrolled: 2,
        },
          
        
    ]
    
    const [isLoading, setIsLoading] = useState(false);
    const form = useForm<Course>(
        {
            resolver: zodResolver(courseSchema),
            defaultValues: {
                id: '',
                name: '',
                studentsEnrolled: 0,
                tasEnrolled: 0,
            }
        }
    );
    
    const onSubmit = (data: Course) => {
        setIsLoading(true);
        try {
            console.log(data);
            setCourses([...courses, data]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }
    
 if(!Coursearray){
    return (
        <div className='h-screen w-[88%] flex justify-center items-center'>
            <div className='flex flex-col justify-center items-center gap-4'>
                <h1 className='text-primary-600 text-2xl tracking-normal leading-snug font-sans font-bold'>No Courses Found</h1>
                <p className='text-gray-600 text-md tracking-normal leading-snug font-sans font-normal'>Add a course to get started</p>
            </div>
        </div>
    )
 }
  return (
    <div className='h-screen w-[88%] overflow-y-scroll overflow-x-hidden'>
      
    <div className="w-full h-[12%] bg-[url('/dashboard_bg.png')] flex justify-start items-center bg-cover bg-center">
      <div className='w-[70%] h-[60%] p-10'>
        <h1 className='text-primary-600 text-2xl tracking-normal leading-snug font-sans font-bold'>{pathname.split('/')[1]}</h1>
      </div>
    </div>
    <div className='w-full px-4 h-[12%] flex justify-end items-center'>
      <Dialog >
        <DialogTrigger asChild>
          <Button variant={'outline'} size={'lg'} className='gap-2 bg-gradient-to-r from-[rgb(105,56,239)] to-[rgba(124,49,167,0.99)] via-[rgb(114,52,203)] text-gray-25 text-md font-semibold hover:bg-gradient-to-r hover:from-[rgb(105,56,239)] hover:to-[rgba(124,49,167,0.99)] hover:via-[rgb(114,52,203)] hover:text-gray-25'>
            Add Course
            <span><PlusIcon width={15} height={15} /></span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className='text-primary-600'>Add New Course</DialogTitle>
            <DialogDescription>
             Fill the following Fields 
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 items-center gap-4">
                    <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Id</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}  
                    />
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>  
                        <FormMessage />
                      </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="studentsEnrolled"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Strength</FormLabel>  
                        <FormControl>  
                          <Input 
                            type='number' 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="tasEnrolled"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of TAs</FormLabel>  
                        <FormControl>  
                          <Input 
                            type='number' 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                    />      
                </div>
                <Button type="submit" disabled={isLoading} className='flex justify-center items-center gap-2 bg-gradient-to-r from-[rgb(105,56,239)] to-[rgba(124,49,167,0.99)] via-[rgb(114,52,203)]'>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Course
                </Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    <div className='w-full h-[80%]  p-7'>
    {Coursearray.length === 0 ? (
                    <div className='flex flex-col justify-center items-center gap-4 h-64'>
                        <h3 className='text-primary-600 text-xl font-bold'>No Courses Found</h3>
                        <p className='text-gray-600 text-md'>Add a course to get started</p>
                    </div>
                ) : (
                    <div className=' grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                        {Coursearray.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                )}
            </div>
            </div>
      
    
   

    
  
  )
}

export default Page
