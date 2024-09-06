import CompDataset from "@/public/svg/CompDataset";
import DataDelivery from "@/public/svg/DataDelivery";
import Image from "next/image";

export default function Features() {
  return (
    <section className="py-16 bg-white-100">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Features</h2>

        {/* Feature 1 */}
        <div className="flex flex-col md:flex-row gap-8 mb-16">
          <div className="md:w-1/2">
            <h3 className="text-2xl font-bold mb-4">Comprehensive Datasets</h3>
            <h4 className="text-3xl font-bold mb-4">
              Access Real-World Business Data
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center">
                <span className="text-blue-600 mr-2">+</span>
                Extensive collection of datasets tailored for MBA programs
              </li>
              <li className="flex items-center">
                <span className="text-blue-600 mr-2">+</span>
                Real-world data to bridge the gap between theory and practice
              </li>
              <li className="flex items-center">
                <span className="text-blue-600 mr-2">+</span>
                Regularly updated to reflect current business trends
              </li>
            </ul>
            <div className="mt-8 space-x-4">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-full">
                Learn More
              </button>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-full">
                Demo
              </button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            {/* <Image
              src="/datasets.png"
              alt="Datasets Screenshot"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            /> */}
            <CompDataset />
          </div>
        </div>

        {/* Animation Line */}
        {/* <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 mb-16"></div> */}

        {/* Feature 2 */}
        <div className="flex flex-col md:flex-row gap-8 mb-16">
          <div className="md:w-1/2 order-2 md:order-1 flex justify-center">
            {/* <Image src="/ai-insights.png" alt="AI Insights Screenshot" width={600} height={400} className="rounded-lg shadow-lg" /> */}
            <DataDelivery />
          </div>
          <div className="md:w-1/2 order-1 md:order-2">
            <h3 className="text-2xl font-bold mb-4">AI-Powered Insights</h3>
            <h4 className="text-3xl font-bold mb-4">
              Leverage Advanced Analytics
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center">
                <span className="text-blue-600 mr-2">+</span>
                Gain insights with AI-driven data analysis
              </li>
              <li className="flex items-center">
                <span className="text-blue-600 mr-2">+</span>
                Predictive analytics for better decision making
              </li>
              <li className="flex items-center">
                <span className="text-blue-600 mr-2">+</span>
                Customizable reports and dashboards
              </li>
            </ul>
            <div className="mt-8 space-x-4">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-full">
                Learn More
              </button>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-full">
                Demo
              </button>
            </div>
          </div>
        </div>

        {/* Animation Line */}
        {/* <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 mb-16"></div> */}

        {/* Feature 3 */}
        <div className="flex flex-col md:flex-row gap-8 mb-16">
          <div className="md:w-1/2">
            <h3 className="text-2xl font-bold mb-4">Collaboration Tools</h3>
            <h4 className="text-3xl font-bold mb-4">
              Enhance Teamwork and Communication
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center">
                <span className="text-blue-600 mr-2">+</span>
                Seamless integration with popular collaboration platforms
              </li>
              <li className="flex items-center">
                <span className="text-blue-600 mr-2">+</span>
                Real-time data sharing and collaboration
              </li>
              <li className="flex items-center">
                <span className="text-blue-600 mr-2">+</span>
                Tools to facilitate group projects and discussions
              </li>
            </ul>
            <div className="mt-8 space-x-4">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-full">
                Learn More
              </button>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-full">
                Demo
              </button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            {/* <Image
              src="/collaboration-tools.png"
              alt="Collaboration Tools Screenshot"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            /> */}
            <DataDelivery />
          </div>
        </div>

        {/* Animation Line */}
        {/* <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 mb-16"></div> */}

        {/* Feature 4 */}
        <div className="flex flex-col md:flex-row gap-8 mb-16">
          <div className="md:w-1/2 order-2 md:order-1 flex justify-center">
            {/* <Image
              src="/customizable-reports.png"
              alt="Customizable Reports Screenshot"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            /> */}
            <CompDataset />
          </div>
          <div className="md:w-1/2 order-1 md:order-2">
            <h3 className="text-2xl font-bold mb-4">Customizable Reports</h3>
            <h4 className="text-3xl font-bold mb-4">
              Tailor Reports to Your Needs
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center">
                <span className="text-blue-600 mr-2">+</span>
                Create and customize reports with ease
              </li>
              <li className="flex items-center">
                <span className="text-blue-600 mr-2">+</span>
                Export reports in various formats
              </li>
              <li className="flex items-center">
                <span className="text-blue-600 mr-2">+</span>
                Share reports with stakeholders
              </li>
            </ul>
            <div className="mt-8 space-x-4">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-full">
                Learn More
              </button>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-full">
                Demo
              </button>
            </div>
          </div>
        </div>

        {/* Animation Line */}
        {/* <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 mb-16"></div> */}

        {/* Feature 5 */}
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <h3 className="text-2xl font-bold mb-4">Scalable Solutions</h3>
            <h4 className="text-3xl font-bold mb-4">Grow with Your Needs</h4>
            <ul className="space-y-4">
              <li className="flex items-center">
                <span className="text-blue-600 mr-2">+</span>
                Solutions that scale with your institution
              </li>
              <li className="flex items-center">
                <span className="text-blue-600 mr-2">+</span>
                Flexible plans to accommodate growth
              </li>
              <li className="flex items-center">
                <span className="text-blue-600 mr-2">+</span>
                Support for large datasets and user bases
              </li>
            </ul>
            <div className="mt-8 space-x-4">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-full">
                Learn More
              </button>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-full">
                Demo
              </button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            {/* <Image
              src="/collaboration-tools.png"
              alt="Collaboration Tools Screenshot"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            /> */}
            <DataDelivery />
          </div>
        </div>
      </div>
    </section>
  );
}
