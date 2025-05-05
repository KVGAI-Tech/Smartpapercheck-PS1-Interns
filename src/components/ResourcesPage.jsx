import React, { useEffect, useState } from "react";

import Navbar from "./LandingPage/Navbar";
import {
  Download,
  ExternalLink,
  FileText,
  Play,
  BookOpen,
  FileQuestion,
  Award,
  Users,
  Mail,
} from "lucide-react";

const ResourcesPage = () => {
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
    <div className="landing-page">
      <div className="relative h-24">
        <Navbar />
      </div>

      <div className="bg-gradient__2 w-full flex flex-col items-center justify-center relative py-40 my-10">
        <div className="inner-oval" />

        <h1 className="font-bold text-4xl md:text-6xl mb-6 text-center relative z-10 radial-text__cyan translate-y-8">
          Resources
        </h1>

        <p className="max-w-3xl mx-auto text-xl text-center text-white relative z-10 px-4 mt-4">
          Explore our collection of materials to learn more about KVGAI Tech's
          AI-powered educational solutions
        </p>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ResourceCard
          icon={<Play className="h-8 w-8 text-teal-400" />}
          title="Product Demos & Walkthroughs"
          description="Explore our product features through guided video demonstrations"
          links={[
            {
              label: "SmartQnA Demo",
              href: "#",
              icon: <ExternalLink className="h-4 w-4 ml-2" />,
            },
            {
              label: "Aviator LLM Walkthrough",
              href: "#",
              icon: <ExternalLink className="h-4 w-4 ml-2" />,
            },
            {
              label: "Feature Overview",
              href: "#",
              icon: <ExternalLink className="h-4 w-4 ml-2" />,
            },
          ]}
        />

        <ResourceCard
          icon={<FileText className="h-8 w-8 text-teal-400" />}
          title="Whitepapers & Technical Blogs"
          description="In-depth technical resources about our AI technology and methodologies"
          links={[
            {
              label: "RAG Pipeline Whitepaper",
              href: "#",
              icon: <Download className="h-4 w-4 ml-2" />,
            },
            {
              label: "Marking Rubric System",
              href: "#",
              icon: <ExternalLink className="h-4 w-4 ml-2" />,
            },
            {
              label: "AI in Education Blog",
              href: "#",
              icon: <ExternalLink className="h-4 w-4 ml-2" />,
            },
          ]}
        />

        <ResourceCard
          icon={<BookOpen className="h-8 w-8 text-teal-400" />}
          title="Pitch Deck / Company Profile"
          description="Learn about our company vision, mission, and growth trajectory"
          links={[
            {
              label: "Company Pitch Deck",
              href: "#",
              icon: <Download className="h-4 w-4 ml-2" />,
            },
            {
              label: "KVGAI Fact Sheet",
              href: "#",
              icon: <Download className="h-4 w-4 ml-2" />,
            },
            {
              label: "Investment Overview",
              href: "#",
              icon: <Download className="h-4 w-4 ml-2" />,
            },
          ]}
        />

        <ResourceCard
          icon={<FileQuestion className="h-8 w-8 text-teal-400" />}
          title="FAQs for Institutions / Educators"
          description="Common questions about implementation, grading logic, and integration"
          links={[
            {
              label: "Grading Logic FAQ",
              href: "#",
              icon: <ExternalLink className="h-4 w-4 ml-2" />,
            },
            {
              label: "Rubric Explainability",
              href: "#",
              icon: <ExternalLink className="h-4 w-4 ml-2" />,
            },
            {
              label: "LMS Integration Guide",
              href: "#",
              icon: <ExternalLink className="h-4 w-4 ml-2" />,
            },
          ]}
        />

        <ResourceCard
          icon={<Award className="h-8 w-8 text-teal-400" />}
          title="Research Highlights / Publications"
          description="Academic papers, research findings, and industry contributions"
          links={[
            {
              label: "AI Assessment Paper",
              href: "#",
              icon: <Download className="h-4 w-4 ml-2" />,
            },
            {
              label: "Educational AI Research",
              href: "#",
              icon: <ExternalLink className="h-4 w-4 ml-2" />,
            },
            {
              label: "Conference Presentations",
              href: "#",
              icon: <ExternalLink className="h-4 w-4 ml-2" />,
            },
          ]}
        />

        <ResourceCard
          icon={<FileText className="h-8 w-8 text-teal-400" />}
          title="Media Kit"
          description="Brand assets, guidelines, and media resources for partners and press"
          links={[
            {
              label: "Logo Package",
              href: "#",
              icon: <Download className="h-4 w-4 ml-2" />,
            },
            {
              label: "Brand Guidelines",
              href: "#",
              icon: <Download className="h-4 w-4 ml-2" />,
            },
            {
              label: "Press Materials",
              href: "#",
              icon: <Download className="h-4 w-4 ml-2" />,
            },
          ]}
        />

        <ResourceCard
          icon={<Users className="h-8 w-8 text-teal-400" />}
          title="Case Studies / Testimonials"
          description="Success stories and feedback from our institutional partners"
          links={[
            {
              label: "WILP Pilot Case Study",
              href: "#",
              icon: <ExternalLink className="h-4 w-4 ml-2" />,
            },
            {
              label: "User Testimonials",
              href: "#",
              icon: <ExternalLink className="h-4 w-4 ml-2" />,
            },
            {
              label: "Impact Metrics",
              href: "#",
              icon: <ExternalLink className="h-4 w-4 ml-2" />,
            },
          ]}
        />

        <ResourceCard
          icon={<Mail className="h-8 w-8 text-teal-400" />}
          title="Contact / Support"
          description="Get in touch with our team for demos, support, or partnerships"
          links={[
            {
              label: "Schedule a Demo",
              href: "#",
              icon: <ExternalLink className="h-4 w-4 ml-2" />,
            },
            {
              label: "Support Portal",
              href: "#",
              icon: <ExternalLink className="h-4 w-4 ml-2" />,
            },
            {
              label: "Contact Sales",
              href: "mailto:sales@kvgai.tech",
              icon: <ExternalLink className="h-4 w-4 ml-2" />,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default ResourcesPage;

function ResourceCard({ icon, title, description, links }) {
  return (
    <div className="bg-inherit border border-[#277698] text-white h-full flex flex-col p-4 rounded-lg">
      <div className="flex flex-row items-center gap-4 pb-2">
        <div className="bg-slate-800 p-3 rounded-full">{icon}</div>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="pb-4">
        <p className="text-slate-400 text-base">{description}</p>
      </div>
    </div>
  );
}
