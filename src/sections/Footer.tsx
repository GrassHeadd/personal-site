const socials = [
  { name: "github", href: "https://github.com/grassheadd" },
  { name: "linkedin", href: "https://linkedin.com/in/junjiehu1" },
];

const Footer = () => {
  return (
    <footer className="max-w-3xl mx-auto px-6 pt-20 pb-10">
      <div className="border-t border-dashed border-pencil pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-ink-soft">
          © {new Date().getFullYear()} Hu Junjie · made with a pencil ✏️
        </p>
        <div className="flex items-baseline gap-5">
          {socials.map(({ name, href }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm quiet-link"
            >
              {name}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
