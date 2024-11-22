import Image from "next/image";
import Navbar from "./components/navbar";
import ProductFlow from "./components/ProductFlow";
import Impact from "./components/Impact";
import CollegeShowcase from "./components/CollegeShowcase";
// import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
// import WhyChooseUs from "./components/WhyChooseUs";
// import Pricing from "./components/Pricing";
// import Testimonials from "./components/Testimonials";
// import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import React from 'react';
import CodeDisplay from './components/CodeDisplay';
import Datasets from './components/Datasets';
import DatasetPricing from './components/DatasetPricing';
config.autoAddCss = false;

const inputCode = `
curl -H "Authorization: Bearer API_TOKEN" -H "Content-Type: application/json" -d '[{"url":"https://www.tiktok.com/@vantoan___/video/7294298719665622305"},{"url":"https://www.tiktok.com/@qatarliving/video/7294553558798650625"}]' "https://api.brightdata.com/datasets/v3/trigger?dataset_id=gd_lu702nij2f790tmv9h&format=json&uncompressed_webhook=true"
`;

const outputCode = `
[
  {
    "timestamp": "2024-08-30",
    "url": "https://www.tiktok.com/@ms.ladysay/video/7399414364966571306",
    "post_id": "7399414364966571306",
    "description": "Flight ✈️ already booked 😭 #msladysay #message #relatable #fypシ #fyp #fyp ",
    "create_time": "2024-08-04T22:26:57.000Z",
    "digg_count": 300,
    "share_count": "1",
    "collect_count": 15
  },
  {
    "timestamp": "2024-08-30",
    "url": "https://www.tiktok.com/@melaniajaa/video/739507178932961670",
    "post_id": "739507178932961670",
    "description": "U cant see me in my full form bae🥺",
    "create_time": "2024-07-24T05:35:35.000Z",
    "digg_count": 834
  }
]
`;

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-blue-900 to-gray-800 text-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center text-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/background.jpg" // Replace with a suitable background image in public/images/
            alt="Background"
            layout="fill"
            objectFit="cover"
            className="opacity-40"
          />
        </div>
        <div className="z-10 px-4">
          <h1 className="text-6xl font-extrabold mb-6">Smart QnA</h1>
          <p className="text-2xl font-light mb-8">
            Revolutionizing Answer Script Evaluation with AI and Aviator
          </p>
          <button className="px-6 py-3 bg-indigo-600 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition">
            Get Started
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold mb-8">What Makes Aviator Unique?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <Image
                src="/images/vlm-diagram.png"
                alt="VLM Diagram"
                width={300}
                height={200}
                className="mx-auto"
              />
              <h3 className="text-xl font-semibold mt-4">Golden Answer Script Analysis</h3>
              <p className="mt-2 text-gray-400">
                Upload a model answer script and let Aviator analyze and break it down into components for precision grading.
              </p>
            </div>
            <div>
              <Image
                src="/images/dashboard.png"
                alt="Dashboard"
                width={300}
                height={200}
                className="mx-auto"
              />
              <h3 className="text-xl font-semibold mt-4">Customizable Scoring</h3>
              <p className="mt-2 text-gray-400">
                Tailor scoring rules to your academic standards for unparalleled flexibility and accuracy.
              </p>
            </div>
            <div>
              <Image
                src="/images/corrected-script.png"
                alt="Corrected Script"
                width={300}
                height={200}
                className="mx-auto"
              />
              <h3 className="text-xl font-semibold mt-4">Automated Feedback</h3>
              <p className="mt-2 text-gray-400">
                Generate detailed, constructive feedback for students with the help of AI-powered evaluations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full py-16 bg-gradient-to-r from-indigo-600 to-blue-600 text-center">
        <h2 className="text-4xl font-bold mb-6">Join Us in Revolutionizing Education</h2>
        <p className="text-lg font-light mb-8">
          Be a part of the future with Aviator. Faster, smarter, and more accurate grading for educators.
        </p>
        <button className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold text-lg hover:bg-gray-800 transition">
          Learn More
        </button>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}