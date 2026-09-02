import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CareerNavbar from "../components/CareerNavbar";
import Footer from "../components/Footer";

import backgroundVideo from "../assets/background-video.mp4";
import kalveoBg from "../assets/kalveoBg.jpg";

/**
 * Live at Alveoly
 *
 * Visual direction:
 * - Editorial careers/lifestyle page
 * - Large photographic sections
 * - Minimal typography
 * - Alveoly blue
 * - No cards/grid-heavy UI
 * - No job application form
 * - Responsive on desktop/tablet/mobile
 */

const ALVEOLY_BLUE = "#258EDB";
const NAVY = "#071827";

const productColumns = [
  {
    title: "Nursing",
    items: [
      "NCLEX Preparation",
      "Nursing Courses",
      "Clinical Practice",
      "Question Bank",
      "Mock Exams",
      "Study Resources",
    ],
  },
  {
    title: "Medical",
    items: [
      "Medical Courses",
      "Licensing Preparation",
      "Clinical Resources",
      "Question Bank",
      "Mock Exams",
      "Medical Library",
    ],
  },
  {
    title: "Programs",
    items: [
      "All Programs",
      "Courses",
      "Subjects",
      "Lessons",
      "Exams",
      "Live Classes",
    ],
  },
  {
    title: "Resources",
    items: [
      "Blog",
      "Study Guides",
      "Testimonials",
      "Nursing Games",
      "AI Learning",
      "Help Center",
    ],
  },
  {
    title: "Company",
    items: [
      "About Alveoly",
      "Contact Us",
      "Careers",
      "Our Mission",
      "Privacy",
      "Terms",
    ],
  },
];

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeIn = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
    },
  },
};

const LiveAtAlveoly = () => {
  const navigate = useNavigate();

  const goToJobs = () => {
    navigate("/careers");
  };

  return (
    <div className="min-h-screen bg-white text-[#4b4b4b] overflow-x-hidden">
      <CareerNavbar />

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative min-h-[680px] h-[calc(100vh-0px)] max-h-[900px] overflow-hidden bg-black">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={backgroundVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />

        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/15 to-black/50" />

        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-10 lg:px-16">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="max-w-[1000px]"
            >
              <h1 className="max-w-[950px] text-4xl font-light leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl md:text-6xl lg:text-[64px] xl:text-[70px]">
                Imagine yourself surrounded by hard-working professionals who
                value quality and success as much as you do.
              </h1>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================
          INTRO / LOVE YOUR JOB
      ========================================================= */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1100px] px-6 py-24 text-center sm:px-10 md:py-28 lg:py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
          >
            <h2 className="text-3xl font-light leading-tight tracking-[-0.025em] text-[#555] sm:text-4xl md:text-5xl">
              Love your job. Live your life. Make an impact.
            </h2>

            <p className="mx-auto mt-8 max-w-[850px] text-base font-light leading-7 text-[#666] sm:text-lg sm:leading-8">
              Imagine a culture of fun, intelligent people who want you to
              succeed. People who believe in your passions and goals, and
              support you in doing whatever you need to do to get the job done.
            </p>

            <button
              type="button"
              onClick={goToJobs}
              className="mt-9 inline-flex min-w-[195px] items-center justify-center bg-[#258EDB] px-8 py-4 text-sm font-medium text-white transition-all duration-300 hover:bg-[#167fc9] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#258EDB]/40"
            >
              See Job Openings
            </button>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          HARD WORK NEVER LOOKED SO FUN
      ========================================================= */}
      <section className="bg-white pb-24 md:pb-32">
        <div className="mx-auto max-w-[1080px] px-6 sm:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.18 }}
            variants={fadeIn}
            className="grid items-stretch lg:grid-cols-[1.02fr_0.98fr]"
          >
            {/* Image */}
            <div className="relative min-h-[400px] overflow-hidden sm:min-h-[500px]">
              <img
                src={kalveoBg}
                alt="Alveoly team collaborating"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-black/5" />
            </div>

            {/* Blue content panel */}
            <div className="flex min-h-[400px] items-center bg-[#258EDB] px-8 py-14 text-white sm:min-h-[500px] sm:px-14 lg:px-16">
              <div>
                <h2 className="max-w-[400px] text-3xl font-light leading-[1.12] tracking-[-0.02em] sm:text-4xl">
                  Hard work never looked so fun
                </h2>

                <div className="mt-8 max-w-[430px] space-y-5 text-[15px] font-light leading-7 text-white/95">
                  <p>
                    It's all in the name — Alveoly is about you. At Alveoly,
                    we understand that our people make us strong.
                  </p>

                  <p>
                    When you join Alveoly, you join a family of hard-working,
                    successful professionals who understand that creativity
                    and success require balance.
                  </p>

                  <p className="italic">
                    To be creative and successful, you need to balance work
                    with life.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          THRIVE
      ========================================================= */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1000px] px-6 pb-24 text-center sm:px-10 md:pb-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
          >
            <h2 className="mx-auto max-w-[760px] text-3xl font-light leading-[1.15] tracking-[-0.025em] text-[#555] sm:text-4xl md:text-[46px]">
              We don't just want you to succeed,
              <br className="hidden sm:block" />
              we want you to thrive!
            </h2>

            <div className="mx-auto mt-9 max-w-[850px] space-y-6 text-base font-light leading-7 text-[#666] sm:text-lg sm:leading-8">
              <p>
                Join us and accomplish your best work. You’ll join a diverse
                team of creative, caring professionals who care as much about
                you personally as they do about creating the perfect product.
              </p>

              <p>
                When you’re at work, we expect the best; when you’re off work,
                we encourage you to relax. We’re committed to sustaining our
                employees for the long term!
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const benefitsSection =
                  document.getElementById("alveoly-benefits");

                benefitsSection?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              className="mt-9 inline-flex min-w-[220px] items-center justify-center bg-[#258EDB] px-8 py-4 text-sm font-medium text-white transition-all duration-300 hover:bg-[#167fc9] hover:shadow-lg"
            >
              Check Out Our Benefits
            </button>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          COLLABORATION IMAGE
      ========================================================= */}
      <section
        id="alveoly-benefits"
        className="relative h-[480px] overflow-hidden bg-gray-100 sm:h-[560px] lg:h-[620px]"
      >
        <motion.img
          initial={{ scale: 1.04 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          src={kalveoBg}
          alt="Alveoly professionals collaborating"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/10" />
      </section>

      {/* =========================================================
          COLLABORATION TEXT
      ========================================================= */}
      <section className="bg-white">
        <div className="mx-auto max-w-[900px] px-6 py-24 text-center sm:px-10 md:py-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
          >
            <h2 className="text-3xl font-light leading-tight tracking-[-0.02em] text-[#555] sm:text-4xl md:text-5xl">
              Collaboration is the essence of success
            </h2>

            <div className="mx-auto mt-8 max-w-[760px] space-y-5 text-base font-light leading-7 text-[#666] sm:text-lg sm:leading-8">
              <p>
                A lone-wolf mentality won't cut it here. Collaboration allows
                us to achieve great things together.
              </p>

              <p>
                When it comes to collaboration, we practice what we preach,
                and the key to effective collaboration is being inclusive.
              </p>

              <p>
                We want Alveoly to be the most supportive, welcoming, inclusive
                environment you've ever worked in.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          INTELLECTUAL WORK / BLUE SPLIT
      ========================================================= */}
      <section className="bg-[#258EDB]">
        <div className="grid lg:grid-cols-[2fr_1fr]">
          {/* Text */}
          <div className="flex items-center px-7 py-20 sm:px-12 md:px-16 md:py-24 lg:px-20 xl:px-28">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              className="max-w-[720px] text-white"
            >
              <h2 className="text-3xl font-light leading-[1.13] tracking-[-0.025em] sm:text-4xl md:text-5xl">
                The hardest – yet most rewarding – intellectual work you've
                ever done
              </h2>

              <div className="mt-8 space-y-5 text-[15px] font-light leading-7 text-white/95 sm:text-base sm:leading-7">
                <p>
                  Your job will be challenging, and it will force you to think
                  in ways you've never thought before.
                </p>

                <p>
                  To succeed at Alveoly, it takes more than intelligence,
                  knowledge, or talent. We pride ourselves in our ability to
                  absorb constructive feedback, learn from our mistakes, and
                  continuously improve our content until we get it right.
                </p>

                <p>
                  Does that sound like you? Then apply today! We can't wait to
                  hear from you.
                </p>
              </div>

              <button
                type="button"
                onClick={goToJobs}
                className="mt-9 inline-flex min-w-[195px] items-center justify-center bg-white px-8 py-4 text-sm font-medium text-[#258EDB] transition-all duration-300 hover:bg-gray-50 hover:shadow-lg"
              >
                See Job Openings
              </button>
            </motion.div>
          </div>

          {/* Image */}
          <div className="relative min-h-[400px] lg:min-h-[600px]">
            <img
              src={kalveoBg}
              alt="Alveoly professional working"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/5" />
          </div>
        </div>
      </section>

      {/* =========================================================
          PRODUCT EXPLORER
      ========================================================= */}
      <section className="bg-[#071827] text-white">
        <div className="mx-auto max-w-[1280px] px-6 py-20 sm:px-10 md:py-24 lg:px-14">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="text-center"
          >
            <h2 className="text-3xl font-light tracking-[-0.02em] sm:text-4xl">
              Explore All Alveoly Products
            </h2>

            <p className="mt-3 text-sm font-light text-white/75">
              Choose your learning path
            </p>
          </motion.div>

          <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-12">
            {productColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-base font-semibold text-white sm:text-lg">
                  {column.title}
                </h3>

                <ul className="mt-5 space-y-3">
                  {column.items.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="text-left text-sm font-light text-white/75 transition-colors duration-200 hover:text-white"
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="bg-white">
        <div className="mx-auto max-w-[900px] px-6 py-20 text-center sm:px-10 md:py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
          >
            <h2 className="text-3xl font-light text-[#555] sm:text-4xl">
              Ready to build something meaningful with us?
            </h2>

            <p className="mx-auto mt-5 max-w-[680px] text-base font-light leading-7 text-[#666]">
              Bring your ideas, curiosity, creativity, and ambition to a team
              committed to helping students succeed.
            </p>

            <button
              type="button"
              onClick={goToJobs}
              className="mt-8 inline-flex min-w-[195px] items-center justify-center bg-[#258EDB] px-8 py-4 text-sm font-medium text-white transition-all duration-300 hover:bg-[#167fc9] hover:shadow-lg"
            >
              See Job Openings
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LiveAtAlveoly;