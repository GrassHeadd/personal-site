export interface ExpCard {
  title: string;
  company: string;
  date: string;
  summary: string;
  responsibilities: string[];
}

export const expCards: ExpCard[] = [
  {
    title: "Software Engineer Intern",
    company: "Tencent",
    date: "Aug 2026 - now",
    summary: "I build internal tools that help product managers turn frontend ideas into working product changes.",
    responsibilities: [
      "Built tools and agent skills that let 8+ product managers create, change, and validate production frontend code, cutting average feature turnaround from two days to a few hours.",
      "Worked with designers and product managers to bring 30+ pages onto a reusable design system.",
      "Cut a key page's render time by about 90% and restored reliable preview environments so the team could test changes with confidence.",
    ],
  },
  {
    title: "Member of Technical Staff",
    company: "Didero",
    date: "Aug 2025 - Jul 2026",
    summary: "Didero builds AI procurement software. I helped turn its agents into products that enterprise purchasing and accounts payable teams could use every day.",
    responsibilities: [
      "Shipped controls that let customers guide AI agents and accept, edit, or reject proposed emails and ERP actions. Task acceptance rose from 40% to 80% as these controls rolled out across 20+ clients.",
      "Co-led an accounts payable product that matches invoices to orders, finds the right people to resolve discrepancies, and follows up by email; piloted it with 3 clients.",
      "Worked directly with 7 enterprise clients on ERP integrations and tailored workflows, adapting the product to how their teams actually worked.",
      "Built a trace explorer and improved caching and email intake so the team could understand agent behavior and run it more reliably at scale.",
    ],
  },
  {
    title: "AI Engineer Intern",
    company: "AI Singapore",
    date: "May - Aug 2025",
    summary: "I worked on post-training for SEA-LION, a multilingual model built for Southeast Asian languages.",
    responsibilities: [
      "Built a multi-agent reward pipeline to score and filter training data across 10 languages; the resulting model family ranked #4 of 55 on SEA-HELM.",
      "Improved code-judge accuracy from 50% to 80% while cutting scoring time from two minutes to under ten seconds.",
      "Compared reinforcement learning methods and connected the reward system to SEA-LION's training loop.",
    ],
  },
  {
    title: "Software Engineer Intern",
    company: "SUSS",
    date: "Jan - May 2025",
    summary: "I explored practical AI tools for classroom teaching and information retrieval.",
    responsibilities: [
      "Built retrieval systems and scrapers that could gather useful information from changing websites.",
      "Evaluated AI tools for classroom teaching.",
    ],
  },
];
