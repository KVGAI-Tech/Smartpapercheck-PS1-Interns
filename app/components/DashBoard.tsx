'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LineChart, BarChart, AreaChart, Users, BookOpen, GraduationCap, Bell } from "lucide-react"

export const description = "A collection of dashboard cards."

export function Charts() {
  return (
    <div className="chart-wrapper mx-auto flex flex-col flex-wrap items-start justify-center gap-6 p-6 sm:flex-row">
      <Card className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] xl:w-[calc(25%-18px)] border-2 border-primary-300 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-2xl font-bold text-primary-600">Profile</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Users className="h-12 w-12 text-primary-500 mb-2" />
          <p className="text-sm text-gray-600">View and update your personal information</p>
        </CardContent>
      </Card>

      <Card className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] xl:w-[calc(25%-18px)] border-2 border-primary-300 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-2xl font-bold text-primary-600">Course Management</CardTitle>
          <CardDescription>Oversee your courses</CardDescription>
        </CardHeader>
        <CardContent>
          <BookOpen className="h-12 w-12 text-primary-500 mb-2" />
          <p className="text-sm text-gray-600">Add, edit, or remove courses</p>
        </CardContent>
      </Card>

      <Card className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] xl:w-[calc(25%-18px)] border-2 border-primary-300 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-2xl font-bold text-primary-600">Platform Guide</CardTitle>
          <CardDescription>Learn how to use the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <GraduationCap className="h-12 w-12 text-primary-500 mb-2" />
          <p className="text-sm text-gray-600">Step-by-step tutorials and FAQs</p>
        </CardContent>
      </Card>

      <Card className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] xl:w-[calc(25%-18px)] border-2 border-primary-300 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-2xl font-bold text-primary-600">Announcements</CardTitle>
          <CardDescription>Stay updated</CardDescription>
        </CardHeader>
        <CardContent>
          <Bell className="h-12 w-12 text-primary-500 mb-2" />
          <p className="text-sm text-gray-600">Latest news and updates</p>
        </CardContent>
      </Card>

      <Card className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(66.66%-16px)] xl:w-[calc(50%-18px)] border-2 border-primary-300 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-2xl font-bold text-primary-600">Analytics</CardTitle>
          <CardDescription>Course performance insights</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <LineChart className="h-full w-full text-primary-500" />
        </CardContent>
      </Card>

      <Card className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(66.66%-16px)] xl:w-[calc(50%-18px)] border-2 border-primary-300 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-2xl font-bold text-primary-600">Student Progress</CardTitle>
          <CardDescription>Track student achievements</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <BarChart className="h-full w-full text-primary-500" />
        </CardContent>
      </Card>
    </div>
  )
}

export default Charts;