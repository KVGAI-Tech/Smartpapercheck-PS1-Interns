import React from 'react';
import Navbar from '../components/LandingPage/navbar';
import Footer from '../components/LandingPage/Footer';

const ResourcesPage = () => {
  const resources = [
    {
      title: 'Getting Started Guide',
      description: 'Learn how to set up and use our platform effectively',
      link: '#',
      icon: '📚'
    },
    {
      title: 'Case Studies',
      description: 'See how other institutions are using our platform',
      link: '#',
      icon: '📊'
    },
    {
      title: 'Documentation',
      description: 'Detailed technical documentation and API references',
      link: '#',
      icon: '📄'
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video guides for all features',
      link: '#',
      icon: '🎥'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <Navbar />
      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Resources
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Everything you need to succeed with our platform
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.link}
                  className="p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="text-4xl mb-4">{resource.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                  <p className="text-gray-600">{resource.description}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ResourcesPage; 