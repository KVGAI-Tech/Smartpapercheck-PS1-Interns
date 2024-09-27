'use client';
import StudentTable from '@/app/components/StudentTable/StudentTable';
import { useAuth } from '@/app/context/AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogOverlay, DialogTrigger, DialogClose, DialogFooter, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'; // Adjust this import to your shadcn version
import * as XLSX from 'xlsx';

import { URL, urlschema } from '@/Schemas/CourseSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Page = () => {
    const pathname = usePathname();
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);
    const [studentData, setStudentData] = useState<any[]>(); // State to store the student data

    const form = useForm<URL>({
        resolver: zodResolver(urlschema),
        defaultValues: {
            url: ''
        }
    });

    // useEffect(() => {
    //     if (!isAuthenticated) {
    //         router.push('/login'); // Redirect to login page if not authenticated
    //     }
    // }, [isAuthenticated, router]);

    // if (!isAuthenticated) {
    //     return <div>Loading...</div>;
    // }

    async function onSubmit(data: URL) {
        const { url } = data;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch the file from the URL');
            }

            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetNames = workbook.SheetNames;
            const sheet = workbook.Sheets[sheetNames[0]]; // Access the first sheet

            const parsedData = XLSX.utils.sheet_to_json(sheet); // Parse data to JSON

            // Optionally save to localStorage or state
            localStorage.setItem('studentData', JSON.stringify(parsedData));
            setStudentData(parsedData); // Set state with the parsed data
            setIsOpen(false); // Close the dialog
        } catch (error) {
            console.error('Error processing the Excel file:', error);
        }
    };

    return (
        <div className='h-screen w-[88%] overflow-y-scroll overflow-x-hidden'>
            <div className="w-full h-[12%] bg-[url('/dashboard_bg.png')] flex justify-start items-center bg-cover bg-center">
                <div className='w-[70%] h-[60%] p-10'>
                    <h1 className='text-primary-600 text-2xl tracking-normal leading-snug font-sans font-bold'>{pathname.split('/')[1]}</h1>
                </div>
            </div>
            
            <div>
                {/* Dialog Trigger */}
                {/* <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger>
                        <Button variant="outline" className="flex items-center">
                            <Plus className="mr-2 h-4 w-4" /> Upload Excel URL
                        </Button>
                    </DialogTrigger>

                    <DialogOverlay>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Upload Excel File URL</DialogTitle>
                                <DialogDescription>
                                    Please provide the URL for the Excel file that contains student data.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                               
                                    <FormField
                                        control={form.control}
                                        name="url"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Excel File URL</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter the Excel file URL" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button type="submit">Submit</Button>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                    </DialogFooter>
                              
                            </form>
                            </Form>
                        </DialogContent>
                    </DialogOverlay>
                </Dialog> */}

                {/* Display the Student Table */}
                <StudentTable data={studentData}/> {/* Pass student data to the table */}
            </div>
        </div>
    );
};

export default Page;
