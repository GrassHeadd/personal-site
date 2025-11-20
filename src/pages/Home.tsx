import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to My Portfolio</h1>
          <p className="hero-subtitle">
            Full Stack Developer | React Enthusiast | Problem Solver
          </p>
          <p className="hero-description">
            I build modern web applications with clean code and great user experiences.
            Passionate about creating solutions that make a difference.
          </p>
          <div className="hero-buttons">
            <Link to="/projects" className="btn btn-primary">
              View My Work
            </Link>
            <Link to="/contact" className="btn btn-secondary">
              Get In Touch
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">💻</div>
            <h3>Web Development</h3>
            <p>Building responsive and performant web applications using modern technologies.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>UI/UX Design</h3>
            <p>Creating intuitive and beautiful user interfaces that users love to interact with.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Performance</h3>
            <p>Optimizing applications for speed and efficiency to deliver the best experience.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
