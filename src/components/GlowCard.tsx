'use client';
import { useRef, type ReactNode } from "react";

interface GlowCardProps {
  identifier: string;
  children: ReactNode;
}

const GlowCard = ({ identifier, children }: GlowCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;

    const angle = Math.atan2(mouseY, mouseX) * (180 / Math.PI);

    card.style.setProperty("--start", `${angle + 60}`);

    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(circle at ${e.clientX - rect.left}px ${e.clientY - rect.top}px, rgba(255, 255, 255, 0.1), transparent 70%)`;
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`card card-border rounded-xl relative ${identifier}`}
    >
      <div ref={glowRef} className="glow" />
      {children}
    </div>
  );
};

export default GlowCard;
