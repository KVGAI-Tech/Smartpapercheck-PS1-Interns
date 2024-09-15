'use client'
import Charts from '@/app/components/DashBoard';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react'

const Page = () => {
    const pathname = usePathname() ;
    const [isLoading , setIsLoading] = useState(false) ;
    const [user , setUser] = useState({
        name : 'John Doe' ,
        email : 'john.doe@example.com' ,
        role : 'admin' ,
        avatar : 'https://via.placeholder.com/150' ,
    }) ;
    



  return (
    <div className='h-screen w-[88%] overflow-y-scroll overflow-x-hidden'>
    <div className=" w-full h-[12%] bg-[url('/dashboard_bg.png')] flex  justify-start items-center bg-cover bg-center">
    <div className='w-[70%] h-[60%] p-10'>
    <h1 className='text-primary-600 text-3xl tracking-tight leading-tight font-sans font-bold'>Welcome {user?.name}!</h1>

    </div>
        
   

    </div>
    <div className='w-full h-[88%]'>
        <Charts/>
    </div>
    
  
</div>
  )
}

export default Page
