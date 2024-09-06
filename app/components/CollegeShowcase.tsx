import Image from 'next/image';

export default function CollegeShowcase() {
  const colleges = [
    { name: 'Harvard Business School', logo: '/harvard.png' },
    { name: 'Stanford Graduate School of Business', logo: '/stanford.png' },
    { name: 'Wharton School', logo: '/wharton.png' },
    { name: 'Indian School of Business', logo: '/isb.png' },
    { name: 'IIT Delhi', logo: '/iitdelhi.png' },
    { name: 'BITS Pilani', logo: '/bitspilani.png' },
    { name: 'IIM Bangalore', logo: '/iimbangalore.png' },
    // Add more colleges as needed
  ];

  return (
    <section className="py-16 bg-white-100">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Trusted by Leading Institutions</h2>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {colleges.map((college, index) => (
            <div key={index} className="text-center w-40">
              <Image src={college.logo} alt={college.name} width={100} height={100} className="mx-auto mb-2" />
              <p className="text-sm">{college.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}