import React, { useEffect, useState } from "react";
import Navbar from "./LandingPage/Navbar";
import { FaBuilding, FaUserTie, FaLightbulb } from "react-icons/fa";
import { BsPeopleFill } from "react-icons/bs";
import { MdOutlineLaunch } from "react-icons/md";
import { RiTeamFill } from "react-icons/ri";
import { ArrowRight } from "lucide-react";

const AboutUsPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = "#0B1011";
    document.body.style.color = "#ffffff";

    const preloadImages = [
      "/chess_background.png",
      "/Group 72 (1).png",
      "/check.png",
    ];

    let loadedCount = 0;

    preloadImages.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === preloadImages.length) {
          setTimeout(() => setIsLoaded(true), 100);
        }
      };
      img.onerror = () => {
        loadedCount++;
        console.log(`Failed to preload image: ${src}`);
        if (loadedCount === preloadImages.length) {
          setTimeout(() => setIsLoaded(true), 100);
        }
      };
    });

    const timer = setTimeout(() => setIsLoaded(true), 1000);
    document.documentElement.classList.add("landing-page-html");

    return () => {
      clearTimeout(timer);
      document.documentElement.classList.remove("landing-page-html");
    };
  }, []);

  if (!isLoaded) {
    return (
      <div
        style={{
          backgroundColor: "#0B1011",
          color: "#ffffff",
          height: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
        }}
      >
      </div>
    );
  }

  return (
    <section className="landing-page">
      <div className="relative h-24">
        <Navbar />
      </div>

      <div className="bg-gradient__2 w-full flex flex-col items-center justify-center relative py-40 my-10">
        <div className="inner-oval" />

        <h1 className="font-bold text-4xl md:text-6xl mb-6 text-center relative z-10 radial-text__cyan translate-y-8">
          About KVGAI Tech
        </h1>

        <p className="max-w-3xl mx-auto text-xl text-white relative z-10 px-4 mt-4">
          Revolutionizing education through AI-powered evaluation
        </p>
      </div>

      <section className="w-[90%] mx-auto">
        <section className="grid grid-cols-3 gap-20">
          <Card
            title="Company Overview"
            desc="KVGAI Tech Pvt. Ltd. is an AI-first deep-tech company revolutionizing education through Vision-Language Models, explainable AI, and Agentic workflows. Our flagship product, SmartQnA, automates handwritten answer script evaluation with unmatched precision and fairness."
            callTo="Learn more"
            image="/Group 72 (1).png"
            icon={<FaBuilding className="text-[#5de6e6] w-6 h-6" />}
          />

          <Card
            title="Founder's Story"
            desc="Founded in October 2024 by Anubhav Elhence (PhD, BITS Pilani) and Harshit Saraf (Final-year EEE, BITS Pilani) under the mentorship of Prof. Vinay Chamola, KVGAI was born from first-hand experience of the inefficiencies in academic evaluation."
            callTo="Meet the team"
            image="/Group 72 (1).png"
            icon={<FaUserTie className="text-[#5de6e6] w-6 h-6" />}
          />

          <Card
            title="Mission & Vision"
            desc="To make education fair, scalable, and insightful using explainable AI. To be the global standard for AI-powered educational evaluations and learning analytics."
            callTo=""
            image="/Group 72 (1).png"
            icon={<FaLightbulb className="text-[#5de6e6] w-6 h-6" />}
          />
        </section>

        <div className="max-w-4xl mx-auto p-32">
          <h2 className="text-6xl font-bold mb-12 text-center">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#5de6e6] to-transparent"></div>

            <div className="grid grid-cols-1 gap-12">
              <TimelineItem
                icon={<BsPeopleFill className="w-6 h-6 text-[#5de6e6]" />}
                year="2024"
                title="Company Founded"
                description="KVGAI Tech was established by Anubhav Elhence and Harshit Saraf at BITS Pilani."
                align="left"
              />
              <TimelineItem
                icon={<MdOutlineLaunch className="w-6 h-6 text-[#5de6e6]" />}
                year="2024"
                title="SmartQnA Launch"
                description="Our flagship product for automating handwritten answer script evaluation was released."
                align="right"
              />
              <TimelineItem
                icon={<RiTeamFill className="w-6 h-6 text-[#5de6e6]" />}
                year="2025"
                title="Expanding Horizons"
                description="Growing our team and expanding our AI solutions to more educational institutions."
                align="left"
              />
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default AboutUsPage;

const Card = ({ title, desc, callTo, icon }) => {
  return (
    <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 rounded-full bg-[#5de6e6] bg-opacity-20 flex items-center justify-center mr-4">
          {icon}
        </div>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <p className="text-gray-300 mb-6">{desc}</p>
      {callTo && (
        <button className="flex items-center group text-[#5de6e6] hover:text-white">
          {callTo}
          <ArrowRight className="ml-2" size={16} />
        </button>
      )}
    </div>
  );
};

function TimelineItem({ year, title, description, align, icon }) {
  return (
    <div
      className={`flex ${align === "left" ? "flex-row" : "flex-row-reverse"}`}
    >
      <div
        className={`w-1/2 ${
          align === "left" ? "pr-8 text-right" : "pl-8 text-left"
        }`}
      >
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <span className="text-[#5de6e6] font-bold">{year}</span>
          <h3 className="text-xl font-bold mt-2 mb-3">{title}</h3>
          <p className="text-gray-400">{description}</p>
        </div>
      </div>
      <div className="w-1/2 relative flex justify-center items-center">
        <div className="w-12 h-12 bg-gray-900 flex items-center justify-center rounded-full border border-[#5de6e6]">
          {icon}
        </div>
      </div>
    </div>
  );
}
