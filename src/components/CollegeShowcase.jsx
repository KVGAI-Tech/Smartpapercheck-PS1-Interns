import React from 'react';

const CollegeShowcase = () => {
  const colleges = [
    { name: 'Harvard Business School', logo: '/harvard.png' },
    { name: 'Stanford Graduate School of Business', logo: '/stanford.png' },
    { name: 'Wharton School', logo: '/wharton.png' },
    { name: 'Indian School of Business', logo: '/isb.png' },
    { name: 'IIT Delhi', logo: '/iitdelhi.png' },
    { name: 'BITS Pilani', logo: '/bitspilani.png' },
    { name: 'IIM Bangalore', logo: '/iimbangalore.png' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Trusted by Leading Institutions</h2>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {colleges.map((college, index) => (
            <div key={index} className="text-center w-40">
              <img 
                src={college.logo} 
                alt={college.name} 
                className="w-[100px] h-[100px] object-contain mx-auto mb-2" 
              />
              <p className="text-sm text-gray-600">{college.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollegeShowcase; 