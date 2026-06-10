interface SquiggleProps {
  className?: string;
  color?: string;
}

/** Hand-drawn underline stroke. Width scales to its container. */
const Squiggle = ({ className = "", color = "var(--forest)" }: SquiggleProps) => (
  <svg
    className={`squiggle ${className}`}
    viewBox="0 0 220 12"
    fill="none"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path
      d="M3 8.5C25 3.5 40 9.5 62 7C84 4.5 99 10 121 7.5C143 5 158 9.5 180 6.5C195 4.5 207 7 217 5.5"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

export default Squiggle;
