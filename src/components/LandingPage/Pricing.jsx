import React from "react";

// PricingCard Component
const PricingCard = ({ quantity, price, plan, features, center }) => {
  return (
    <div className={`feedback-container ${center ? "md:scale-105" : ""}`}>
      <div className="feedback-box">
        <div className="feedback-oval" />

        <div className="flex items-center justify-between">
          <p className={`text-[#848484] ${center ? "" : "text-sm"}`}>
            Chosen by {quantity} customers
          </p>

          <div
            className={`border rounded-full py-1 px-5 ${
              center
                ? "border-[#4AB8AF] text-[#4AB8AF]"
                : "border-[#1E332E] text-sm"
            }`}
          >
            {plan}
          </div>
        </div>

        <h1
          className={`font-semibold gap-2 my-5 ${
            center ? "text-3xl" : "text-2xl"
          }`}
        >
          ₹{price}
          <span className="text-[#848484] text-sm font-normal">/per month</span>
        </h1>

        <p className="text-[#848484]">Best for (reason)</p>

        <hr className="border-[#1E332E] my-4" />

        <div className="mb-20">
          {features.map((feature, idx) => (
            <div
              key={`feature_${idx}`}
              className="my-4 flex items-center gap-2"
            >
              <img
                src="/check.png"
                width={24}
                height={24}
                alt="Check"
              />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <div className={center ? "rainbow-button cursor-pointer" : ""}>
          <div className="border border-[#1E332E] bg-background rounded-full py-4 px-5 text-center font-medium cursor-pointer">
            Start 14-day free trial
          </div>
        </div>
      </div>
    </div>
  );
};

const Pricing = () => {
  const features = ["Feature 01", "Feature 02", "Feature 03", "Feature 04"];

  return (
    <section className="min-h-screen pb-20">
      <h1 className="font-medium text-4xl md:text-6xl/relaxed mb-6 radial-text__cyan__30 text-center">
        Explore Plan & Pricing
      </h1>
      <p className="max-w-3xl mx-auto text-xl text-center mb-10 md:mb-20 px-4">
        Flexible pricing plans designed to fit institutions
        <br /> of all sizes—pay for what you need, scale as you
        <br /> grow.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4 md:px-10 lg:px-32">
        <PricingCard
          quantity="x,xx"
          price="X,XX"
          plan="Basic"
          features={features}
        />
        <PricingCard
          quantity="x,xx"
          price="X,XX"
          plan="Premium"
          features={features}
          center={true}
        />
        <PricingCard
          quantity="x,xx"
          price="X,XX"
          plan="Enterprise"
          features={features}
        />
      </div>
    </section>
  );
};

export default Pricing;