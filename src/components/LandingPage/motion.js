// Shared animation presets for in-section element animations.
//
// Goal: every section's smaller elements (cards, list items, badges, buttons,
// stats) animate with the same timing, easing, and feel — so the page reads as
// one cohesive motion language instead of each section doing its own thing.
//
// Scope note: these presets are for the *inner* elements of a section. The
// overall section scroll entrances are handled separately; this module is meant
// to complement that, not replace it. Prefer importing from here over writing
// one-off `transition={{ duration: ... }}` values inline.

// Single source of truth for motion speed + easing.
export const EASE = [0.22, 1, 0.36, 1]; // gentle ease-out, matches the page's reveal feel
export const DURATION = 0.5;
export const TRANSITION = { duration: DURATION, ease: EASE };

// Reveal a single element from slightly below as it enters view.
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: TRANSITION },
};

// Opacity-only reveal — use where vertical travel would feel heavy.
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: TRANSITION },
};

// Parent that releases its children one after another.
export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

// Child of staggerContainer — same feel as fadeUp.
export const staggerItem = fadeUp;

// Shared viewport config so every reveal triggers at the same scroll point, once.
export const viewportOnce = { once: true, amount: 0.2 };

// Consistent hover/tap feedback for buttons and small interactive controls.
export const hoverLift = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring", stiffness: 400, damping: 22 },
};

// Consistent hover for larger content cards — a subtle upward lift instead of a
// scale, so cards don't visually jump. Base shadows stay in the card's classes.
export const hoverCard = {
  whileHover: { y: -6 },
  transition: { type: "spring", stiffness: 300, damping: 24 },
};
