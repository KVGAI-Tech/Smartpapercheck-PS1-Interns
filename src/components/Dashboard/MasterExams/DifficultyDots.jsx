/* eslint-disable react/prop-types */

/**
 * Difficulty indicator with colored dots.
 * Easy = 1 green dot, Medium = 2 amber dots, Hard = 3 red dots.
 */
export default function DifficultyDots({ level }) {
  const label = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }[level] || level;
  const safeLevel = ['easy', 'medium', 'hard'].includes(level) ? level : 'easy';

  return (
    <span className={`ws-diff ws-diff--${safeLevel}`}>
      <span className="ws-diff__dots">
        <span /><span /><span />
      </span>
      {label}
    </span>
  );
}
