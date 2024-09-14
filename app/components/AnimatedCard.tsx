import React from 'react';

interface AnimatedBorderCardProps {
  children: React.ReactNode;
  className?: string;
}

const AnimatedBorderCard: React.FC<AnimatedBorderCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`
      relative p-[2px] overflow-hidden rounded-lg
      before:content-[''] before:absolute before:inset-0
      before:bg-[length:50%_50%] before:bg-[position:0%_0%,100%_0%,100%_100%,0%_100%]
      before:bg-no-repeat before:bg-[linear-gradient(90deg,#6938ef,#6938ef),linear-gradient(90deg,#6938ef,#6938ef),linear-gradient(90deg,#6938ef,#6938ef),linear-gradient(90deg,#6938ef,#6938ef)]
      hover:before:animate-[border-dance_4s_linear_infinite]
      ${className}
    `}>
      <div className="relative z-10 bg-white dark:bg-gray-800 rounded-lg p-4">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBorderCard;  