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
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="relative w-full h-screen bg-gradient-to-b from-blue-900 to-blue-700 flex flex-col  items-center text-white">
        <Navbar />
        <div className="max-w-4xl text-center m-36">
          <h1 className="text-5xl font-bold mb-6">Empowering MMBA Education with Cutting-Edge Datasets</h1>
          <p className="text-xl mb-8">
            DataMBA revolutionizes business education by providing comprehensive, real-world datasets tailored for MBA institutions. Our platform bridges the gap between theory and practice, enabling students to develop data-driven decision-making skills essential in today&apos;s business landscape.
          </p>
          <button className="bg-white text-blue-900 px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-100 transition duration-300">
            Explore Our Datasets
          </button>
        </div>
        <div className="absolute bottom-0 left-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 315">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>
      
      {/* <ProductFlow /> */}

      <Impact />
      <CollegeShowcase />
      {/* <HowItWorks /> */}
      <CodeDisplay inputCode={inputCode} outputCode={outputCode} />
      <Datasets />
      <Features />
      <DatasetPricing />
      {/* <WhyChooseUs />
      <Pricing />
      <Testimonials />
      <FAQ />*/}
      <Footer /> 

    </main>
  );
}