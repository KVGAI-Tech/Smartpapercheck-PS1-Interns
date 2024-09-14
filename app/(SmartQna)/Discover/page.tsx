'use client'
import React from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const page = () => {
    const  pathname =  usePathname() ;

  return (
    

    <div className='h-screen w-[88%]'>
        <div className=" w-full h-[12%] bg-[url('/dashboard_bg.png')] flex  justify-start items-center bg-cover bg-center">
        <div className='w-[70%] h-[60%] p-10'>
        <h1 className='text-primary-600 text-2xl tracking-normal leading-snug font-sans font-bold'>{pathname.split('/')[1]}</h1>

        </div>
            
       

        </div>
        
      
    </div>
  )
}

export default page
