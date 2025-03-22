import React from "react";

const Feature = ({ tag, title, desc, image, row }) => {
  return (
    <div className={`feedback-container text-left ${row ? "col-span-1 md:col-span-2" : ""}`}>
      <div className={`feedback-box ${row ? "flex flex-col md:flex-row md:justify-between" : ""}`}>
        <div className="feedback-oval" />

        <div className={row ? "md:max-w-[30%]" : ""}>
          <div className="border rounded-full py-1 px-5 border-teal-button text-teal-highlight w-max text-xs">
            {tag}
          </div>

          <h1 className="font-semibold text-xl md:text-2xl my-5 text-white">{title}</h1>
          <p className="my-5 text-white opacity-90">{desc}</p>
        </div>

        <div className={row ? "w-full md:w-[50%]" : ""}>
          <img
            src={image}
            alt="Feature"
            className="mx-auto translate-y-[2rem]"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x200?text=Feature+Image';
            }}
          />
        </div>
      </div>
    </div>
  );
};

const Features = () => {
  return (
    <section className="text-center py-20 bg-[#0B1011] relative overflow-hidden">
      <div className="bg-gradient__2 flex flex-col items-center justify-center relative py-40">
        <div className="inner-oval" />

        <h1 className="font-medium text-4xl md:text-6xl mb-6 text-center relative z-10 text-teal-highlight">
          Features to Simplify
          <br /> Evaluation
        </h1>

        <p className="max-w-3xl mx-auto text-xl text-white relative z-10 px-4 mt-4">
          AI-powered features to streamline grading, course management, and
          <br className="hidden md:block" /> script evaluation— efficient, accurate, and effortless.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-4 md:px-10 lg:px-40 my-10">
        <Feature
          title="Track Students, TAs & Courses in Real Time—Stay on Top of Progress"
          desc="Smart QnA simplifies course management—track student progress, update materials, and organize content seamlessly. Stay on top of everything with real-time insights and efficient course handling"
          image="/Group 72 (1).png"
          tag="Manage Course"
        />

        <Feature
          title="Streamline course management- track, update, with ease"
          desc="Get a clear view of total students and courses and their grade distribution at a glance. Monitor progress effortlessly and make informed decisions"
          image="/Group 72 (1).png"
          tag="Insights"
        />

        <Feature
          title="AI-powered PDF annotation highlight, comment, and evaluate scripts with ease"
          desc="Smart QnA's AI-powered PDF annotator lets you effortlessly highlight, comment, and evaluate handwritten scripts. Streamline the review process with precision, speed, and insightful feedback all in one place"
          image="/Group 72 (1).png"
          tag="Insights"
          row={true}
        />
      </div>
    </section>
  );
};

export default Features;