'use client'
import StudentTable from '@/app/components/StudentTable/StudentTable';
import { usePathname } from 'next/navigation';
import React from 'react'

const Page = () => {
    const  pathname =  usePathname() ;

  return (
    

    <div className='h-screen w-[88%] overflow-y-scroll overflow-x-hidden'>
        <div className=" w-full h-[12%] bg-[url('/dashboard_bg.png')] flex  justify-start items-center bg-cover bg-center">
        <div className='w-[70%] h-[60%] p-10'>
            <h1 className='text-primary-600 text-2xl tracking-normal leading-snug font-sans font-bold'>{pathname.split('/')[1]}</h1>
        </div>
            
       

        </div>
        <div>
          <StudentTable />
        </div>
        
      
    </div>
  )
}

export default Page
