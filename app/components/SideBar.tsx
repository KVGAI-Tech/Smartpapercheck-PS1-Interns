    'use client'
    import React, { useEffect, useState } from 'react';
    import Image from 'next/image';
    import Link from 'next/link';
    import {Search  ,   Upload  ,BarChart2  , User2Icon, LogOut, Home, LayoutGrid}from "lucide-react"

    import { usePathname } from 'next/navigation';


    const Sidebar = () => {
        const pathname = usePathname() ;
        console.log(pathname)



    
        
        

    return (
        <div className="w-64 bg-[#a855f7] text-white h-screen flex flex-col justify-center p-5 rounded-[0px_20px_20px_0px]">
        {/* Logo */}
        <div className="mx-auto p-1">
            <Image src={'/logo.png'} alt="Quickads Logo" width={100} height={100} />
        </div>
        <div className="bg-[linear-gradient(to_right,rgba(222,222,222,0),rgb(222,222,222),rgba(222,222,222,0))] w-full h-0.5 mt-3">
    
    </div>

        {/* Navigation */}
        <nav className="flex-1 mt-5 justify-between ">
            <ul className="space-y-2 px-4">
            {[
                {name : 'Dashboard',  icon:<LayoutGrid width={15} height={15} />,  pathname : '/Dashboard' },
                { name: 'Discover', icon:<Search width={15} height={15} />,  pathname : '/Discover' },
                { name: 'Upload', icon: <Upload width={15} height={15} />,  pathname : '/Upload' },
                { name: 'TA', icon: <User2Icon width={15} height={15} />, pathname : '/TA' },
                { name: 'StudentsData', icon: <BarChart2 width={15} height={15} />,pathname : '/StudentsData' },
            ].map((item) =>  {

                const isActive = pathname === item.pathname ;
                return (
                
                <li className='w-full' key={item.name}>
                <Link  href={`/${item.name}`} className= { isActive ? ' tracking-normal leading-[1.43rem] opacity-100 text-[16px] flex items-center p-2 rounded-md font-sans text-gray-25 font-semibold text-nowrap  bg-white/10 ' : ' tracking-normal leading-[1.43rem] opacity-50 text-[16px] flex items-center p-2 rounded-md font-sans font-semibold text-nowrap hover:opacity-100  text-gray-25 hover:bg-white/10 hover:backdrop-blur-md transition-all duration-300'}>
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                </Link>
                </li>
            )
    })}
            </ul>

            <div className='font-semibold text-sm'>-------------------------</div>

            
        </nav>


        {/* Contact Founder */}
        <div className="p-4 border-t border-purple-500">
            <Link href="/contact" className=" opacity-50 text-[16px] gap-3 flex items-center p-2 rounded-md font-sans font-semibold text-nowrap hover:opacity-100  text-whiteAlpha-200 hover:bg-white/10 hover:backdrop-blur-md transition-all duration-300">
            <LogOut width={15} height={15} />
            <span>Log Out</span>
            </Link>
        </div>
        </div>
    );
    };

    export default Sidebar;