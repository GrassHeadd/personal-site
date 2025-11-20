import { CTA } from "../components";
import { experiences, skills } from "../constants";

const About = () => {
  return (
    <section className="max-container">
      <h1 className="head-text">
        Hello, I'm{" "}
        <span className="blue-gradient_text font-semibold drop-shadow">
          {" "}
          Junjie
        </span>{" "}
        👋
      </h1>

      <div className="mt-5 flex flex-col gap-3 text-slate-500">
        <p>
          Computer Science student at National University of Singapore with
          experience as a Software Engineer at Didero.ai (NYC) and AI Engineer
          Intern at AI Singapore. Currently working on something cool and always
          learning. In a "trying to build Jarvis in real life" era—passionate
          about AI/ML, full-stack development, and building innovative solutions
          that excite me.
        </p>
      </div>

      <div className="py-10 flex flex-col">
        <h3 className="subhead-text">What I Do</h3>

        <div className="mt-8 flex flex-wrap gap-3">
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium">
            Backend Engineering
          </span>
          <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full font-medium">
            LLM Training & Fine-tuning
          </span>
          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
            AI/ML Systems
          </span>
          <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-medium">
            I can vibe frontend for you too LOL
          </span>
          <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full font-medium">
            Python • TypeScript • Java
          </span>
          <span className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full font-medium">
            Django • FastAPI • React
          </span>
          <span className="px-4 py-2 bg-pink-100 text-pink-800 rounded-full font-medium">
            PyTorch • HuggingFace • LangGraph
          </span>
          <span className="px-4 py-2 bg-teal-100 text-teal-800 rounded-full font-medium">
            Docker • AWS • CI/CD
          </span>
          <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full font-medium">
            RAG • RLHF • LoRA
          </span>
        </div>
      </div>

      <div className="py-16">
        <h3 className="subhead-text">Work Experience.</h3>
        <div className="mt-5 flex flex-col gap-3 text-slate-500">
          <p>
            I've worked with all sorts of companies, leveling up my skills and
            teaming up with smart people. Here's the rundown:
          </p>
        </div>

        <div className="mt-12 space-y-8">
          {experiences.map((experience, index) => (
            <div
              key={experience.company_name}
              className="relative pl-8 pb-8 border-l-4 border-blue-500"
            >
              <div
                className="absolute -left-6 top-0 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: experience.iconBg }}
              >
                <img
                  src={experience.icon}
                  alt={experience.company_name}
                  className="w-7 h-7 object-contain"
                />
              </div>

              <div
                className="bg-white p-6 rounded-lg shadow-md border-b-8"
                style={{ borderBottomColor: experience.iconBg }}
              >
                <div className="mb-4">
                  <p className="text-gray-500 text-sm font-medium">
                    {experience.date}
                  </p>
                  <h3 className="text-black text-xl font-poppins font-semibold mt-1">
                    {experience.title}
                  </h3>
                  <p className="text-gray-600 font-medium text-base">
                    {experience.company_name}
                  </p>
                </div>

                <ul className="list-disc ml-5 space-y-2">
                  {experience.points.map((point, pointIndex) => (
                    <li
                      key={`experience-point-${index}-${pointIndex}`}
                      className="text-gray-500 font-normal text-sm"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-slate-200" />

      <CTA />
    </section>
  );
};

export default About;
