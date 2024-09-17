'use client'
import React from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const Page = () => {
    const  pathname =  usePathname() ;

  return (
    

    <div className='h-screen w-[88%]'>
        <div className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-8 px-4">
                <div className='max-w-7xl mx-auto flex items-center'>
                    
                    <div>
                        <h1 className='text-3xl font-bold mb-2'>{pathname.split('/')[1]}</h1>
                  
                    </div>
                </div>
            </div>
        
      
    </div>
  )
}

export default Page
