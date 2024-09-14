'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LineChart, BarChart, AreaChart } from "lucide-react"
import { Line } from "react-konva"

export const description = "A collection of health charts."

export function Charts() {
  return (
    <div className="chart-wrapper mx-auto flex max-w-6xl flex-col flex-wrap items-start justify-center gap-6 p-6 sm:flex-row sm:p-8">
      <div className="grid w-full gap-6 sm:grid-cols-2 lg:max-w-[22rem] lg:grid-cols-1 xl:max-w-[25rem]">
        <Card
          className="lg:max-w-md h-[20rem] border-2 border-primary-300" x-chunk="charts-01-chunk-0"
        >
          <CardHeader className="space-y-0 pb-2">
           
            <CardTitle className="text-4xl tabular-nums text-primary-600">
             Profile
              
            </CardTitle>
          </CardHeader>
          <CardContent>
           
          </CardContent>
          <CardFooter className="flex-col items-start gap-1">
          
          </CardFooter>
        </Card>
        <Card
          className="flex flex-col lg:max-w-md border-2 border-primary-300 h-[20rem]" x-chunk="charts-01-chunk-1"
        >
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2 [&>div]:flex-1">
            <div>
            
              <CardTitle className="flex items-baseline gap-1 tracking-tight leading-snug text-3xl tabular-nums text-primary-600">
              Course Management
              </CardTitle>
            </div>
            <div>
             
            
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 items-center">
           
          </CardContent>
        </Card>
      </div>
      <div className="grid w-full flex-1 gap-6 lg:max-w-[20rem]">
        
        <Card
          className="max-w-xs border-2 border-primary-300 h-[15rem] rounded-lg " x-chunk="charts-01-chunk-2"
        >
          <CardHeader>
            <CardTitle className="text-2xl flex flex-col   justify-center text-start     text-primary-600">
                <span>How to use </span>
                <span>the Platform</span>
            </CardTitle>

          </CardHeader>
          <CardContent className="grid gap-4">
            
           
          </CardContent>
        </Card>
        <Card
          className="max-w-xs border-2 border-primary-300 h-[10rem]" x-chunk="charts-01-chunk-3"
        >
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-2xl text-primary-600">Whats New</CardTitle>
          
          </CardHeader>
          <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0">
           
           
          </CardContent>
        </Card>
        <Card
          className="max-w-xs border-2 border-primary-300 p-3" x-chunk="charts-01-chunk-4"
        >
            <CardTitle className="text-2xl text-primary-600 h-[10rem]">Announcement</CardTitle>
          <CardContent className="flex gap-4 p-4 pb-2">
           
          </CardContent>
         
        </Card>
      </div>
      <div className="grid w-full flex-1 gap-6">
        <Card
          className="max-w-xs border-2 border-primary-300 p-3 h-[20rem]" x-chunk="charts-01-chunk-5"
        >
            <CardTitle className="text-2xl text-primary-600">Checking Status</CardTitle>
          <CardContent className="flex gap-4 p-4">
            
         
          
          </CardContent>
        </Card>
        <Card
          className="max-w-xs border-2 border-primary-300 p-3 h-[20rem]" x-chunk="charts-01-chunk-6"
        >
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-2xl text-primary-600"> Recheck Status </CardTitle>
         
          </CardHeader>
          <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-2">
          
            
          </CardContent>
        </Card>
        
      </div>
    </div>
  )
}
export default Charts ;
