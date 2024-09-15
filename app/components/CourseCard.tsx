import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck } from 'lucide-react';
import { CourseInterface } from '@/app/(SmartQna)/Courses/page';
interface CourseCardProps {
  course: CourseInterface;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <Card className="w-full max-w-sm bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4">
        <CardTitle className="text-lg font-semibold truncate">{course.name}</CardTitle>
        <p className="text-sm opacity-80">ID: {course.id}</p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">Students</span>
          </div>
          <span className="text-lg font-semibold text-gray-800">{course.studentsEnrolled}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <UserCheck className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">TAs</span>
          </div>
          <span className="text-lg font-semibold text-gray-800">{course.tasEnrolled}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;