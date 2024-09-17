import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Clock, Users } from 'lucide-react'
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ExamCardProps {
  title: string;
  date: string;
  duration: string;
  participants: number;
  link: string;
}

const ExamCard: React.FC<ExamCardProps> = ({ title, date, duration, participants, link }) => {
  return (
    <Link href={link}>  
      <motion.div
        whileHover={{ scale: 1.08 }}
      transition={{ type: 'just', stiffness: 300 }}
    >
      <Card className="w-full overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 bg-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center mb-3"
          >
            <CalendarDays className="h-5 w-5 mr-3 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">{date}</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center mb-3"
          >
            <Clock className="h-5 w-5 mr-3 text-indigo-500" />
            <span className="text-sm font-medium text-gray-700">{duration}</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center"
          >
            <Users className="h-5 w-5 mr-3 text-green-500" />
            <span className="text-sm font-medium text-gray-700">{participants} participants</span>
          </motion.div>
        </CardContent>
      </Card>
      </motion.div>
    </Link>
  );
};

export default ExamCard;