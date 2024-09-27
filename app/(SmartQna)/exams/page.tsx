'use client'
import { useAuth } from '@/app/context/AuthProvider';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

const Page = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push('/login'); // Redirect to login page if not authenticated
  //   }
  // }, [isAuthenticated, router]);

  // if (!isAuthenticated) {
  //   return <div>Loading...</div>;
  // }
  return (
    <div>
      
    </div>
  )
}

export default Page
