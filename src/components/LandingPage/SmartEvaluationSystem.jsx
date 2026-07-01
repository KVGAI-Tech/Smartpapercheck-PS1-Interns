import { motion } from "framer-motion";
import { HiOutlineDocumentText, HiOutlineChartPie, HiOutlineChatBubbleBottomCenterText, HiOutlineChartBar } from "react-icons/hi2";

const features = [
  {
    title: "Handwritten Text Recognition",
    desc: "Digitize and process student handwriting instantly from scanned answer scripts.",
    icon: <HiOutlineDocumentText className="w-7 h-7" />
  },
  {
    title: "Diagram & Equation Evaluation",
    desc: "Accurately interpret complex sketches, technical graphs, and mathematical equations.",
    icon: <HiOutlineChartPie className="w-7 h-7" />
  },
  {
    title: "Automated Feedback Generation",
    desc: "Provide students with step-by-step reasoning and personalized feedback for every grade.",
    icon: <HiOutlineChatBubbleBottomCenterText className="w-7 h-7" />
  },
  {
    title: "Comprehensive Analytics",
    desc: "Track institutional performance, visualize cohort trends, and identify knowledge gaps.",
    icon: <HiOutlineChartBar className="w-7 h-7" />
  }
];

const SmartEvaluationSystem = () => {
  return (
    <section className="w-full py-20 md:py-28 bg-white relative z-10 border-t border-slate-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            Smart Evaluation System
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Everything you need to automate academic grading with complete transparency and human-level accuracy.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-white p-8 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:border-accent/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col sm:flex-row items-start gap-6 group cursor-default"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="w-14 h-14 bg-accent/5 border border-accent/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:scale-105 transition-all duration-300">
                <div className="text-accent group-hover:text-white transition-colors duration-300 flex items-center justify-center">
                  {item.icon}
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-accent transition-colors duration-300">{item.title}</h4>
                <p className="text-base text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SmartEvaluationSystem;
