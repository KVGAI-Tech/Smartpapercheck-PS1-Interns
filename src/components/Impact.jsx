import React from 'react';

const Impact = () => {
  const stats = [
    {
      value: '1M+',
      label: 'Answer Scripts Evaluated',
      description: 'Across various institutions'
    },
    {
      value: '500+',
      label: 'Educational Institutions',
      description: 'Trust our platform'
    },
    {
      value: '70%',
      label: 'Time Saved',
      description: 'In evaluation process'
    },
    {
      value: '99%',
      label: 'Accuracy Rate',
      description: 'In automated grading'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-300"
            >
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-lg font-semibold mb-1">{stat.label}</div>
              <div className="text-sm text-gray-300">{stat.description}</div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join hundreds of educational institutions that are transforming their grading process with our AI-powered solution.
          </p>
          <button className="px-8 py-3 bg-white text-blue-900 rounded-full font-semibold hover:bg-gray-100 transition-colors">
            Get Started Today
          </button>
        </div>
      </div>
    </section>
  );
};

export default Impact; 