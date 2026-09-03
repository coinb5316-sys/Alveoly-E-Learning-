import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import CareerNavbar from "../components/CareerNavbar";
import Footer from "../components/Footer";

import backgroundVideo from "../assets/background-video.mp4";
import kalveoBg from "../assets/kalveoBg.jpg";

/* ============================================================
   ANIMATIONS
============================================================ */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 25,
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
      ease: "easeOut",
    },
  },
};

/* ============================================================
   PRODUCT EXPLORER
============================================================ */

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

/* ============================================================
   DEFAULT DATA
   Used when the page is opened directly or older navigation
   still sends the original JobDetails state.
============================================================ */

const defaultJobs = [
  {
    title: "Medical Content Developer",
    location: "Accra, Ghana",
    description:
      "Join our team of passionate healthcare professionals and educators to create engaging, accurate, and meaningful educational content that helps learners reach their goals.",
  },

  {
    title: "Nursing Content Developer",
    location: "Accra, Ghana",
    description:
      "Alveoly is looking for experienced nursing professionals and educators who are passionate about education, writing, and helping students succeed.",
  },

  {
    title: "Product Operations Specialist",
    location: "Accra, Ghana",
    description:
      "The Product Operations Specialist supports the administration and delivery of learning experiences while helping ensure each program is prepared, delivered, and completed accurately and professionally.",
  },
];

/* ============================================================
   COMPONENT
============================================================ */

const JobDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};

  /*
    The new Jobs page can send:

    {
      departmentName,
      departmentDescription,
      departmentImage,
      jobs: [...]
    }

    We also preserve compatibility with your old structure:
    
    {
      jobTitle,
      jobDescription,
      openings,
      image
    }
  */

  const departmentName =
    state.departmentName ||
    state.departmentTitle ||
    state.category ||
    "Careers at Alveoly";

  const departmentDescription =
    state.departmentDescription ||
    state.heroDescription ||
    state.description ||
    "Join our team of passionate professionals and help us create meaningful learning experiences that make a difference.";

  const departmentImage =
    state.departmentImage ||
    state.heroImage ||
    state.image ||
    null;

  const jobs = useMemo(() => {
    if (Array.isArray(state.jobs) && state.jobs.length > 0) {
      return state.jobs;
    }

    /*
      Backward compatibility with your current JobDetails state.
    */

    if (state.jobTitle) {
      return [
        {
          title: state.jobTitle,
          location: state.jobLocation || "Accra, Ghana",
          description:
            state.jobDescription ||
            "Join Alveoly and become part of a team dedicated to meaningful work and exceptional learning experiences.",
          openings: state.openings,
        },
      ];
    }

    return defaultJobs;
  }, [state]);

  /*
    The video uses a large workplace photograph.
    Your existing background-video is already used by your
    career pages, so we use it here as the primary hero media.
  */

  const goBackToDepartments = () => {
    navigate("/careers/jobs");
  };

  const handleLearnMore = (job) => {
    /*
      If you later create a dedicated application page,
      this state is already prepared for it.
    */

    navigate("/careers/jobs/apply", {
      state: {
        ...job,
        departmentName,
      },
    });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[#555]">

      {/* ======================================================
          CAREER NAVBAR
      ====================================================== */}

      <CareerNavbar />

      {/* ======================================================
          HERO IMAGE
      ====================================================== */}

      <section className="relative mt-0 h-[390px] overflow-hidden sm:h-[450px] md:h-[500px] lg:h-[520px]">

        {departmentImage ? (
          <img
            src={departmentImage}
            alt={departmentName}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <video
            src={backgroundVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Very subtle image treatment matching the video */}
        <div className="absolute inset-0 bg-black/5" />
      </section>

      {/* ======================================================
          BLUE DEPARTMENT INTRODUCTION
      ====================================================== */}

      <section className="bg-[#258EDB] text-white">

        <div className="mx-auto max-w-[1100px] px-6 py-16 text-center sm:px-10 sm:py-20 md:py-24">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            variants={fadeUp}
          >

            <h1 className="mx-auto max-w-[1000px] text-3xl font-light leading-[1.2] tracking-[-0.025em] sm:text-4xl md:text-[44px] lg:text-[46px]">
              {departmentName}
            </h1>

            <p className="mx-auto mt-6 max-w-[900px] text-base font-light leading-7 text-white/95 sm:text-lg sm:leading-8">
              {departmentDescription}
            </p>

          </motion.div>

        </div>

      </section>

      {/* ======================================================
          JOB LISTINGS
      ====================================================== */}

      <section className="bg-white">

        <div className="mx-auto max-w-[1000px] px-6 py-16 sm:px-10 sm:py-20 md:py-24">

          {/* BACK TO DEPARTMENTS */}

          <motion.button
            type="button"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            onClick={goBackToDepartments}
            className="group mb-20 flex items-center gap-3 text-[14px] font-light text-[#258EDB] transition-colors duration-200 hover:text-[#167fc9]"
          >
            <FaArrowLeft
              className="text-[20px] transition-transform duration-200 group-hover:-translate-x-1"
            />

            <span>Back to Departments</span>
          </motion.button>

          {/* ==================================================
              LISTINGS
          ================================================== */}

          <div className="space-y-0">

            {jobs.map((job, index) => (

              <motion.article
                key={`${job.title}-${index}`}
                initial="hidden"
                whileInView="visible"
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
                variants={fadeUp}
                className="border-b border-[#bcbcbc] py-8 first:pt-0 sm:py-10"
              >

                {/* JOB HEADER */}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                  <h2 className="max-w-[700px] text-[21px] font-light leading-[1.35] tracking-[-0.01em] text-[#4c9ac7] transition-colors duration-200 hover:text-[#258EDB] sm:text-[22px]">
                    {job.title}
                  </h2>

                  <div className="shrink-0 text-left text-[15px] font-light text-[#555] sm:min-w-[150px] sm:text-right">
                    {job.location || "Accra, Ghana"}
                  </div>

                </div>

                {/* OPTIONAL OPENINGS */}

                {job.openings !== undefined &&
                  job.openings !== null &&
                  job.openings !== "" && (
                    <p className="mt-4 text-[14px] font-light text-[#777]">
                      {job.openings}{" "}
                      {Number(job.openings) === 1
                        ? "opening"
                        : "openings"}
                    </p>
                  )}

                {/* DESCRIPTION */}

                <div className="mt-5 max-w-[790px]">

                  {Array.isArray(job.description) ? (
                    job.description.map((paragraph, paragraphIndex) => (
                      <p
                        key={paragraphIndex}
                        className="mb-5 text-[15px] font-light leading-[1.65] text-[#5c5c5c] last:mb-0 sm:text-[16px]"
                      >
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <p className="text-[15px] font-light leading-[1.65] text-[#5c5c5c] sm:text-[16px]">
                      {job.description}
                    </p>
                  )}

                </div>

                {/* LEARN MORE */}

                <div className="mt-8 flex justify-end">

                  <button
                    type="button"
                    onClick={() => handleLearnMore(job)}
                    className="text-[15px] font-light text-[#4c9ac7] transition-colors duration-200 hover:text-[#167fc9] hover:underline hover:underline-offset-4"
                  >
                    Learn More
                  </button>

                </div>

              </motion.article>

            ))}

          </div>

          {/* ==================================================
              BOTTOM BACK TO DEPARTMENTS
          ================================================== */}

          <motion.button
            type="button"
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            variants={fadeUp}
            onClick={goBackToDepartments}
            className="group mt-8 flex items-center gap-3 text-[14px] font-light text-[#258EDB] transition-colors duration-200 hover:text-[#167fc9]"
          >
            <FaArrowLeft
              className="text-[20px] transition-transform duration-200 group-hover:-translate-x-1"
            />

            <span>Back to Departments</span>
          </motion.button>

        </div>

      </section>

      {/* ======================================================
          EMPLOYEE TESTIMONIAL
      ====================================================== */}

      <section className="relative min-h-[500px] overflow-hidden sm:min-h-[570px]">

        <img
          src={kalveoBg}
          alt="Alveoly team member"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Dark overlay */}

        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 mx-auto flex min-h-[500px] max-w-[1100px] items-center px-6 py-20 sm:min-h-[570px] sm:px-10">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.25,
            }}
            variants={fadeIn}
            className="max-w-[500px] text-white"
          >

            {/* Quote mark */}

            <div className="mb-5 text-[72px] font-serif leading-[0.65] text-white">
              “
            </div>

            <blockquote className="text-xl font-light leading-[1.45] sm:text-2xl md:text-[27px]">
              Our employees are passionate, enthusiastic, and bring different
              experiences from the professional world. At Alveoly, we
              encourage our team to share those experiences, learn from one
              another, and use their knowledge to make a meaningful difference.
            </blockquote>

          </motion.div>

        </div>

      </section>

      {/* ======================================================
          PRODUCT EXPLORER
      ====================================================== */}

      <section className="bg-[#454545] text-white">

        <div className="mx-auto max-w-[1280px] px-6 py-20 sm:px-10 md:py-24 lg:px-14">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
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

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <Footer />

    </div>
  );
};

export default JobDetails;