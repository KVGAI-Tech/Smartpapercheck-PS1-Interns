import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useEffect, useState } from "react";
import { HiOutlineMenu, HiX } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

// ---------------------------------------------------------------------------
// Shared nav items — single source of truth for desktop, mobile, and footer
// ---------------------------------------------------------------------------
const NAV_ITEMS = [
  { name: "Home", sectionId: "home" },
  { name: "Features", sectionId: "features" },
  { name: "Pricing", sectionId: "pricing" },
  { name: "FAQ", sectionId: "faq" },
  { name: "Contact", sectionId: "contact" },
  { name: "Docs", href: "https://docs.smart-qna.com/" },
];

// ---------------------------------------------------------------------------
// Mobile Menu
// ---------------------------------------------------------------------------
const MobileMenu = ({ scrollToSection, activeSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavClick = (item) => {
    if (item.href) {
      // External link — let the browser handle it
      return;
    }
    // Scroll to section, then close menu
    scrollToSection(item.sectionId);
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden">
      <button
        className="p-2 rounded-md bg-accent/10 text-accent"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <HiX className="w-6 h-6" />
        ) : (
          <HiOutlineMenu className="w-6 h-6" />
        )}
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50 overflow-y-auto"
      >
        <div className="p-6 text-gray-900">
          <div className="flex justify-between items-center mb-8">
            <img src="/logo_smartqna.png" alt="Smart Paper Check Logo" className="h-7" />
            <button onClick={() => setIsOpen(false)} className="p-2 rounded-md hover:bg-gray-100">
              <HiX className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = item.sectionId && activeSection === item.sectionId;
              return item.href ? (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-3 px-4 border-l-2 border-transparent hover:border-accent hover:bg-accent/5 rounded-r-lg transition-all duration-200 text-base text-gray-800"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </a>
              ) : (
                <button
                  key={item.name}
                  className={`block w-full text-left py-3 px-4 border-l-2 rounded-r-lg transition-all duration-200 text-base ${
                    isActive
                      ? "border-accent bg-accent/5 text-accent font-medium"
                      : "border-transparent hover:border-accent hover:bg-accent/5 text-gray-800"
                  }`}
                  onClick={() => handleNavClick(item)}
                >
                  {item.name}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 space-y-4">
            <a
              href="https://blog.smart-qna.com/"
              className="w-full py-3 px-6 border border-accent text-accent rounded-md text-base font-medium hover:bg-accent/10 transition-colors duration-200 block text-center"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
            >
              Blogs
            </a>

            <button
              className="w-full bg-accent py-3 px-6 rounded-md text-base font-medium hover:bg-accent/90 transition-colors duration-200 text-white"
              onClick={() => {
                setIsOpen(false);
                navigate("/auth");
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Desktop + Mobile Navbar
// ---------------------------------------------------------------------------
const Navbar = ({ scrollToSection, activeSection }) => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e, item) => {
    if (item.href) {
      // External link — don't prevent default
      return;
    }
    e.preventDefault();
    scrollToSection(item.sectionId);
  };

  return (
    <motion.nav
      className={`fixed w-full py-4 px-4 lg:px-12 z-40 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-lg shadow-md" : "bg-transparent"
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex items-center flex-shrink-0 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          onClick={() => scrollToSection("home")}
        >
          <img
            src="/logo_smartqna.png"
            alt="Smart Paper Check Logo"
            className="h-7 sm:h-8 mr-2 sm:mr-3"
          />
          <div className="font-medium text-xl sm:text-2xl text-gray-900 whitespace-nowrap">
            Smart<span className="font-light italic text-accent"> Paper Check</span>
          </div>
        </motion.div>

        {/* Desktop nav links */}
        <LayoutGroup>
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {NAV_ITEMS.map((item) => {
              const isActive = item.sectionId && activeSection === item.sectionId;
              return (
                <motion.a
                  key={item.name}
                  href={item.href || `#${item.sectionId}`}
                  className={`relative font-medium py-2 px-3 text-sm xl:text-base transition-colors duration-200 ${
                    isActive ? "text-accent" : "text-gray-700 hover:text-accent"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  target={item.href ? "_blank" : "_self"}
                  rel={item.href ? "noopener noreferrer" : ""}
                  onClick={(e) => handleNavClick(e, item)}
                >
                  {item.name}
                  {/* Sliding underline indicator — layoutId makes it animate smoothly between links */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-indicator"
                      className="absolute bottom-0 left-0 right-0 mx-auto h-[2px] bg-accent rounded-full"
                      style={{ width: "calc(100% - 1.2rem)" }}
                      transition={{
                        type: "tween",
                        ease: "easeOut",
                        duration: 0.25,
                      }}
                    />
                  )}
                </motion.a>
              );
            })}
          </div>
        </LayoutGroup>

        {/* Desktop action buttons */}
        <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
          <motion.a
            href="https://blog.smart-qna.com/"
            className="py-2 px-4 xl:px-6 border border-accent text-accent rounded-md font-medium hover:bg-accent/10 transition-colors duration-200 text-sm xl:text-base"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Blogs
          </motion.a>

          <motion.button
            className="bg-accent py-2 px-4 xl:px-6 rounded-md font-medium text-white hover:bg-accent/90 transition-opacity duration-200 shadow-md text-sm xl:text-base"
            onClick={() => navigate("/auth")}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Get Started
          </motion.button>
        </div>

        <MobileMenu scrollToSection={scrollToSection} activeSection={activeSection} />
      </div>
    </motion.nav>
  );
};

export default Navbar;
