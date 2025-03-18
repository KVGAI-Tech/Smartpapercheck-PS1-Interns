import React, { useState } from 'react';

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    {
      title: 'Upload Scripts',
      description: 'Upload answer scripts in bulk or individually',
      video: '/videos/upload.mp4'
    },
    {
      title: 'AI Analysis',
      description: 'Our AI analyzes and grades each answer',
      video: '/videos/analysis.mp4'
    },
    {
      title: 'Review Results',
      description: 'Review and export detailed grading reports',
      video: '/videos/review.mp4'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">See How It Works</h2>
        
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/3">
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg cursor-pointer transition-all duration-300 ${
                    activeStep === index 
                      ? 'bg-blue-50 border-2 border-blue-500' 
                      : 'bg-white hover:bg-gray-50 border-2 border-transparent'
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      activeStep === index 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        activeStep === index ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-2/3">
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl bg-white">
              <video
                key={steps[activeStep].video}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src={steps[activeStep].video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors">
            Try It Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 