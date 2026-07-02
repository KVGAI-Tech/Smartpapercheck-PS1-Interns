import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

const EASE_OUT = { type: "spring", stiffness: 110, damping: 22 };

const NAV_LINKS = [
  { name: "Features", href: "#features",                    isExternal: false },
  { name: "Pricing",  href: "#pricing",                     isExternal: false },
  { name: "FAQ",      href: "#faq",                         isExternal: false },
  { name: "Contact",  href: "#contact",                     isExternal: false },
  { name: "Docs",     href: "https://docs.smart-qna.com/",  isExternal: true  },
  { name: "Blogs",    href: "https://blog.smart-qna.com/",  isExternal: true  },
];

const ISLAND = {
  background: "rgba(255,255,255,0.55)",
  backdropFilter: "blur(22px) saturate(180%)",
  WebkitBackdropFilter: "blur(22px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.55)",
  boxShadow:
    "0 8px 28px rgba(10,40,42,0.10), 0 2px 6px rgba(10,40,42,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
  borderRadius: "100px",
};

function MobileMenu({ scrollToSection, activeSection }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setOpen(false);

  return (
    <div className="lg:hidden" style={{ flexShrink: 0 }}>
      <button
        className="p-2 rounded-md bg-accent/10 text-accent relative z-50"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Toggle menu"
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/45 z-40"
                  onClick={close}
                />

                {/* Side Panel */}
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={EASE_OUT}
                  className="fixed top-0 right-0 h-screen w-80 bg-white z-[60] shadow-2xl flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-5 border-b">
                    <span className="font-semibold text-lg text-slate-800">
                      Menu
                    </span>

                    <button
                      onClick={close}
                      className="p-2 rounded-md hover:bg-gray-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Navigation */}
                  <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {NAV_LINKS.map((item, i) => (
                      <motion.a
                        key={item.name}
                        href={item.href}
                        target={item.isExternal ? "_blank" : "_self"}
                        rel={
                          item.isExternal
                            ? "noopener noreferrer"
                            : undefined
                        }
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: i * 0.05,
                          ...EASE_OUT,
                        }}
                        className="block rounded-lg px-4 py-3 text-slate-700 hover:bg-accent/10 hover:text-accent transition-colors"
                        onClick={(e) => {
                          if (!item.isExternal) {
                            e.preventDefault();
                            scrollToSection?.(item.href.slice(1));
                          }
                          close();
                        }}
                      >
                        {item.name}
                      </motion.a>
                    ))}
                  </nav>

                  {/* Footer */}
                  <div className="border-t p-4 space-y-3">
                    <button
                      className="w-full rounded-lg border border-accent py-3 text-accent font-medium hover:bg-accent/10 transition"
                      onClick={() => {
                        close();
                        window.open(
                          "https://blog.smart-qna.com/",
                          "_blank"
                        );
                      }}
                    >
                      Blogs
                    </button>

                    <button
                      className="w-full rounded-lg bg-accent py-3 text-white font-medium hover:opacity-90 transition"
                      onClick={() => {
                        close();
                        navigate("/auth");
                      }}
                    >
                      Get Started
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

const Navbar = ({ scrollToSection, activeSection }) => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  return (
    <>
      {/* Top backdrop-blur strip — softens whatever scrolls behind the navbar */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          height: "130px",
          zIndex: 39,
          pointerEvents: "none",
          backdropFilter: "blur(18px) saturate(160%)",
          WebkitBackdropFilter: "blur(18px) saturate(160%)",
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.30) 55%, rgba(255,255,255,0) 100%)",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* Navbar — three floating islands */}
      <motion.nav
        initial={reduce ? false : { y: -28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...EASE_OUT, delay: 0.1 }}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 40,
          padding: "1rem clamp(1rem, 2.5vw, 1.75rem)",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{
          maxWidth: "1500px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}>
          {/* Island 1 — brand */}
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); scrollToSection?.("home"); }}
            style={{
              ...ISLAND,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 20px 8px 10px",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <img src="/logo_smartqna.png" alt="Smart Paper Check" style={{ height: "28px", display: "block" }} />
            <span style={{
              fontWeight: 700, fontSize: "0.95rem", color: "#0d3234",
              letterSpacing: "-0.01em", whiteSpace: "nowrap",
            }}>
              Smart
              <span style={{ fontWeight: 400, fontStyle: "italic", color: "#166D70" }}> Paper Check</span>
            </span>
          </a>

          {/* Island 2 — nav links */}
          <div
            className="hidden lg:flex"
            style={{
              ...ISLAND,
              alignItems: "center",
              padding: "6px 8px",
              gap: "2px",
            }}
          >
            {NAV_LINKS.map((item) => {
              const isActive = activeSection === item.href.replace('#', '');
              return (
              <a
                key={item.name}
                href={item.href}
                target={item.isExternal ? "_blank" : "_self"}
                rel={item.isExternal ? "noopener noreferrer" : ""}
                onClick={(e) => {
                  if (!item.isExternal) {
                    e.preventDefault();
                    scrollToSection?.(item.href.slice(1));
                  }
                }}
                style={{
                  position: "relative",
                  padding: "8px 14px",
                  borderRadius: "100px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "rgba(10,40,42,0.72)",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#0d3234";
                  e.currentTarget.style.background = "rgba(22,109,112,0.10)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(10,40,42,0.72)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {item.name}
                {isActive && !item.isExternal && (
                  <motion.div
                    layoutId="navbar-active-indicator"
                    style={{
                      position: "absolute",
                      bottom: "2px",
                      left: "14px",
                      right: "14px",
                      height: "2px",
                      backgroundColor: "#166D70",
                      borderRadius: "2px",
                    }}
                  />
                )}
              </a>
            )})}
          </div>

          {/* Island 3 — Get Started CTA */}
          <motion.button
            onClick={() => navigate("/auth")}
            whileTap={{ scale: 0.96, y: 1 }}
            transition={EASE_OUT}
            className="hidden lg:flex"
            style={{
              padding: "11px 24px",
              borderRadius: "100px",
              border: "1px solid rgba(255,255,255,0.22)",
              background: "linear-gradient(180deg, #1a8285 0%, #166D70 100%)",
              backdropFilter: "blur(22px) saturate(180%)",
              WebkitBackdropFilter: "blur(22px) saturate(180%)",
              color: "#fff",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter, system-ui, sans-serif",
              letterSpacing: "-0.005em",
              whiteSpace: "nowrap",
              boxShadow:
                "0 8px 26px rgba(22,109,112,0.38), 0 2px 6px rgba(22,109,112,0.18), inset 0 1px 0 rgba(255,255,255,0.28)",
              transition: "box-shadow 0.18s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 10px 32px rgba(22,109,112,0.48), 0 3px 10px rgba(22,109,112,0.26), inset 0 1px 0 rgba(255,255,255,0.34)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0 8px 26px rgba(22,109,112,0.38), 0 2px 6px rgba(22,109,112,0.18), inset 0 1px 0 rgba(255,255,255,0.28)";
            }}
          >
            Get Started
          </motion.button>

          <MobileMenu scrollToSection={scrollToSection} activeSection={activeSection} />
        </div>
      </motion.nav>
    </>
  );
};

export default Navbar;
