import Footer from "@/sections/Footer";
import Contact from "@/sections/Contact";
import TechStack from "@/sections/TechStack";
import Experience from "@/sections/Experience";
import Hero from "@/sections/Hero";
import ShowcaseSection from "@/sections/ShowcaseSection";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <ShowcaseSection />
      <Experience />
      <TechStack />
      <Contact />
      <Footer />
    </>
  );
}
