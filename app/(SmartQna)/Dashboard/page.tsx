'use client'
import Charts from '@/app/components/DashBoard';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Users, BookOpen, GraduationCap, TrendingUp } from 'lucide-react'
import Image from 'next/image'

const Page = () => {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'admin',
        avatar: 'https://via.placeholder.com/150',
    });

    const stats = [
        { title: "Total Students", value: "1,234", icon: Users, color: "text-blue-500", trend: "+5.2%" },
        { title: "Active Courses", value: "12", icon: BookOpen, color: "text-green-500", trend: "+2.4%" },
        { title: "Completed Courses", value: "8", icon: GraduationCap, color: "text-purple-500", trend: "+1.5%" },
        { title: "Notifications", value: "3", icon: Bell, color: "text-yellow-500", trend: "-0.5%" },
    ];

    return (
        <div className='h-screen w-full overflow-y-auto bg-gray-50'>
            <div className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-8 px-4">
                <div className='max-w-7xl mx-auto flex items-center'>
                    <Image
                        src={''}
                        alt={user.name}
                        width={80}
                        height={80}
                        className="rounded-full mr-6 border-4 border-white shadow-lg"
                    />
                    <div>
                        <h1 className='text-3xl font-bold mb-2'>Welcome, {user?.name}!</h1>
                        <p className='text-purple-200'>Here's an overview of your dashboard</p>
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
                                <p className={`text-xs font-semibold flex items-center mt-1 ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
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