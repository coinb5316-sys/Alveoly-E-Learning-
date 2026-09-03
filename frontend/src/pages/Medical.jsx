import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaQuestionCircle,
  FaUser,
  FaShoppingBag,
  FaBars,
  FaTimes,
  FaArrowRight,
  FaChevronUp,
  FaFileAlt,
  FaListAlt,
  FaLaptopMedical,
  FaBookOpen,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

/*
  Alveoly Medical — medical landing page
  Recreated from the supplied reference video's UI structure:
  - transparent/overlay hero navigation
  - large medical hero image
  - dark announcement strip
  - blue "Select Your Exam" navigation rail
  - exam links
  - "Why choose us?" four-feature section
  - dark resources/footer area
  - floating back-to-top button

  Replace HERO_IMAGE with your own licensed/local medical image for production.
*/

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=2200&q=88";

const exams = [
  "STEP 1",
  "STEP 2 CK",
  "STEP 3",
  "COMLEX® 1",
  "COMLEX 2",
  "ABFM®",
  "ABIM®",
  "PANCE® | PANRE®",
  "MCAT®",
];

const features = [
  {
    icon: FaFileAlt,
    title: "KNOW YOU ARE READY\nFOR THE EXAM",
    text: "Practice with exam-style questions and realistic difficulty so you can approach test day with confidence.",
  },
  {
    icon: FaListAlt,
    title: "WE ARE SUBJECT\nMATTER EXPERTS",
    text: "Our medical content is built with experienced educators who understand the subjects and the exams.",
  },
  {
    icon: FaBookOpen,
    title: "EXPLANATIONS THAT BUILD\nCONCEPT MASTERY",
    text: "Detailed rationales for correct and incorrect answers help you understand the concepts behind every question.",
  },
  {
    icon: FaLaptopMedical,
    title: "DESIGNED WITH\nYOU IN MIND",
    text: "A clean, responsive interface lets you study efficiently and customize your learning around your needs.",
  },
];

const resourceColumns = [
  {
    heading: "Resources",
    links: ["Medical Blog", "Study Resources", "Exam Guides", "Medical Library"],
  },
  {
    heading: "For Educators",
    links: ["Faculty Resources", "Classroom Tools", "Institutional Solutions", "Blog"],
  },
  {
    heading: "Medical Exams",
    links: ["STEP 1", "STEP 2 CK", "STEP 3", "COMLEX®", "ABIM®", "ABFM®"],
  },
  {
    heading: "Clinical",
    links: ["Internal Medicine", "Family Medicine", "Clinical Knowledge", "Clinical Reference"],
  },
];

export default function Medical() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="min-h-screen bg-white text-[#4f4f4f] overflow-x-hidden">
      {/* =========================================================
          HEADER
      ========================================================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          scrolled
            ? "bg-white shadow-[0_1px_10px_rgba(0,0,0,.12)]"
            : "bg-black/35 backdrop-blur-[2px]"
        }`}
      >
        <div className="mx-auto max-w-[1280px] px-5 lg:px-7">
          <div className="h-[76px] flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center shrink-0"
              aria-label="Back to Alveoly homepage"
            >
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full grid place-items-center font-bold text-xl mr-2 transition-all ${
                    scrolled
                      ? "bg-[#1687df] text-white"
                      : "bg-white text-[#1687df]"
                  }`}
                >
                  A
                </div>
                <div
                  className={`text-[26px] md:text-[29px] tracking-tight leading-none font-semibold ${
                    scrolled ? "text-[#1687df]" : "text-white"
                  }`}
                >
                  Alveoly
                  <span
                    className={`font-normal ${
                      scrolled ? "text-[#1687df]" : "text-white"
                    }`}
                  >
                    {" "}
                    | MEDICAL
                  </span>
                </div>
              </div>
            </button>

            <nav className="hidden lg:flex items-center gap-14 text-[14px] font-medium">
              {["PRODUCTS", "OUR DIFFERENCE", "RESOURCES", "EDUCATORS"].map(
                (item) => (
                  <button
                    key={item}
                    onClick={() =>
                      document
                        .getElementById(
                          item === "OUR DIFFERENCE"
                            ? "difference"
                            : item === "PRODUCTS"
                            ? "exams"
                            : "footer"
                        )
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className={`transition-colors ${
                      scrolled
                        ? "text-[#3d3d3d] hover:text-[#1687df]"
                        : "text-white hover:text-white/75"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            </nav>

            <div className="hidden md:flex items-center gap-7">
              <button
                className={`text-xl ${
                  scrolled ? "text-[#1687df]" : "text-white"
                }`}
                aria-label="Help"
              >
                <FaQuestionCircle />
              </button>
              <button
                onClick={() => navigate("/login")}
                className={`text-xl ${
                  scrolled ? "text-[#1687df]" : "text-white"
                }`}
                aria-label="Account"
              >
                <FaUser />
              </button>
              <button
                onClick={() => navigate("/programs")}
                className={`text-xl ${
                  scrolled ? "text-[#1687df]" : "text-white"
                }`}
                aria-label="Programs"
              >
                <FaShoppingBag />
              </button>
            </div>

            <button
              className={`lg:hidden text-2xl ${
                scrolled ? "text-[#1687df]" : "text-white"
              }`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Open menu"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-6 py-5 flex flex-col gap-1">
              {["PRODUCTS", "OUR DIFFERENCE", "RESOURCES", "EDUCATORS"].map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setMenuOpen(false);
                      document
                        .getElementById(
                          item === "OUR DIFFERENCE"
                            ? "difference"
                            : item === "PRODUCTS"
                            ? "exams"
                            : "footer"
                        )
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-left py-3 border-b border-gray-100 text-[#444] text-sm font-medium"
                  >
                    {item}
                  </button>
                )
              )}
              <button
                onClick={() => navigate("/login")}
                className="mt-3 bg-[#1687df] text-white rounded-sm py-3 font-semibold"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative min-h-[570px] md:min-h-[625px] flex items-center overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Medical professionals in a clinical setting"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/15" />

        <div className="relative z-10 w-full max-w-[1180px] mx-auto px-7 md:px-10 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-[760px]"
          >
            <h1 className="text-white font-light text-[34px] sm:text-[42px] md:text-[48px] leading-[1.15]">
              Answering the Call to Practice Medicine
            </h1>
            <p className="mt-4 text-white/90 text-[18px] sm:text-[21px] md:text-[23px] font-light">
              Prepare with the name you can trust
            </p>
          </motion.div>
        </div>

        <div className="absolute left-0 right-0 bottom-[92px] md:bottom-[105px] bg-black/65 border-y border-white/10">
          <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-4 md:py-5">
            <div className="border-l-[3px] border-[#f7d326] pl-4">
              <div className="text-white font-semibold text-[12px] md:text-[13px] uppercase tracking-wide">
                NEW PRODUCT
              </div>
              <div className="text-white/90 text-[13px] md:text-[15px] mt-1">
                Get fast, trusted clinical insights—perfect for exam prep and
                patient care.{" "}
                <button className="text-[#f7d326] hover:underline">
                  Try our Medical Library ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          EXAM SELECTOR
      ========================================================== */}
      <section
        id="exams"
        className="relative bg-white shadow-[0_2px_10px_rgba(0,0,0,.08)]"
      >
        <div className="max-w-[1260px] mx-auto flex flex-col md:flex-row">
          <button
            onClick={() => navigate("/programs")}
            className="md:w-[315px] min-h-[92px] md:min-h-[108px] bg-[#1687df] text-white px-8 flex items-center justify-center md:justify-between text-[19px] md:text-[20px] font-medium group"
          >
            <span>Select Your Exam</span>
            <FaArrowRight className="ml-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 bg-[#f5f4f5]">
            {exams.map((exam) => (
              <button
                key={exam}
                onClick={() => navigate("/programs")}
                className="min-h-[54px] px-3 text-[13px] md:text-[16px] text-[#5d5d5d] hover:text-[#1687df] hover:bg-white transition-colors"
              >
                {exam}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          DIFFERENCE / INTRO
      ========================================================== */}
      <section id="difference" className="bg-white py-20 md:py-24">
        <div className="max-w-[980px] mx-auto px-6 text-center">
          <h2 className="text-[25px] md:text-[32px] font-light text-[#666]">
            Turning Your Passion Into Practice Requires Concept Mastery
          </h2>
          <p className="mt-7 text-[13px] md:text-[15px] leading-7 text-[#777] max-w-[820px] mx-auto">
            At Alveoly, we believe preparing for more than just a test. We
            equip you with medical knowledge and practical skills you need to
            succeed as a clinician. That's why we know your journey requires
            more than memorization—it requires understanding, application and
            confidence.
          </p>
        </div>
      </section>

      {/* =========================================================
          WHY CHOOSE US
      ========================================================== */}
      <section className="bg-[#fafafa] py-20 md:py-24">
        <div className="max-w-[1100px] mx-auto px-6">
          <h2 className="text-center text-[25px] md:text-[30px] font-light text-[#666] mb-14">
            Why choose us?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-20 gap-y-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  className="text-center"
                >
                  <Icon className="mx-auto text-[#1687df] text-[42px] mb-6" />
                  <h3 className="whitespace-pre-line text-[17px] md:text-[19px] leading-[1.35] font-light text-[#6a6a6a]">
                    {feature.title}
                  </h3>
                  <p className="mt-5 text-[13px] md:text-[15px] leading-7 text-[#888] max-w-[400px] mx-auto">
                    {feature.text}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================== */}
      <section className="bg-[#1687df]">
        <div className="max-w-[1050px] mx-auto px-6 py-14 md:py-16 flex flex-col md:flex-row items-center justify-between gap-7">
          <div className="text-white">
            <h2 className="text-[25px] md:text-[31px] font-light">
              Ready to take the next step?
            </h2>
            <p className="mt-2 text-white/85 text-sm">
              Explore Alveoly Medical preparation programs.
            </p>
          </div>
          <button
            onClick={() => navigate("/programs")}
            className="bg-white text-[#1687df] px-7 py-3 rounded-sm font-semibold text-sm hover:bg-gray-100 transition"
          >
            Explore Programs
          </button>
        </div>
      </section>

      {/* =========================================================
          RESOURCE / FOOTER
      ========================================================== */}
      <footer id="footer" className="bg-[#0d1c2b] text-white">
        <div className="max-w-[1120px] mx-auto px-7 py-14 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-16 pb-12">
            {resourceColumns.map((column) => (
              <div key={column.heading}>
                <h3 className="font-semibold text-[16px] mb-5">
                  {column.heading}
                </h3>
                <div className="space-y-3">
                  {column.links.map((link) => (
                    <button
                      key={link}
                      onClick={() => navigate("/programs")}
                      className="block text-left text-[12px] text-white/65 hover:text-white transition"
                    >
                      {link}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-10 grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <h3 className="font-semibold text-[17px] mb-5">Company</h3>
              <div className="space-y-3 text-[12px] text-white/65">
                <button onClick={() => navigate("/about")} className="block">
                  About Us
                </button>
                <button onClick={() => navigate("/careers")} className="block">
                  Leadership & Careers
                </button>
                <button
                  onClick={() => navigate("/contact_us")}
                  className="block"
                >
                  Contact Us
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[17px] mb-5">Resources</h3>
              <div className="space-y-3 text-[12px] text-white/65">
                <button onClick={() => navigate("/privacy")} className="block">
                  Privacy Policy
                </button>
                <button onClick={() => navigate("/terms")} className="block">
                  Terms of Service
                </button>
                <button
                  onClick={() => navigate("/disclaimer")}
                  className="block"
                >
                  Disclaimer
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[17px] mb-5">Connect</h3>
              <div className="space-y-3 text-[12px] text-white/65">
                <button
                  onClick={() => navigate("/contact_us")}
                  className="block"
                >
                  Contact Us
                </button>
                <button onClick={() => navigate("/blog")} className="block">
                  Blog
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[17px] mb-5">Follow Us</h3>
              <div className="flex gap-4 text-white/80">
                <a href="#" aria-label="Facebook" className="hover:text-white">
                  <FaFacebookF />
                </a>
                <a href="#" aria-label="Instagram" className="hover:text-white">
                  <FaInstagram />
                </a>
                <a href="#" aria-label="LinkedIn" className="hover:text-white">
                  <FaLinkedinIn />
                </a>
                <a href="#" aria-label="Twitter" className="hover:text-white">
                  <FaTwitter />
                </a>
                <a href="#" aria-label="YouTube" className="hover:text-white">
                  <FaYoutube />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-10 pt-7 text-[11px] text-white/45 flex flex-col md:flex-row justify-between gap-3">
            <span>© {new Date().getFullYear()} Alveoly E-Learning Academy.</span>
            <span>Health & Sciences Academy</span>
          </div>
        </div>
      </footer>

      {/* Floating back-to-top button — matching the reference behavior */}
      <button
        onClick={goTop}
        aria-label="Back to top"
        className="fixed right-5 bottom-5 z-[110] w-10 h-10 rounded-full bg-[#1687df] text-white shadow-lg grid place-items-center hover:scale-105 transition-transform"
      >
        <FaChevronUp className="text-sm" />
      </button>
    </div>
  );
}
