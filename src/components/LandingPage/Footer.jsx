import React from "react";
import { motion } from "framer-motion";

const Footer = () => {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
  ];

  const socialLinks = [
    { 
      name: "Twitter",
      href: "#",
      colorClass: "text-[#1DA1F2] hover:text-[#0c85d0]",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
        </svg>
      )
    },
    {
      name: "LinkedIn",
      href: "#",
      colorClass: "text-[#0A66C2] hover:text-[#074d92]",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      )
    },
    {
      name: "YouTube",
      href: "#",
      colorClass: "text-[#FF0000] hover:text-[#cc0000]",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    }
  ];

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer className="bg-white border-t border-gray-200" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="xl:grid xl:grid-cols-4 xl:gap-8">
          
          {/* Brand Column (Left) */}
          <div className="space-y-6 xl:col-span-1">
            <motion.div 
              className="flex items-center cursor-pointer group"
              onClick={scrollToTop}
              title="Scroll to Top"
            >
              <img 
                src="/logo_smartqna.png" 
                alt="Smart Paper Check Logo" 
                className="h-8 mr-3 transition-transform group-hover:-translate-y-0.5 duration-300" 
              />
              <div className="font-medium text-xl text-gray-900 group-hover:text-teal-700 transition-colors duration-300">
                Smart<span className="font-light italic text-teal-600"> Paper Check</span>
              </div>
            </motion.div>
            <p className="text-gray-600 text-sm leading-6 max-w-xs">
              AI-powered script evaluation platform for universities and educational institutions.
            </p>
            <div className="flex space-x-5 pt-3">
              {socialLinks.map((item) => (
                <a 
                  key={item.name} 
                  href={item.href} 
                  className={`${item.colorClass} hover:scale-110 transition-all duration-300 drop-shadow-sm`}
                >
                  <span className="sr-only">{item.name}</span>
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links Grid (Middle) */}
          <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3 xl:mt-0 xl:col-span-2">
            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Quick Links</h3>
              <ul className="mt-4 space-y-4">
                {quickLinks.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-base text-gray-700 hover:text-teal-600 transition-colors">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Contact</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="mailto:info@smart-qna.com" className="text-base text-gray-700 hover:text-teal-600 transition-colors">
                    info@smart-qna.com
                  </a>
                </li>
                <li>
                  <a href="mailto:support@smart-qna.com" className="text-base text-gray-700 hover:text-teal-600 transition-colors">
                    support@smart-qna.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                {legalLinks.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-base text-gray-700 hover:text-teal-600 transition-colors">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Column (Right) */}
          <div className="mt-12 xl:mt-0 xl:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Newsletter</h3>
            <p className="mt-3 text-sm text-gray-600 leading-6">
              Product updates, AI insights, and tips — straight to your inbox. No spam.
            </p>

            {/* Perks */}
            <ul className="mt-4 space-y-2 mb-6">
              {[
                "Early access to new features",
                "Monthly AI evaluation insights",
                "Unsubscribe anytime",
              ].map((perk) => (
                <li key={perk} className="flex items-center gap-2 text-gray-600 text-xs">
                  <svg className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  {perk}
                </li>
              ))}
            </ul>

            {/* Inline Form */}
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="you@institution.edu"
                className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200"
                required
              />
              <button
                type="submit"
                className="w-full bg-teal-600 text-white text-sm font-medium py-2.5 rounded-md hover:bg-teal-700 transition-colors duration-200"
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>
        
        {/* Bottom Bar */}
        <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Smart Paper Check by KVGAI Tech Pvt. Ltd. All rights reserved.
          </p>
          <p className="text-sm text-gray-600">
            Rajasthan, India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;