import React from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import CareerNavbar from "../components/CareerNavbar";
import Footer from "../components/Footer";

/* ============================================================
   ANIMATIONS
============================================================ */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 20,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* ============================================================
   DEFAULT JOB
   Used if a job is opened directly without navigation state.
============================================================ */

const defaultJob = {
  title: "Medical Content Developer",
  location: "Accra, Ghana",

  description: [
    "Are you passionate about healthcare, education, and helping others succeed? Join Alveoly and use your professional expertise to create meaningful educational experiences for healthcare learners.",

    "Alveoly is seeking a talented professional to join our content team. The ideal candidate will have strong subject matter expertise, excellent communication skills, a creative mindset, and a passion for helping students and healthcare professionals achieve their goals.",
  ],

  requirements: [
    "Bachelor's degree or equivalent professional qualification in a relevant field.",
    "Strong subject matter expertise and professional experience in your area of specialization.",
    "Excellent written and verbal communication skills.",
    "Strong attention to detail and commitment to accuracy.",
    "Ability to work independently while collaborating effectively with a team.",
    "Experience in tutoring, teaching, curriculum development, or educational content creation is a plus.",
  ],

  responsibilities: [
    "Develop, review, and maintain high-quality educational content for Alveoly learning programs.",
    "Create practice questions, answers, explanations, and other learning materials.",
    "Work with subject matter experts and product teams to identify opportunities for new educational products.",
    "Review existing content to ensure accuracy, relevance, clarity, and alignment with learning objectives.",
    "Participate in the planning and development of courses, question banks, videos, and other educational resources.",
    "Collaborate with fellow professionals to continuously improve the learner experience.",
  ],

  benefits: [
    "Competitive compensation based on experience and qualifications.",
    "Paid time off and a comprehensive holiday schedule.",
    "Comprehensive professional benefits package.",
    "Professional development and career growth opportunities.",
    "Collaborative and inclusive working environment.",
    "Opportunities to contribute to meaningful healthcare education.",
  ],
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
   COMPONENT
============================================================ */

const JobDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};

  /*
    Support both your existing job structure and the new
    detailed structure.
  */

  const job = {
    ...defaultJob,
    ...state,

    title:
      state.jobTitle ||
      state.title ||
      defaultJob.title,

    location:
      state.jobLocation ||
      state.location ||
      defaultJob.location,

    description:
      state.jobDescription ||
      state.description ||
      defaultJob.description,

    requirements:
      state.requirements ||
      defaultJob.requirements,

    responsibilities:
      state.responsibilities ||
      defaultJob.responsibilities,

    benefits:
      state.benefits ||
      defaultJob.benefits,
  };

  const description =
    Array.isArray(job.description)
      ? job.description
      : [job.description];

  /* ============================================================
     START APPLICATION
  ============================================================ */

  const handleStartApplication = () => {
    navigate("/careers/jobs/apply", {
      state: {
        jobTitle: job.title,
        jobLocation: job.location,
        departmentName:
          state.departmentName ||
          state.department ||
          "",
      },
    });
  };

  /* ============================================================
     BACK TO JOB LISTING
  ============================================================ */

  const handleBack = () => {
    navigate("/careers/jobs");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <CareerNavbar />

      {/* ======================================================
          JOB INTRODUCTION
      ====================================================== */}

      <main className="bg-white">

        <section className="mx-auto max-w-[1000px] px-6 pb-16 pt-32 sm:px-10 sm:pb-20 sm:pt-36 md:pt-40">

          {/* BACK TO LISTING */}

          <motion.button
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            onClick={handleBack}
            type="button"
            className="group mb-12 flex items-center gap-3 text-[14px] font-light text-[#258EDB] transition-colors duration-200 hover:text-[#167fc9]"
          >
            <FaArrowLeft
              className="text-[17px] transition-transform duration-200 group-hover:-translate-x-1"
            />

            <span>Back to Listing</span>
          </motion.button>

          {/* ==================================================
              TITLE + LOCATION
          ================================================== */}

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
          >

            <h1 className="max-w-[760px] text-[28px] font-light leading-[1.25] tracking-[-0.02em] text-[#555] sm:text-[32px] md:text-[34px]">
              {job.title}
            </h1>

            <span className="shrink-0 pt-1 text-[14px] font-light text-[#555] sm:min-w-[150px] sm:text-right">
              {job.location}
            </span>

          </motion.div>

          {/* ==================================================
              JOB DESCRIPTION
          ================================================== */}

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ delay: 0.1 }}
            className="mt-8 max-w-[900px]"
          >

            {description.map((paragraph, index) => (
              <p
                key={index}
                className="mb-6 text-[15px] font-light leading-[1.7] text-[#5d5d5d] last:mb-0 sm:text-[16px]"
              >
                {paragraph}
              </p>
            ))}

          </motion.div>

          {/* ==================================================
              START APPLICATION BUTTON
          ================================================== */}

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-10"
          >

            <button
              type="button"
              onClick={handleStartApplication}
              className="inline-flex items-center justify-center bg-[#258EDB] px-7 py-3 text-[14px] font-medium text-white transition-all duration-200 hover:bg-[#167fc9] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#258EDB] focus:ring-offset-2"
            >
              Start Your Application
            </button>

          </motion.div>

        </section>

        {/* ======================================================
            JOB INFORMATION
        ====================================================== */}

        <section className="bg-[#f4f3f6]">

          <div className="mx-auto max-w-[1000px] px-6 py-16 sm:px-10 sm:py-20 md:py-24">

            {/* ==================================================
                REQUIREMENTS
            ================================================== */}

            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.15,
              }}
              variants={fadeUp}
            >

              <h2 className="text-[25px] font-medium tracking-[-0.015em] text-[#555] sm:text-[28px]">
                Requirements
              </h2>

              <div className="mt-7 space-y-7">

                <div>
                  <h3 className="text-[16px] font-medium text-[#555]">
                    Minimum Education:
                  </h3>

                  <ul className="mt-3 list-disc space-y-2 pl-6 text-[15px] font-light leading-7 text-[#5d5d5d] sm:text-[16px]">
                    {job.requirements
                      .slice(0, 3)
                      .map((item, index) => (
                        <li key={index}>
                          {item}
                        </li>
                      ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-[16px] font-medium text-[#555]">
                    Minimum Experience:
                  </h3>

                  <ul className="mt-3 list-disc space-y-2 pl-6 text-[15px] font-light leading-7 text-[#5d5d5d] sm:text-[16px]">
                    {job.requirements
                      .slice(3)
                      .map((item, index) => (
                        <li key={index}>
                          {item}
                        </li>
                      ))}
                  </ul>
                </div>

              </div>

            </motion.section>

            {/* ==================================================
                RESPONSIBILITIES
            ================================================== */}

            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.15,
              }}
              variants={fadeUp}
              className="mt-14"
            >

              <h2 className="text-[25px] font-medium tracking-[-0.015em] text-[#555] sm:text-[28px]">
                Responsibilities
              </h2>

              <ul className="mt-7 list-disc space-y-3 pl-6 text-[15px] font-light leading-7 text-[#5d5d5d] sm:text-[16px]">
                {job.responsibilities.map((item, index) => (
                  <li key={index}>
                    {item}
                  </li>
                ))}
              </ul>

            </motion.section>

            {/* ==================================================
                BENEFITS
            ================================================== */}

            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.15,
              }}
              variants={fadeUp}
              className="mt-14"
            >

              <h2 className="text-[25px] font-medium tracking-[-0.015em] text-[#555] sm:text-[28px]">
                Benefits
              </h2>

              <ul className="mt-7 list-disc space-y-3 pl-6 text-[15px] font-light leading-7 text-[#5d5d5d] sm:text-[16px]">
                {job.benefits.map((item, index) => (
                  <li key={index}>
                    {item}
                  </li>
                ))}
              </ul>

            </motion.section>

            {/* ==================================================
                EQUAL OPPORTUNITY
            ================================================== */}

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.15,
              }}
              variants={fadeUp}
              className="mt-14 border-t border-[#d2d1d4] pt-8"
            >

              <p className="text-[13px] font-light leading-6 text-[#666]">
                At Alveoly, we believe strength is derived from the talents,
                ideas, experiences, and perspectives of a diverse workforce.
                We are committed to providing equal employment opportunities
                regardless of race, color, ancestry, religion, sex, national
                origin, sexual orientation, age, citizenship, marital status,
                disability, gender identity, veteran status, or any other
                protected class.
              </p>

              <p className="mt-5 text-[13px] font-light leading-6 text-[#666]">
                Alveoly is proud to be an equal opportunity employer. If you
                have a disability or special need that requires accommodation,
                please let us know so that we can provide appropriate support.
              </p>

            </motion.div>

          </div>

        </section>

      </main>

      {/* ======================================================
          PRODUCT EXPLORER
      ====================================================== */}

      <section className="bg-[#454545] text-white">

        <div className="mx-auto max-w-[1280px] px-6 py-16 sm:px-10 md:py-20 lg:px-14">

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

            <h2 className="text-[28px] font-light tracking-[-0.02em] sm:text-[32px]">
              Explore All Alveoly Products
            </h2>

            <p className="mt-2 text-[13px] font-light text-white/70">
              Choose your learning path
            </p>

          </motion.div>

          <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-12">

            {productColumns.map((column) => (
              <div key={column.title}>

                <h3 className="text-[15px] font-medium">
                  {column.title}
                </h3>

                <ul className="mt-4 space-y-2.5">

                  {column.links.map((link) => (
                    <li key={link}>

                      <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="text-left text-[13px] font-light text-white/65 transition-colors hover:text-white"
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

export default JobDetails;