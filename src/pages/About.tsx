import './About.css';

const About = () => {
  const skills = [
    { category: 'Frontend', items: ['React', 'TypeScript', 'HTML/CSS', 'JavaScript'] },
    { category: 'Backend', items: ['Node.js', 'Express', 'REST APIs', 'GraphQL'] },
    { category: 'Tools', items: ['Git', 'Docker', 'Vite', 'Webpack'] },
    { category: 'Databases', items: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis'] },
  ];

  return (
    <div className="about">
      <section className="about-hero">
        <h1>About Me</h1>
        <p className="about-intro">
          Passionate developer with a love for creating elegant solutions to complex problems.
        </p>
      </section>

      <section className="about-content">
        <div className="about-section">
          <h2>My Story</h2>
          <p>
            I'm a full-stack developer with expertise in building modern web applications.
            My journey in software development started with a curiosity about how things work,
            which evolved into a passion for creating meaningful digital experiences.
          </p>
          <p>
            I believe in writing clean, maintainable code and staying up-to-date with the
            latest technologies and best practices. When I'm not coding, you can find me
            exploring new technologies, contributing to open source, or sharing knowledge
            with the developer community.
          </p>
        </div>

        <div className="about-section">
          <h2>Skills & Technologies</h2>
          <div className="skills-grid">
            {skills.map((skillGroup) => (
              <div key={skillGroup.category} className="skill-group">
                <h3>{skillGroup.category}</h3>
                <div className="skill-tags">
                  {skillGroup.items.map((skill) => (
                    <span key={skill} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="about-section">
          <h2>What I Do</h2>
          <div className="services-grid">
            <div className="service-item">
              <h3>🎯 Frontend Development</h3>
              <p>
                Creating responsive and interactive user interfaces using React, TypeScript,
                and modern CSS frameworks.
              </p>
            </div>
            <div className="service-item">
              <h3>⚙️ Backend Development</h3>
              <p>
                Building scalable APIs and server-side applications with Node.js and various
                database technologies.
              </p>
            </div>
            <div className="service-item">
              <h3>🔧 Full Stack Solutions</h3>
              <p>
                End-to-end development of web applications, from concept to deployment and
                maintenance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
