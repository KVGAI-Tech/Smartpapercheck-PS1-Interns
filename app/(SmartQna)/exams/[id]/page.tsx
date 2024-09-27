'use client'

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { Loader2, Upload, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import dynamic from 'next/dynamic';
import { useAuth } from '@/app/context/AuthProvider';

const PDFViewer = dynamic(() => import('@/app/components/Canva'), { ssr: false });

interface IFormInput {
  PDFURL: File | undefined;
  courseTitle: string;
  examName: string;
}

const Page = () => {
  const pathname = usePathname();
  console.log(pathname)
  const [file, setFile] = useState<File | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfURL, setPdfURL] = useState<string>('');
  const[isOpen  , setIsopen] = useState(false); 

  const [showOverlay, setShowOverlay] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [examName, setExamName] = useState('');
  const examNametoshow = decodeURIComponent(pathname.split('/').pop() || '');
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push('/login'); // Redirect to login page if not authenticated
  //   }
  // }, [isAuthenticated, router]);

 

  useEffect(() => {
    console.log(pdfURL);
  }, [pdfURL]);

  const form = useForm<IFormInput>({
    defaultValues: {
      PDFURL: undefined , 
      courseTitle: '',
      examName: ''
    }
  });

  const onSubmit = (data: IFormInput) => {

    setIsLoading(true);
    
    try {
      console.log(data);
      if (data.PDFURL) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileURL = e.target?.result as string;
          setPdfURL(fileURL);
          setIsopen(false) ;
          setShowOverlay(true);
          
          console.log(fileURL);
        };
        reader.readAsDataURL(data.PDFURL);
        console.log(reader)
       
        setPdfURL(reader.result as string);
        setCourseTitle(data.courseTitle);
        setExamName(data.examName);
        console.log(pdfURL);
      }
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setIsLoading(false);
      setCourseTitle(data.courseTitle);
      setExamName(data.examName);
    }
  };
 const handleOverlay = () => {
  setShowOverlay(false);
 }
//  if (!isAuthenticated) {
//   return <div>Loading...</div>;
// }
  return (
    <div className='h-screen w-[88%]'>
      
      <div className="w-full h-[12%] bg-[url('/dashboard_bg.png')] flex justify-start items-center bg-cover bg-center">
        <div className='w-[70%] h-[60%] p-10'>
          <h1 className='text-primary-600 text-2xl tracking-normal leading-snug font-sans font-bold'>{examNametoshow}</h1>
        </div>
      </div>
      <div className='w-full px-4 h-[12%] flex justify-end items-center'>
        <Dialog open={isOpen} >
          <DialogTrigger asChild>
            <Button onClick={()=>setIsopen(true)} variant={'outline'} size={'lg'} className='gap-2 bg-gradient-to-r from-[rgb(105,56,239)] to-[rgba(124,49,167,0.99)] via-[rgb(114,52,203)] text-gray-25 text-md font-semibold hover:bg-gradient-to-r hover:from-[rgb(105,56,239)] hover:to-[rgba(124,49,167,0.99)] hover:via-[rgb(114,52,203)] hover:text-gray-25'>
              Upload
              <span><Upload width={15} height={15} /></span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className='text-primary-600'>Add PDF file</DialogTitle>
              <DialogDescription>
                Drop the PDF you want to upload
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="PDFURL"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your PDF file</FormLabel>
                          <FormControl>
                            <Input
                              type='file'
                              placeholder="Upload PDF"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setFile(file);
                                  field.onChange(file);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="courseTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter course title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="examName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exam Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter exam name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={isLoading || !file} className='flex justify-center items-center gap-2 bg-gradient-to-r from-[rgb(105,56,239)] to-[rgba(124,49,167,0.99)] via-[rgb(114,52,203)]'>
                    {isLoading && <Loader2 />} Upload
                  </Button>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {
        
      showOverlay && pdfURL && (
        (!courseTitle || !examName) ? (
          <div className='w-full h-full flex justify-center items-center'>
            <Loader2 className='animate-spin' />
          </div>
        ) : (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="relative w-full h-full max-w-screen-lg max-h-screen p-3">
            <Button
              onClick={handleOverlay}
              className="absolute top-4 right-4 z-50 text-white"
            >
              <X className='gap-2 bg-gradient-to-r from-[rgb(105,56,239)] to-[rgba(124,49,167,0.99)] via-[rgb(114,52,203)] text-gray-25 text-md font-semibold hover:bg-gradient-to-r hover:from-[rgb(105,56,239)] hover:to-[rgba(124,49,167,0.99)] hover:via-[rgb(114,52,203)] hover:text-gray-25' width={20} height={20} />
            </Button>
            <div id="viewer" style={{ height: '100%', width: '100%' }}>
              <PDFViewer fileUrl={pdfURL} courseTitle={courseTitle} examName={examName} />
            </div>
          </div>
        </div>
        )
      )}

      
    </div>
  );
}

export default Page;
