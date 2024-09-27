import React from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { User, Mail, Phone, Hash, Briefcase } from 'lucide-react'
import { motion } from 'framer-motion';
import Image from 'next/image';

interface TACardProps {
  name: string;
  ID: string;
  email: string;
  phoneNumber: string;
  imageUrl: string;
  department?: string;
}

const TACard: React.FC<TACardProps> = ({ name, ID, email, phoneNumber, imageUrl, department }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="w-full overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <div className="relative h-32 bg-gradient-to-r from-purple-500 to-indigo-600">
          <div className="absolute -bottom-10 left-4">
            <Image
              src={'/user-profile-icon-in-flat-style-member-avatar-illustration-on-isolated-background-human-permission-sign-business-concept-vector.jpg'}
              alt={name}
              width={80}
              height={80}
              className="rounded-full border-4 border-white"
            />
          </div>
        </div>
        <CardContent className="pt-12 pb-4 px-4">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{name}</h3>
          <p className="text-sm text-gray-600 mb-4">{department || 'Teaching Assistant'}</p>
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center text-sm"
            >
              <Hash className="h-4 w-4 mr-2 text-purple-500" />
              <span className="text-gray-700">{ID}</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center text-sm"
            >
              <Mail className="h-4 w-4 mr-2 text-indigo-500" />
              <span className="text-gray-700">{email}</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center text-sm"
            >
              <Phone className="h-4 w-4 mr-2 text-green-500" />
              <span className="text-gray-700">{phoneNumber}</span>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TACard;