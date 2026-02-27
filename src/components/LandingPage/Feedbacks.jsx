import React from "react";

const FeedbackCard = ({ desc, user }) => {
  return (
    <div className="feedback-container">
      <div className="feedback-box">
        <div className="feedback-oval" />

        <p className="font-medium text-[#BFBFBF]">"{desc}"</p>
        <p className="my-5 font-medium text-[#BFBFBF]">-{user}</p>
      </div>
    </div>
  );
};

const Feedbacks = () => {
  const feedbacks1 = [
    {
      desc: "Smart Paper Check has completely transformed our grading process. It's fast, reliable, and incredibly accurate.",
      user: "Vinay Chamola",
    },
    {
      desc: "Scaling up evaluations across multiple campuses was always a challenge, but Smart Paper Check made it effortless. The cloud-based system allowed us to integrate our existing tools seamlessly, while the robust AI ensured accuracy and fairness in grading. It's a smart, reliable, and scalable solution that's become an indispensable part of our academic operations.",
      user: "Vinay Chamola",
    },
    {
      desc: "Smart Paper Check has completely transformed our evaluation process. The AI-powered automation saves us hours of manual work, and the accuracy is unmatched!",
      user: "Vinay Chamola",
    },
    {
      desc: "Smart Paper Check intuitive interface and real-time feedback have made evaluation a breeze. It's the perfect blend of technology and education.",
      user: "Vinay Chamola",
    },
  ];

  const feedbacks2 = [
    {
      desc: "Smart Paper Check has revolutionized how we handle answer script evaluations. What used to take days can now be completed in hours with unparalleled precision. The AI-driven automation and customizable scoring have significantly reduced manual errors, while insightful analytics give us a clear view of student performance trends. It's a seamless and secure solution that has truly elevated our evaluation standards.",
      user: "Vinay Chamola",
    },
    {
      desc: "Thanks to Smart Paper Check, we've been able to scale our operations effortlessly without compromising on quality. The integration was seamless!",
      user: "Vinay Chamola",
    },
    {
      desc: "Smart Paper Check intuitive interface and real-time feedback have made evaluation a breeze. It's the perfect blend of technology and education.",
      user: "Vinay Chamola",
    },
  ];

  const feedbacks3 = [
    {
      desc: "Smart Paper Check has completely transformed our evaluation process. The AI-powered automation saves us hours of manual work, and the accuracy is unmatched!",
      user: "Vinay Chamola",
    },
    {
      desc: "Smart Paper Check intuitive interface and real-time feedback have made evaluation a breeze. It's the perfect blend of technology and education.",
      user: "Vinay Chamola",
    },
    {
      desc: "Scaling up evaluations across multiple campuses was always a challenge, but Smart Paper Check made it effortless. The cloud-based system allowed us to integrate our existing tools seamlessly, while the robust AI ensured accuracy and fairness in grading. It's a smart, reliable, and scalable solution that's become an indispensable part of our academic operations.",
      user: "Vinay Chamola",
    },
  ];

  return (
    <section className="pb-20 md:pb-[20rem]">
      <h1 className="font-medium text-4xl md:text-6xl/relaxed mb-6 radial-text__cyan__30 text-center">
        Real feedbacks from satisfied <br />
        customers
      </h1>
      <p className="max-w-3xl mx-auto text-xl text-center">
        Trusted by educators for fast, accurate, and AI-driven script
        evaluation.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 px-4 md:px-10 lg:px-32 mt-6">
        <div>
          {feedbacks1.map((feedback, index) => (
            <FeedbackCard key={index} desc={feedback.desc} user={feedback.user} />
          ))}
        </div>
        <div className="hidden md:block">
          {feedbacks2.map((feedback, index) => (
            <FeedbackCard key={index} desc={feedback.desc} user={feedback.user} />
          ))}
        </div>
        <div className="hidden md:block">
          {feedbacks3.map((feedback, index) => (
            <FeedbackCard key={index} desc={feedback.desc} user={feedback.user} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Feedbacks;