import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";
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

function MobileMenu({ fnMap }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setOpen(false);

  return (
    <div className="lg:hidden" style={{ flexShrink: 0 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Toggle navigation menu"
        style={{
          ...ISLAND,
          width: "44px", height: "44px",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#0d3234", cursor: "pointer",
        }}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <div
          onClick={close}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(10,40,42,0.38)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 48,
          }}
        />
      )}

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: open ? 0 : "100%" }}
        transition={EASE_OUT}
        style={{
          position: "fixed", top: 0, right: 0,
          width: "min(300px, 86vw)",
          height: "100dvh",
          background: "#ffffff",
          zIndex: 49,
          boxShadow: "-16px 0 48px rgba(10,40,42,0.12)",
          display: "flex", flexDirection: "column",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid rgba(22,109,112,0.10)",
          background: "#ffffff",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img src="/logo_smartqna.png" alt="Smart Paper Check" style={{ height: "24px" }} />
            <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0d3234", letterSpacing: "-0.01em" }}>
              Smart<span style={{ fontWeight: 400, fontStyle: "italic", color: "#166D70" }}> Paper Check</span>
            </span>
          </div>
          <button onClick={close} style={{
            width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "6px", border: "none", background: "transparent",
            color: "rgba(10,40,42,0.40)", cursor: "pointer",
          }}>
            <X size={15} />
          </button>
        </div>

        <nav style={{ padding: "0.75rem", flex: 1, background: "#ffffff" }}>
          {NAV_LINKS.map((item, i) => (
            <motion.a
              key={item.name}
              href={item.href}
              target={item.isExternal ? "_blank" : "_self"}
              rel={item.isExternal ? "noopener noreferrer" : ""}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, ...EASE_OUT }}
              onClick={(e) => {
                if (!item.isExternal && fnMap[item.name]) {
                  e.preventDefault(); fnMap[item.name]();
                }
                close();
              }}
              style={{
                display: "block", padding: "11px 14px", borderRadius: "8px",
                fontSize: "0.9375rem", fontWeight: 500, color: "rgba(10,40,42,0.68)",
                textDecoration: "none", transition: "background 0.15s, color 0.15s",
                marginBottom: "2px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(22,109,112,0.07)"; e.currentTarget.style.color = "#0d3234"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(10,40,42,0.68)"; }}
            >
              {item.name}
            </motion.a>
          ))}
        </nav>

        <div style={{ padding: "1rem 1rem 2.5rem", display: "flex", flexDirection: "column", gap: "10px", background: "#ffffff" }}>
          <button
            onClick={() => { close(); navigate("/auth"); }}
            style={{
              padding: "12px 20px", borderRadius: "100px",
              border: "none", background: "#166D70",
              color: "#fff", fontSize: "0.9375rem", fontWeight: 600,
              cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif", minHeight: "44px",
            }}
          >
            Get Started
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const Navbar = ({ scrollToFeatures, scrollToPricing, scrollToFaq, scrollToContact, scrollToHome }) => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const fnMap = {
    Home: scrollToHome, Features: scrollToFeatures,
    Pricing: scrollToPricing, FAQ: scrollToFaq, Contact: scrollToContact,
  };

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
            onClick={(e) => { e.preventDefault(); scrollToHome?.(); }}
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
            {NAV_LINKS.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target={item.isExternal ? "_blank" : "_self"}
                rel={item.isExternal ? "noopener noreferrer" : ""}
                onClick={(e) => {
                  if (!item.isExternal && fnMap[item.name]) {
                    e.preventDefault(); fnMap[item.name]();
                  }
                }}
                style={{
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
              </a>
            ))}
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

          <MobileMenu fnMap={fnMap} />
        </div>
      </motion.nav>
    </>
  );
};

export default Navbar;
