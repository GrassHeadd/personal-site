'use client';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import TitleHeader from "../components/TitleHeader";

const skills = [
  {
    title: "Full Stack",
    techs: ["React", "Next.js", "Node.js", "Django", "FastAPI", "PostgreSQL", "Redis"],
  },
  {
    title: "ML & AI",
    techs: ["PyTorch", "HuggingFace", "LangGraph", "RAG", "LoRA", "vLLM", "DSPy"],
  },
  {
    title: "Languages",
    techs: ["Python", "TypeScript", "JavaScript", "Java", "SQL", "C"],
  },
  {
    title: "Tools",
    techs: ["AWS", "Docker", "Git", "CI/CD", "Vercel", "Supabase"],
  },
];

const TechStack = () => {
  useGSAP(() => {
    gsap.fromTo(
      ".skill-card",
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        stagger: 0.2,
        scrollTrigger: {
          trigger: "#skills",
          start: "top 80%",
        },
      }
    );
  });

  return (
    <section id="skills" className="section-padding">
      <div className="w-full h-full md:px-20 px-5">
        <TitleHeader
          title="Skills & Tech Stack"
          sub="🛠️ What I Work With"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-16">
          {skills.map((skill) => (
            <div
              key={skill.title}
              className="skill-card card-border rounded-xl p-6 hover:scale-[1.02] transition-transform duration-300"
            >
              <h3 className="text-xl font-bold text-white mb-4">{skill.title}</h3>
              <div className="flex flex-wrap gap-2">
                {skill.techs.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 text-sm bg-black-200 rounded-full text-white-50 hover:bg-[#3b82f6]/20 hover:text-[#3b82f6] transition-colors"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
