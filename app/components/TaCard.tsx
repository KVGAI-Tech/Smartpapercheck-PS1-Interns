import React from 'react';
import Image from 'next/image';
import { RefreshCw ,  Phone, Mail } from 'lucide-react';

interface TACardProps {
  name: string;
  ID: string;
  email: string;
  phoneNumber: string;
  imageUrl: string;
  
}

const TACard: React.FC<TACardProps> = ({ name, ID, email, phoneNumber, imageUrl }) => {
  return (
    <div className="bg-gradient-to-r from-[rgb(105,56,239)] to-[rgba(124,49,167,0.99)] via-[rgb(114,52,203)] transition-[background-color,border-color,color,fill,stroke,opacity,box-shadow,transform] duration-200 text-white rounded-lg overflow-hidden shadow-lg">
      <div className="p-5 flex items-start justify-between">
        <div className="flex items-center">
          <Image
            src={'/user-profile-icon-in-flat-style-member-avatar-illustration-on-isolated-background-human-permission-sign-business-concept-vector.jpg'}
            alt={name}
            width={64}
            height={64}
            className="rounded-full mr-4"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-25">{name}</h2>
            <p className="text-sm text-gray-25">{ID}</p>
          </div>
        </div>
       
      </div>
      <div className="px-4 pb-4">
        <p className="text-sm flex items-center mb-1">
          <span className="mr-2"><Phone width={15 } height={15}/></span>
          {phoneNumber}
        </p>
        <p className="text-sm flex items-center">
          <span className="mr-2"><Mail width={15 } height={15}/></span>
          {email}
        </p>
      </div>
      <button
       
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 text-center transition duration-300"
      >
        Assign
      </button>
    </div>
  );
};

export default TACard;