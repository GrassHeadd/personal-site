import type { Project } from '../types';
import './Projects.css';

const Projects = () => {
  const projects: Project[] = [
    {
      id: 1,
      title: 'E-Commerce Platform',
      description: 'A full-stack e-commerce application with user authentication, product management, and payment integration.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      githubUrl: 'https://github.com/yourusername/project1',
      liveUrl: 'https://project1.example.com',
    },
    {
      id: 2,
      title: 'Task Management App',
      description: 'A collaborative task management tool with real-time updates, drag-and-drop functionality, and team features.',
      technologies: ['React', 'TypeScript', 'Firebase', 'Material-UI'],
      githubUrl: 'https://github.com/yourusername/project2',
      liveUrl: 'https://project2.example.com',
    },
    {
      id: 3,
      title: 'Weather Dashboard',
      description: 'A responsive weather application that displays current weather and forecasts using external APIs.',
      technologies: ['React', 'TypeScript', 'OpenWeather API', 'CSS'],
      githubUrl: 'https://github.com/yourusername/project3',
      liveUrl: 'https://project3.example.com',
    },
    {
      id: 4,
      title: 'Blog Platform',
      description: 'A modern blogging platform with markdown support, comments, and social sharing features.',
      technologies: ['React', 'Next.js', 'PostgreSQL', 'Prisma'],
      githubUrl: 'https://github.com/yourusername/project4',
    },
    {
      id: 5,
      title: 'Portfolio Generator',
      description: 'A tool to help developers create beautiful portfolio websites with customizable templates.',
      technologies: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
      githubUrl: 'https://github.com/yourusername/project5',
      liveUrl: 'https://project5.example.com',
    },
    {
      id: 6,
      title: 'Chat Application',
      description: 'A real-time chat application with private messaging, group chats, and file sharing capabilities.',
      technologies: ['React', 'Socket.io', 'Node.js', 'Express'],
      githubUrl: 'https://github.com/yourusername/project6',
    },
  ];

  return (
    <div className="projects">
      <section className="projects-hero">
        <h1>My Projects</h1>
        <p className="projects-intro">
          A collection of projects I've worked on, showcasing my skills and passion for development.
        </p>
      </section>

      <section className="projects-content">
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h3>{project.title}</h3>
              </div>
              <p className="project-description">{project.description}</p>
              <div className="project-technologies">
                {project.technologies.map((tech) => (
                  <span key={tech} className="tech-tag">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="project-links">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link"
                  >
                    <span>📂</span> GitHub
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link"
                  >
                    <span>🌐</span> Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Projects;
