import { HiOutlineCurrencyRupee, HiOutlineClock, HiOutlineShieldCheck } from "react-icons/hi";

const highlights = [
  {
    icon: <HiOutlineCurrencyRupee className="w-8 h-8 text-accent" />,
    title: "TA Cost Savings",
    main: "₹20,000/semester (India)",
    sub: "$30/hour (US)",
    desc: "Automated grading at a fraction of the cost.",
  },
  {
    icon: <HiOutlineClock className="w-8 h-8 text-accent" />,
    title: "Time Savings",
    main: "500 scripts in 5 minutes",
    desc: "Instant results, no bottlenecks. Grade a full batch simultaneously.",
  },
  {
    icon: <HiOutlineShieldCheck className="w-8 h-8 text-accent" />,
    title: "Accuracy & Fairness",
    main: "Undergrades by 1-3% (by design)",
    desc: "AI flags bad handwriting and ambiguous answers for manual review. Ensures no unfair overgrading.",
  },
];

export default function LandingHighlights() {
  return (
    <section className="w-full py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        {highlights.map((h, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col gap-3 hover:shadow-2xl transition"
          >
            <div className="flex items-center gap-2 mb-2">
              {h.icon}
              <span className="text-lg font-bold text-gray-900">{h.title}</span>
            </div>
            <div className="text-xl font-bold text-accent">{h.main}</div>
            {h.sub && <div className="text-base font-semibold text-accent/80">{h.sub}</div>}
            <div className="text-sm text-gray-600 mt-2">{h.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}