export interface ExpCard {
  title: string;
  company: string;
  date: string;
  responsibilities: string[];
}

export const expCards: ExpCard[] = [
  {
    title: "Software Engineer Intern",
    company: "Tencent",
    date: "Aug 2026 - now",
    responsibilities: [
      "Built reusable tools and AI agent skills that let 8+ product managers generate, edit, and check production frontend code.",
      "Worked with designers and product managers to move 30+ pages to a new design system.",
      "Cut a software-tiering page's render time by about 90% by precomputing its data.",
    ],
  },
  {
    title: "Member of Technical Staff",
    company: "Didero",
    date: "Aug 2025 - Jul 2026",
    responsibilities: [
      "Shipped customer-facing AI procurement workflows for 20+ enterprise clients, including feedback controls that doubled task acceptance from 40% to 80%.",
      "Co-led an AI accounts payable workflow and worked directly with 7 enterprise clients on integrations and tailored workflows.",
    ],
  },
  {
    title: "AI Engineer Intern",
    company: "AI Singapore",
    date: "May - Aug 2025",
    responsibilities: [
      "Built a multi-agent reward pipeline for SEA-LION v4, scoring 10 million synthetic examples across 10 Southeast Asian languages. The resulting model family ranked #4 of 55 on SEA-HELM.",
      "Led its code-judging agent, using Monte Carlo Tree Search to raise accuracy from 50% to 80% on a 2,000-example benchmark and cut scoring time from two minutes to under ten seconds.",
      "Benchmarked PPO and GRPO, then integrated the reward pipeline into reinforcement learning training with VeRL and vLLM.",
    ],
  },
  {
    title: "Software Engineer Intern",
    company: "SUSS",
    date: "Jan - May 2025",
    responsibilities: [
      "Built RAG systems with DSPy and AI scrapers for dynamic sites.",
      "Evaluated AI tools for classroom teaching.",
    ],
  },
];
