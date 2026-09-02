import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaClock,
  FaDumbbell,
  FaGamepad,
  FaCalendarAlt,
} from "react-icons/fa";

import CareerNavbar from "../components/CareerNavbar";
import Footer from "../components/Footer";

import backgroundVideo from "../assets/background-video.mp4";
import kalveoBg from "../assets/kalveoBg.jpg";

// ------------------------------------------------------------
// Animation presets
// ------------------------------------------------------------

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
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
      duration: 0.9,
      ease: "easeOut",
    },
  },
};

// ------------------------------------------------------------
// Benefit items
// ------------------------------------------------------------

const benefits = [
  {
    title: "Flexible hours",
    icon: FaClock,
  },
  {
    title: "Wellness & fitness",
    icon: FaDumbbell,
  },
  {
    title: "Fun work environment",
    icon: FaGamepad,
  },
  {
    title: "Paid time off",
    icon: FaCalendarAlt,
  },
];

// ------------------------------------------------------------
// Product explorer
// ------------------------------------------------------------

const productColumns = [
  {
    title: "Nursing",
    links: [
      "NCLEX Preparation",
      "Nursing Courses",
      "Clinical Practice",
      "Question Bank",
      "Mock Exams",
    ],
  },
  {
    title: "Medical",
    links: [
      "Medical Courses",
      "Licensing Preparation",
      "Clinical Resources",
      "Question Bank",
      "Mock Exams",
    ],
  },
  {
    title: "Programs",
    links: [
      "All Programs",
      "Courses",
      "Subjects",
      "Lessons",
      "Exams",
    ],
  },
  {
    title: "Resources",
    links: [
      "Blog",
      "Study Guides",
      "Testimonials",
      "AI Learning",
      "Help Center",
    ],
  },
  {
    title: "Company",
    links: [
      "About Alveoly",
      "Contact Us",
      "Careers",
      "Our Mission",
      "Privacy",
    ],
  },
];

const CareerBenefits = () => {
  const navigate = useNavigate();

  const goToJobs = () => {
    navigate("/careers/jobs");
  };

  const goToLife = () => {
    navigate("/careers/life-at-alveoly");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[#4d4d4d]">
      <CareerNavbar />

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="relative h-[650px] min-h-[620px] overflow-hidden bg-black sm:h-[720px] lg:h-[760px]">
        <video
          src={backgroundVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Reference-style warm/dark overlay */}
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-black/10" />

        <div className="relative z-10 flex h-full items-end">
          <div className="mx-auto w-full max-w-[1280px] px-6 pb-20 sm:px-10 sm:pb-24 lg:px-16 lg:pb-28">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="max-w-[760px] text-white"
            >
              <h1 className="text-4xl font-light leading-[1.08] tracking-[-0.03em] sm:text-5xl md:text-6xl lg:text-[64px]">
                You're the priority
              </h1>

              <p className="mt-5 max-w-[760px] text-base font-light leading-7 text-white/95 sm:text-lg sm:leading-8">
                We believe true creativity and meaningful success can only
                happen when people are given the right benefits, the right
                support, and the time they need to rest and reset.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======================================================
          MOST VALUABLE ASSET
      ====================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-[1000px] px-6 py-24 sm:px-10 md:py-28 lg:py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="text-center"
          >
            <h2 className="text-3xl font-light leading-tight tracking-[-0.025em] text-[#555] sm:text-4xl md:text-[46px]">
              You are our most valuable asset
            </h2>

            <p className="mx-auto mt-6 max-w-[700px] text-base font-light leading-7 text-[#666] sm:text-lg">
              We want you to do the best work possible. We enable this by
              prioritizing work/life harmony.
            </p>
          </motion.div>

          {/* Benefit icons */}
          <div className="mx-auto mt-14 grid max-w-[820px] grid-cols-2 gap-y-12 sm:grid-cols-4 sm:gap-x-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                  transition={{
                    duration: 0.55,
                    delay: index * 0.08,
                  }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center text-[#555]">
                    <Icon
                      aria-hidden="true"
                      className="text-[42px] font-light"
                    />
                  </div>

                  <span className="mt-3 max-w-[150px] text-sm leading-5 text-[#444] sm:text-[15px]">
                    {benefit.title}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================
          COMPENSATION + FLEXIBILITY
      ====================================================== */}

      <section className="bg-white pb-24 md:pb-32">
        <div className="mx-auto max-w-[1280px] px-0 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={fadeIn}
            className="grid lg:grid-cols-2"
          >
            {/* Image */}
            <div className="relative min-h-[470px] overflow-hidden sm:min-h-[560px]">
              <img
                src={kalveoBg}
                alt="Alveoly team member"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>

            {/* Blue panel */}
            <div className="flex min-h-[470px] items-center bg-[#258EDB] px-7 py-14 text-white sm:min-h-[560px] sm:px-12 lg:px-14 xl:px-16">
              <div className="max-w-[620px]">
                <h2 className="text-3xl font-light leading-[1.12] tracking-[-0.025em] sm:text-4xl">
                  Competitive pay and benefits,
                  <br />
                  plus flexible hours
                </h2>

                <div className="mt-8 space-y-5 text-[15px] font-light leading-7 text-white/95 sm:text-base">
                  <p>
                    Our people give us their best, and we believe that deserves
                    flexibility on our part.
                  </p>

                  <p>
                    We believe strongly in the power of work/life harmony. An
                    inflexible schedule isn't always the best environment for
                    doing great work, so we encourage flexibility that allows
                    you to maintain the balance you need.
                  </p>

                  <p>
                    We strive to provide competitive compensation and benefits
                    while giving our team the tools, resources, and support
                    needed to succeed sustainably.
                  </p>

                  <p>
                    Does that sound appealing to you? Check out our job
                    openings now!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={goToJobs}
                  className="mt-8 inline-flex min-w-[195px] items-center justify-center bg-white px-8 py-4 text-sm font-medium text-[#258EDB] shadow-sm transition-all duration-300 hover:bg-gray-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  See Job Openings
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======================================================
          HEALTH + WELLNESS
      ====================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-[950px] px-6 py-24 text-center sm:px-10 md:py-28 lg:py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
          >
            <h2 className="text-3xl font-light leading-tight tracking-[-0.025em] text-[#555] sm:text-4xl md:text-[46px]">
              Health, wellness, and everything in between
            </h2>

            <div className="mx-auto mt-8 max-w-[820px] space-y-6 text-base font-light leading-7 text-[#666] sm:text-lg sm:leading-8">
              <p>
                We understand that doing your best work starts with feeling
                your best. That's why we want our team to have access to the
                resources they need to support their physical and mental
                wellbeing.
              </p>

              <p>
                From wellness initiatives and flexible schedules to a
                supportive work environment, we believe taking care of
                yourself is an important part of doing meaningful work.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======================================================
          OFFICE / AMENITIES HERO
      ====================================================== */}

      <section className="relative min-h-[540px] overflow-hidden sm:min-h-[620px]">
        <img
          src={kalveoBg}
          alt="Alveoly workplace and surroundings"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-black/5" />

        <div className="relative z-10 mx-auto flex min-h-[540px] max-w-[1280px] items-center px-6 py-20 sm:min-h-[620px] sm:px-10 lg:px-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            className="max-w-[760px] text-white"
          >
            <h2 className="text-3xl font-light leading-[1.1] tracking-[-0.025em] sm:text-4xl md:text-5xl">
              A place to call home...
              <br />
              with all the amenities you need
            </h2>

            <div className="mt-7 max-w-[700px] space-y-5 text-base font-light leading-7 text-white/95 sm:text-lg sm:leading-8">
              <p>
                Alveoly is designed to be a place where talented people can do
                exceptional work while still enjoying the life around them.
              </p>

              <p>
                We believe your workplace should support your goals, your
                wellbeing, and the way you want to live.
              </p>
            </div>

            <button
              type="button"
              onClick={goToLife}
              className="mt-8 inline-flex min-w-[220px] items-center justify-center bg-[#258EDB] px-8 py-4 text-sm font-medium text-white transition-all duration-300 hover:bg-[#167fc9] hover:shadow-lg"
            >
              See Life at Alveoly
            </button>
          </motion.div>
        </div>
      </section>

      {/* ======================================================
          CLOSING MESSAGE
      ====================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-[900px] px-6 py-24 text-center sm:px-10 md:py-28 lg:py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
          >
            <div className="space-y-5 text-xl font-medium leading-relaxed text-[#4d4d4d] sm:text-2xl md:text-[27px]">
              <p>Work that makes a difference.</p>
              <p>Work that challenges you.</p>
              <p>Work that inspires you.</p>
              <p>Work that changes the world.</p>
            </div>

            <p className="mx-auto mt-12 max-w-[650px] text-base font-light leading-7 text-[#666] sm:text-lg">
              Learn more about what life is like working at Alveoly — click to
              get started.
            </p>

            <button
              type="button"
              onClick={goToLife}
              className="mt-8 inline-flex min-w-[245px] items-center justify-center bg-[#258EDB] px-8 py-4 text-sm font-medium text-white transition-all duration-300 hover:bg-[#167fc9] hover:shadow-lg"
            >
              See What Life Is Like Here
            </button>
          </motion.div>
        </div>
      </section>

      {/* ======================================================
          PRODUCT EXPLORER
      ====================================================== */}

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

            <p className="mt-3 text-sm font-light text-white/70">
              Choose your learning path
            </p>
          </motion.div>

          <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-12">
            {productColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-base font-semibold sm:text-lg">
                  {column.title}
                </h3>

                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="text-left text-sm font-light text-white/70 transition-colors duration-200 hover:text-white"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CareerBenefits;