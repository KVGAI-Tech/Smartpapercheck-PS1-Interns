import { useState } from 'react';
import Image from 'next/image';

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    { title: 'Select Dataset', video: '/step1.mp4' },
    { title: 'Analyze Data', video: '/step2.mp4' },
    { title: 'Generate Insights', video: '/step3.mp4' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <ul>
              {steps.map((step, index) => (
                <li
                  key={index}
                  className={`cursor-pointer p-4 ${activeStep === index ? 'bg-blue-100' : ''}`}
                  onClick={() => setActiveStep(index)}
                >
                  {step.title}
                </li>
              ))}
            </ul>
            <button className="mt-8 bg-blue-600 text-white px-6 py-2 rounded-full">Watch Demo</button>
          </div>
          <div className="md:w-1/2">
            <div className="relative">
              <Image src="/ipad-frame.png" alt="iPad Frame" width={600} height={400} className="mx-auto" />
              <video
                className="absolute top-[10%] left-[10%] w-[80%] h-[80%] object-cover"
                src={steps[activeStep].video}
                autoPlay
                loop
                muted
              />
            </div>
          </div>
        </div>
        <div className="text-center mt-8">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold">
            Use Datasets
          </button>
        </div>
      </div>
    </section>
  );
}