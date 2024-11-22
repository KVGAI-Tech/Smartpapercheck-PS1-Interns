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


export default function Home() {
  return (
    <main className="flex flex-col items-center bg-gradient-to-b from-blue-900 to-gray-800 text-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section
      <section className="w-full h-screen flex flex-col items-center justify-center text-center bg-gradient-to-r from-indigo-600 to-blue-600">
        <h1 className="text-6xl font-extrabold mb-6">Smart QnA</h1>
        <p className="text-2xl font-light mb-8">
          Revolutionizing Answer Script Evaluation with AI and Aviator
        </p>
        <button className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold text-lg hover:bg-gray-800 transition">
          Get Started
        </button>
        <p className="mt-4 text-sm">Join 100,000+ happy researchers today!</p>
      </section> */}
       {/* Hero Section */}
       <section className="relative w-full h-screen flex items-center justify-center text-center">
        <div className="absolute inset-0 z-0">
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

      {/* Trusted by Institutions Section */}
      <section className="w-full py-16 bg-gray-900 text-center">
        <h2 className="text-4xl font-bold mb-6">Trusted by the Best Institutions Worldwide</h2>
        <div className="flex justify-center gap-6">
          <Image
            src="/bitspilani.png"
            alt="Institution 1"
            width={100}
            height={50}
          />
          <Image
            src="/isb.png"
            alt="Institution 2"
            width={100}
            height={50}
          />
          <Image
            src="/iitdelhi.png"
            alt="Institution 3"
            width={100}
            height={50}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 bg-gray-800">
        <h2 className="text-4xl font-bold text-center mb-8">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto px-8">
          {/* Feature 1 */}
          <div className="text-center">
            <Image
              src="/images/vlm-diagram.png"
              alt="VLM Diagram"
              width={300}
              height={200}
              className="mx-auto"
            />
            <h3 className="text-xl font-semibold mt-4">Golden Answer Script Analysis</h3>
            <p className="mt-2 text-gray-400">
              Upload a model answer script and let Aviator break it into components for precision grading.
            </p>
          </div>
          {/* Feature 2 */}
          <div className="text-center">
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
          {/* Feature 3 */}
          <div className="text-center">
            <Image
              src="/images/corrected-script.png"
              alt="Corrected Script"
              width={300}
              height={200}
              className="mx-auto"
            />
            <h3 className="text-xl font-semibold mt-4">Automated Feedback</h3>
            <p className="mt-2 text-gray-400">
              Generate detailed, constructive feedback for students with AI-powered evaluations.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <h2 className="text-4xl font-bold text-center mb-8">What Our Users Say</h2>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xl italic">
            “Smart QnA has completely transformed our grading process. It&apos;s fast, reliable, and incredibly accurate.”
          </p>
          <p className="mt-4 text-gray-400">— Vinay Chamola,</p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full py-16 bg-gray-900">
        <h2 className="text-4xl font-bold text-center mb-8">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto px-8">
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-4">Small Groups</h3>
            <p className="text-lg font-light">$50/month</p>
            <p className="mt-4 text-gray-400">Perfect for small coaching centers.</p>
            <button className="px-4 py-2 bg-indigo-600 rounded-lg mt-4 hover:bg-indigo-700">
              Get Started
            </button>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-4">Medium Batches</h3>
            <p className="text-lg font-light">$250/month</p>
            <p className="mt-4 text-gray-400">Ideal for medium-sized institutions.</p>
            <button className="px-4 py-2 bg-indigo-600 rounded-lg mt-4 hover:bg-indigo-700">
              Get Started
            </button>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-4">Enterprise</h3>
            <p className="text-lg font-light">Custom Pricing</p>
            <p className="mt-4 text-gray-400">Tailored solutions for large organizations.</p>
            <button className="px-4 py-2 bg-indigo-600 rounded-lg mt-4 hover:bg-indigo-700">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="w-full py-16 bg-gray-800">
        <h2 className="text-4xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="max-w-5xl mx-auto">
          <details className="mb-4">
            <summary className="text-xl font-semibold cursor-pointer">
              How does Aviator analyze answer scripts?
            </summary>
            <p className="mt-2 text-gray-400">
              Aviator uses advanced Vision Language Models to evaluate text, diagrams, and handwritten content with high accuracy.
            </p>
          </details>
          <details className="mb-4">
            <summary className="text-xl font-semibold cursor-pointer">
              Is the platform secure for institutional use?
            </summary>
            <p className="mt-2 text-gray-400">
              Absolutely! Aviator employs secure cloud-based architecture and encryption for data privacy.
            </p>
          </details>
          <details>
            <summary className="text-xl font-semibold cursor-pointer">
              Can I customize the scoring rules?
            </summary>
            <p className="mt-2 text-gray-400">
              Yes, Aviator offers flexible options for customizing scoring to align with your institution&apos;s standards.
            </p>
          </details>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}