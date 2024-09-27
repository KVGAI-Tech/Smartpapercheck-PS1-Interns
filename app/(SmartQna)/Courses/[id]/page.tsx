"use client"
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusIcon, Users, UserCheck } from 'lucide-react'
import ExamCard from '@/app/components/ExamCard'
import { useAuth } from '@/app/context/AuthProvider';

const Page = () => {
    const params = useParams();
    const { user, isAuthenticated } = useAuth();
  const router = useRouter();

//   useEffect(() => {
//     if (!isAuthenticated) {
//       router.push('/login'); // Redirect to login page if not authenticated
//     }
//   }, [isAuthenticated, router]);

 
    const [course, setCourse] = useState({
        id: params.id,
        name: 'Introduction to Computer Science',
        strength: 150,
        tasAssigned: 5,
    });

    const [exams, setExams] = useState([
        { id: 1, title: 'Midterm Exam', date: '2023-10-15', duration: '2 hours', participants: 145 },
        { id: 2, title: 'Final Exam', date: '2023-12-20', duration: '3 hours', participants: 148 },
    ]);
    // if (!isAuthenticated) {
    //     return <div>Loading...</div>;
    //   }
    return (
        <div className='h-screen w-[88%] overflow-y-auto bg-gray-50'>
            <div className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-8 px-4">
                <div className='max-w-7xl mx-auto'>
                    <h1 className='text-3xl font-bold mb-2'>{course.name}</h1>
                    <p className='text-purple-200'>Course ID: {course.id}</p>
                </div>
            </div>

            <div className='max-w-7xl mx-auto px-4 py-8'>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold flex items-center">
                                <Users className="h-5 w-5 mr-2 text-purple-500" />
                                Course Strength
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-gray-800">{course.strength}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold flex items-center">
                                <UserCheck className="h-5 w-5 mr-2 text-indigo-500" />
                                TAs Assigned
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-gray-800">{course.tasAssigned}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className='text-2xl font-bold text-gray-800'>Exams</h2>
                    <Button className='gap-2 bg-gradient-to-r from-[rgb(105,56,239)] to-[rgba(124,49,167,0.99)] via-[rgb(114,52,203)] text-white'>
                        Add Exam
                        <PlusIcon width={15} height={15} />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams.map((exam) => (
                        <ExamCard
                            link={`/exams/${exam.title}`}
                            key={exam.id}
                            title={exam.title}
                            date={exam.date}
                            duration={exam.duration}
                            participants={exam.participants}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Page