import React from 'react';

const Features = () => {
  const features = [
    {
      title: 'AI-Powered Grading',
      description: 'Leverage advanced AI to automate answer script evaluation',
      icon: '🤖'
    },
    {
      title: 'Consistency',
      description: 'Ensure fair and consistent grading across all submissions',
      icon: '⚖️'
    },
    {
      title: 'Time-Saving',
      description: 'Reduce grading time by up to 70% with automated evaluation',
      icon: '⏱️'
    },
    {
      title: 'Detailed Analytics',
      description: 'Get insights into student performance and learning patterns',
      icon: '📊'
    },
    {
      title: 'Smart Feedback',
      description: 'Generate personalized feedback for each submission',
      icon: '💡'
    },
    {
      title: 'Easy Integration',
      description: 'Seamlessly integrate with your existing LMS',
      icon: '🔄'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 