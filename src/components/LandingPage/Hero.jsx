import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BsStars } from "react-icons/bs";
import { MdOutlinePlayCircleOutline } from "react-icons/md";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="min-h-screen flex flex-col items-center justify-center p-8 md:pt-28 lg:p-20 relative">
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-full grid-perspective">
        </div>
      </div>
      
      <div className="z-10 flex flex-col items-center max-w-6xl mx-auto mt-20 md:mt-0">
        <div className="flex items-center gap-2 text-teal-highlight text-sm font-medium">
          <BsStars className="w-5 h-5" />
          <span>With AI, evaluation made Easy</span>
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-medium mt-5 mb-16 text-center">
          An <span className="text-teal-highlight">AI powered</span> script <br /> 
          evaluator for <span className="bg-teal-transparent px-4 rounded-xl">Universities</span>
        </h1>

        <p className="text-sm md:text-base max-w-3xl text-center mb-10">
          Reimagine script evaluation with Smart QnA—AI-powered for speed,
          accuracy, and insights. Simplify grading, reduce errors, and empower
          learners.
        </p>

        <div className="flex flex-col md:flex-row gap-4">
          <button 
            className="bg-teal-button px-8 py-3 font-medium rounded-md text-white"
            onClick={() => navigate('/auth')}
          >
            Get Started
          </button>
          <button className="flex items-center gap-2 bg-transparent border border-teal-button text-teal-highlight px-8 py-3 font-medium rounded-md">
            <MdOutlinePlayCircleOutline className="w-5 h-5" />
            See how it works
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
