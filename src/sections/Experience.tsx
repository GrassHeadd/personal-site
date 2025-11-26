'use client';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { expCards } from "../constants";
import TitleHeader from "../components/TitleHeader";
import GlowCard from "../components/GlowCard";

gsap.registerPlugin(ScrollTrigger);

const Experience = () => {
  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>(".timeline-card").forEach((card) => {
      gsap.from(card, {
        xPercent: -100,
        opacity: 0,
        transformOrigin: "left left",
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 80%",
        },
      });
    });

    gsap.to(".timeline-line", {
      scaleY: 1,
      transformOrigin: "top top",
      ease: "none",
      scrollTrigger: {
        trigger: "#experience",
        start: "top center",
        end: "bottom center",
        scrub: 1,
      },
    });
  }, []);

  return (
    <section id="experience" className="section-padding xl:px-0">
      <div className="w-full h-full md:px-20 px-5">
        <TitleHeader
          title="Professional Work Experience"
          sub="💼 My Career So Far"
        />

        <div className="mt-32 relative">
          {/* Timeline line */}
          <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-1 h-full">
            <div className="timeline-line absolute w-full bg-gradient-to-b from-[#8B5CF6] via-[#A855F7] to-[#F59E0B] scale-y-0 h-full" />
            <div className="absolute w-full h-full bg-black-50 opacity-30" />
          </div>

          {/* Timeline cards */}
          <div className="flex flex-col gap-10">
            {expCards.map((card, index) => (
              <div
                key={card.company}
                className={`timeline-card flex items-center gap-10 md:gap-20 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Card */}
                <div className="flex-1 ml-10 md:ml-0">
                  <GlowCard identifier={`exp-${index}`}>
                    <div className="p-6 md:p-10">
                      <div className="flex items-start justify-between mb-5">
                        <div>
                          <h3 className="text-xl md:text-2xl font-bold text-white">
                            {card.company}
                          </h3>
                          <p className="text-[#F59E0B]">{card.title}</p>
                        </div>
                        <span className="text-sm text-white-50 bg-black-200 px-3 py-1 rounded-full">
                          {card.date}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {card.responsibilities.map((resp, i) => (
                          <li key={i} className="flex items-start gap-2 text-white-50">
                            <span className="text-[#F59E0B] mt-1">•</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </GlowCard>
                </div>

                {/* Timeline dot */}
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-4 h-4 bg-[#F59E0B] rounded-full border-4 border-black" />

                {/* Spacer for alternating layout */}
                <div className="hidden md:block flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
