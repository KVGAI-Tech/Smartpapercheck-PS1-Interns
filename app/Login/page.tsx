'use client'
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginSchema } from "@/Schemas/LoginSchema"
import { z } from "zod"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export const description =
  "A login form with email and password. There's an option to login with Google and a link to sign up if you don't have an account."

 const  LoginForm = () => {
  const  [isLoading,setIsLoading] = useState(false)  ;

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      Username: "",
      password: "",
    },
  })  
  const onSubmit = (data: z.infer<typeof LoginSchema>) => {
    
    setIsLoading(true)
    
      setTimeout(() => {  
        console.log(data)
      }, 10000)
      
      
    setIsLoading(false)

  }
  return (
    <div className="w-full h-screen  flex justify-center items-center">
       <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <FormField
          control={form.control}
          name="Username"
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
       
              <FormMessage />
            </FormItem>
          )}
        />
          </div>
       
          <Button disabled={isLoading} type="submit" className='gap-2 bg-gradient-to-r from-[rgb(105,56,239)] to-[rgba(124,49,167,0.99)] via-[rgb(114,52,203)] text-gray-25 text-md font-semibold hover:bg-gradient-to-r hover:from-[rgb(105,56,239)] hover:to-[rgba(124,49,167,0.99)] hover:via-[rgb(114,52,203)] hover:text-gray-25' >
            {isLoading &&  <Loader2 className="animate-spin" /> }
            Login
          </Button>
        
        </div>
       
      </form>
    </Form>
        
      
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="#" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
    </div>
   
  )
}
export default LoginForm