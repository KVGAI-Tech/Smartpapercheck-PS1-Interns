'use client'
import TACard from '@/app/components/TaCard';
import { Button } from '@/components/ui/button';
import { ArrowDownIcon, Plus  } from 'lucide-react';
import { Span } from 'next/dist/trace';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { TASchema } from '@/Schemas/TAschema';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/app/context/AuthProvider';

interface TA {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  phoneNumber: string;
  imageUrl: string;
}

const Page = () => {
  const [assignType, setAssignType] = useState<string>('Question-wise');
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push('/login'); // Redirect to login page if not authenticated
  //   }
  // }, [isAuthenticated, router]);

  
    const  pathname =  usePathname() ;
    const [tas, setTAs] = useState<TA[]>([
      {
        id: '1',
        name: 'Madhur Jain',
        rollNumber: '2023XPS0905P',
        email: 'f20230469@pilani.bits-pilani.ac.in',
        phoneNumber: '9381337697',
        imageUrl: '/path-to-image.jpg',
      },
      {
        id: '1',
        name: 'Madhur Jain',
        rollNumber: '2023XPS0905P',
        email: 'f20230469@pilani.bits-pilani.ac.in',
        phoneNumber: '9381337697',
        imageUrl: '/path-to-image.jpg',
      },
      {
        id: '1',
        name: 'Madhur Jain',
        rollNumber: '2023XPS0905P',
        email: 'f20230469@pilani.bits-pilani.ac.in',
        phoneNumber: '9381337697',
        imageUrl: '/path-to-image.jpg',
      },
      {
        id: '1',
        name: 'Madhur Jain',
        rollNumber: '2023XPS0905P',
        email: 'f20230469@pilani.bits-pilani.ac.in',
        phoneNumber: '9381337697',
        imageUrl: '/path-to-image.jpg',
      },
      {
        id: '1',
        name: 'Madhur Jain',
        rollNumber: '2023XPS0905P',
        email: 'f20230469@pilani.bits-pilani.ac.in',
        phoneNumber: '9381337697',
        imageUrl: '/path-to-image.jpg',
      },
      {
        id: '1',
        name: 'Madhur Jain',
        rollNumber: '2023XPS0905P',
        email: 'f20230469@pilani.bits-pilani.ac.in',
        phoneNumber: '9381337697',
        imageUrl: '/path-to-image.jpg',
      },
      {
        id: '1',
        name: 'Madhur Jain',
        rollNumber: '2023XPS0905P',
        email: 'f20230469@pilani.bits-pilani.ac.in',
        phoneNumber: '9381337697',
        imageUrl: '/path-to-image.jpg',
      },
      {
        id: '1',
        name: 'Madhur Jain',
        rollNumber: '2023XPS0905P',
        email: 'f20230469@pilani.bits-pilani.ac.in',
        phoneNumber: '9381337697',
        imageUrl: '/path-to-image.jpg',
      },
      {
        id: '1',
        name: 'Madhur Jain',
        rollNumber: '2023XPS0905P',
        email: 'f20230469@pilani.bits-pilani.ac.in',
        phoneNumber: '9381337697',
        imageUrl: '/path-to-image.jpg',
      },
      // Add more initial TAs as needed
    ]);
    const form = useForm<z.infer<typeof TASchema>>({
      resolver: zodResolver(TASchema),
      defaultValues: {
        name: '',
        ID: '',
        email: '',
        phoneNumber: '',
      },
    });

   function onSubmit  (data: z.infer<typeof TASchema>){
      console.log("vahaz")
      console.log(data);
    }
    
    useEffect(() => {
      console.log(assignType);
    }, [assignType]);

    // if (!isAuthenticated) {
    //   return <div>Loading...</div>;
    // }
    

    return (
      
  
      <div className='h-screen w-[88%] overflow-y-scroll overflow-x-hidden'>
          <div className=" w-full h-[12%] bg-[url('/dashboard_bg.png')] flex  justify-start items-center bg-cover bg-center">
          <div className='w-[70%] h-[60%] p-10'>
          <h1 className='text-primary-600 text-2xl tracking-normal leading-snug font-sans font-bold'>{pathname.split('/')[1]}</h1>

          </div>
              
         
  
          </div>
          <div className='flex items-center justify-start p-6 gap-4'>
          <Dialog>
      <DialogTrigger asChild>
      <Button size={'lg'} className=' flex justify-center items-center gap-2 bg-gradient-to-r from-[rgb(105,56,239)] to-[rgba(124,49,167,0.99)] via-[rgb(114,52,203)]'>Add TA
              <span><Plus size={16}/></span>
            </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className='texyt-primary-600'>Add new TA</DialogTitle>
          <DialogDescription>
            Fill the details to add a new TA
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 items-center gap-4">
                <FormField
                 
                
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
           
              <FormMessage />
            </FormItem>
          )}
        />
               
               <FormField
                 
                
                 control={form.control}
                 name="ID"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>ID</FormLabel>
                     <FormControl>
                       <Input placeholder="2023XPS0905P" {...field} />
                     </FormControl>
                     
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <FormField
                 
                
                 control={form.control}
                 name="email"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Email</FormLabel>
                     <FormControl>
                       <Input placeholder="random@gmail.com" {...field} />
                     </FormControl>
                     
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <FormField
                 
                
                 control={form.control}
                 name="phoneNumber"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Phone Number</FormLabel>
                     <FormControl>
                       <Input placeholder="+91 9381337697" {...field} />
                     </FormControl>
                    
                     <FormMessage />
                   </FormItem>
                 )}
               />
                
                

                    
               
                
              </div>
             
          <Button type="submit" className=' flex justify-center items-center gap-2 bg-gradient-to-r from-[rgb(105,56,239)] to-[rgba(124,49,167,0.99)] via-[rgb(114,52,203)]'>Save changes</Button>
        
            </form>
          </Form>
          {/* <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              placeholder="Pedro Duarte"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ID" className="text-right">
              ID
            </Label>
            <Input
              id="ID"
              placeholder="2023XPS0905P"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="Phone Number" className="text-right">
              phoneNumber
            </Label>
            <Input
              id="phoneNumber"
              placeholder="@peduarte"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="Email" className="text-right">
              Email
            </Label>
            <Input
              id="Email"
              placeholder="@peduarte"
              className="col-span-3"
            />
          </div> */}
        </div>
        
      </DialogContent>
    </Dialog>

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={'lg'} className='flex justify-center items-center gap-2 bg-gradient-to-r from-[rgb(105,56,239)] to-[rgba(124,49,167,0.99)] via-[rgb(114,52,203)] text-gray-25 text-sm hover:bg-gradient-to-r hover:from-[rgb(105,56,239)] hover:to-[rgba(124,49,167,0.99)] hover:via-[rgb(114,52,203)] hover:text-gray-25' variant="outline">Assign Type</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem  defaultValue={assignType} onClick={() => setAssignType('Question-wise')}>
          Assign Question-wise
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setAssignType('Quantity-wise')}>
          Assign Quantity-wise
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
            
           
            
   
           
          </div>
          <ScrollArea>
          <div className="grid grid-cols-1 p-6  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tas.map((ta) => (
          <TACard
            key={Math.random()}
            name={ta.name}
            ID={ta.rollNumber}
            email={ta.email}
            phoneNumber={ta.phoneNumber}
            imageUrl={ta.imageUrl}
           
          />
        ))}
      </div>
          </ScrollArea>
       
          
        
      </div>
  )
}

export default Page


