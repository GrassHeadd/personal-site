import type { ButtonProps } from "@/types";

const Button = ({ text, className, id }: ButtonProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!id) return;

    const target = document.getElementById(id);
    if (target) {
      const offset = window.innerHeight * 0.1;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <a onClick={handleClick} className={`${className ?? ""} cta-wrapper`}>
      <div className="cta-button group">
        <div className="bg-circle" />
        <p className="text">{text}</p>
        <div className="arrow-wrapper">
          <img src="/images/arrow-down.svg" alt="arrow" />
        </div>
      </div>
    </a>
  );
};

export default Button;
