'use client'
import Charts from '@/app/components/DashBoard';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Users, BookOpen, GraduationCap, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/app/context/AuthProvider';
import { access } from 'fs/promises';

const Page = () => {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);
    const [profile , setProfileData] = useState<any>() ;


    const { user, isAuthenticated , decodedToken } = useAuth();
  const router = useRouter();
  useEffect(() => {
    const fetchProfile = async () => {
        console.log(localStorage.getItem('access_token'))
      try {
        const response = await fetch('http://43.205.184.7:8000/api/me', {
            method:'GET' ,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          } 
        });
       const data = await response.json() ;
       if(data){
setProfileData(data)
       }
      } catch (error:any) {
        alert('Error fetching profile: ' + error.response.data.detail);
      }
    };
    fetchProfile();
  }, []);

//   useEffect(() => {
//     if (!isAuthenticated) {
//       router.push('/login'); // Redirect to login page if not authenticated
//     }
//   }, [isAuthenticated, router]);


    // const [user, setUser] = useState({
    //     name: 'John Doe',
    //     email: 'john.doe@example.com',
    //     role: 'admin',
    //     avatar: 'https://via.placeholder.com/150',
    // });

    const stats = [
        { title: "Total Students", value: "1,234", icon: Users, color: "text-blue-500", trend: "+5.2%" },
        { title: "Active Courses", value: "12", icon: BookOpen, color: "text-green-500", trend: "+2.4%" },
        { title: "Completed Courses", value: "8", icon: GraduationCap, color: "text-purple-500", trend: "+1.5%" },
        { title: "Notifications", value: "3", icon: Bell, color: "text-yellow-500", trend: "-0.5%" },
    ];

    
    // if (!isAuthenticated) {
    //     return <div>Loading...</div>;
    //   }

    return (
        <div className='h-screen w-[88%] overflow-y-auto bg-gray-50'>
            <div className="w-full bg-[url('/dashboard_bg.png')] text-white py-8 px-4"
            >
                <div className='max-w-7xl mx-auto flex items-center'>
                    
                    <div>
                        <h1 className='text-3xl text-primary-600 font-bold mb-2'>Welcome,{user}!</h1>
                    </div>
                </div>
            </div>

            <div className='max-w-7xl mx-auto px-4 py-8'>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className={`text-xs font-semibold flex items-center mt-1 ${parseInt(stat.trend) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    {stat.trend}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="bg-white shadow-md">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-gray-800">Analytics Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Charts />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default Page