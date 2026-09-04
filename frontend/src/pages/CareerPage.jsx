// src/pages/CareerPage.jsx

import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaUsers, FaRocket, FaAward } from "react-icons/fa";
import CareerNavbar from "../components/CareerNavbar";
import Footer from "../components/Footer";
import backgroundVideo from "../assets/background-video.mp4";

const IMAGES = {
  physicians:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=85",

  marketing:
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=85",

  sales:
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=85",
};

// Job data with slugs for job details
const FEATURED_JOBS = [
  {
    title: "Medical Professionals",
    image: IMAGES.physicians,
    slug: "medical-professionals",
    description: "Join our medical team and help shape healthcare education",
    openings: 5,
  },
  {
    title: "Marketing",
    image: IMAGES.marketing,
    slug: "marketing",
    description: "Drive growth through strategic marketing initiatives",
    openings: 3,
  },
  {
    title: "Sales",
    image: IMAGES.sales,
    slug: "sales",
    description: "Build relationships and drive revenue growth",
    openings: 4,
  },
];

// Career values data
const CAREER_VALUES = [
  {
    icon: FaUsers,
    title: "Collaborative Culture",
    description: "Work with passionate educators and innovators who support each other's growth.",
  },
  {
    icon: FaRocket,
    title: "Growth Opportunities",
    description: "Continuous learning and professional development to advance your career.",
  },
  {
    icon: FaAward,
    title: "Meaningful Impact",
    description: "Shape the future of education and make a difference in students' lives.",
  },
];

const CareerPage = () => {
  const navigate = useNavigate();

  const handleViewOpenings = () => {
    navigate("/careers/jobs");
  };

  const handleJobClick = (job) => {
    navigate(`/careers/jobs/${job.slug}`, {
      state: {
        jobTitle: job.title,
        jobDescription: job.description,
        openings: job.openings,
        image: job.image,
        jobLocation: "Alveoly",
      }
    });
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden text-[#333]">

      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative h-[680px] md:h-[720px] overflow-hidden">

        {/* Background video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>

        {/* Very light overlay — reference is bright, not dark */}
        <div className="absolute inset-0 bg-black/10" />

        {/* =====================================================
            NAVBAR
            Keep it over the video
        ====================================================== */}
        <div className="absolute top-0 left-0 right-0 z-30">
          <CareerNavbar />
        </div>

        {/* =====================================================
            HERO CONTENT
        ====================================================== */}
        <div className="relative z-20 h-full flex items-end justify-center">

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="
              w-full
              max-w-[1100px]
              mx-auto
              px-6
              pb-14
              md:pb-16
              text-center
            "
          >
            <h1
              className="
                text-white
                font-normal
                leading-[1.12]
                text-[34px]
                sm:text-[40px]
                md:text-[46px]
                lg:text-[50px]
                tracking-[-0.5px]
              "
            >
              Build Your Career,
              <br />
              Shape Ghana's Future
            </h1>

            <motion.button
              onClick={handleViewOpenings}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                mt-8
                px-9
                py-4
                min-w-[198px]
                bg-[#2189df]
                hover:bg-[#1678ca]
                text-white
                text-[15px]
                font-medium
                transition-colors
                duration-200
              "
            >
              View Open Positions
              <FaArrowRight className="text-[11px]" />
            </motion.button>
          </motion.div>
        </div>
      </section>


      {/* =========================================================
          WHY JOIN US SECTION - Replacing Awards Section
      ========================================================== */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-[#333] font-normal text-[30px] md:text-[36px] lg:text-[40px]">
              Why Join Alveoly?
            </h2>
            <p className="mt-4 text-[15px] md:text-[16px] text-[#666] max-w-[650px] mx-auto">
              Be part of a team that's transforming education in Ghana and beyond
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {CAREER_VALUES.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-[#2189df]/10 flex items-center justify-center">
                      <Icon className="text-[#2189df] text-2xl" />
                    </div>
                  </div>
                  <h3 className="text-[#333] text-xl font-semibold mb-3">
                    {value.title}
                  </h3>
                  <p className="text-[#666] text-[14px] leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>


      {/* =========================================================
          FEATURED JOB LISTINGS
      ========================================================== */}
      <section
        id="featured-jobs"
        className="bg-[#f7f7f7] pt-20 md:pt-24 pb-20"
      >
        <div className="max-w-[1100px] mx-auto px-6">

          <div className="text-center mb-10">
            <h2
              className="
                inline-block
                text-[20px]
                md:text-[24px]
                font-medium
                text-[#333]
                border-b-2
                border-[#2189df]
                pb-2
              "
            >
              Featured Job Opportunities
            </h2>
            <p className="mt-3 text-[14px] text-[#666]">
              Explore exciting career opportunities at Alveoly
            </p>
          </div>

          {/* EXACTLY THREE CARDS */}
          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-8
            "
          >

            {FEATURED_JOBS.map((job) => (
              <JobCard
                key={job.title}
                title={job.title}
                image={job.image}
                onClick={() => handleJobClick(job)}
                openings={job.openings}
              />
            ))}

          </div>
        </div>
      </section>


      {/* =========================================================
          CULTURE SECTION
      ========================================================== */}
      <section className="relative bg-[#e8f8fc] overflow-hidden py-20 md:py-24">

        <div
          className="
            max-w-[1100px]
            mx-auto
            px-6
          "
        >
          <div
            className="
              flex
              flex-col
              md:flex-row
              items-center
              justify-center
              gap-8
              md:gap-12
              text-center
              md:text-left
            "
          >

            {/* Message */}
            <div className="max-w-[650px]">

              <h2
                className="
                  text-[#163c78]
                  text-[24px]
                  md:text-[28px]
                  leading-[1.15]
                  font-medium
                "
              >
                Join a Team That's
                <br />
                Making a Difference
                <br className="hidden md:block" />
                in Ghana's Education
              </h2>

              <p className="mt-4 text-[13px] md:text-[14px] text-[#4f6875] leading-relaxed">
                We're building the future of education in Ghana. Our team is 
                passionate about creating meaningful learning experiences 
                that empower students and professionals to achieve their goals.
              </p>

              <button
                onClick={handleViewOpenings}
                className="
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  bg-[#2189df]
                  hover:bg-[#1678ca]
                  text-white
                  px-6
                  py-3
                  rounded-lg
                  text-[14px]
                  font-medium
                  transition-colors
                  duration-200
                "
              >
                Explore Opportunities
                <FaArrowRight className="text-[10px]" />
              </button>
            </div>

            {/* People Illustration */}
            <div className="flex-shrink-0">
              <div className="flex items-end justify-center gap-1 md:gap-3">
                <Person color="bg-[#0c9aa2]" height="h-36" />
                <Person color="bg-[#f6ae22]" height="h-44" />
                <Person color="bg-[#ec6d67]" height="h-40" />
                <Person color="bg-[#0b4d8b]" height="h-52" />
                <Person color="bg-[#ef443c]" height="h-48" />
                <Person color="bg-[#f39b25]" height="h-56" />
                <Person color="bg-[#159f9b]" height="h-45" />
                <Person color="bg-[#193d72]" height="h-54" />
                <Person color="bg-[#ed7049]" height="h-44" />
                <Person color="bg-[#f2a51e]" height="h-50" />
                <Person color="bg-[#0b7d88]" height="h-42" />
                <Person color="bg-[#ef5149]" height="h-53" />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================
          PREPARATION THAT ENABLES SUCCESS
      ========================================================== */}
      <section className="bg-white py-14 md:py-20">

        <div className="max-w-[1100px] mx-auto px-6 text-center">

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="
              text-[#444]
              font-normal
              text-[30px]
              md:text-[36px]
              lg:text-[40px]
              leading-tight
            "
          >
            Empowering education across Ghana
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="
              max-w-[760px]
              mx-auto
              mt-6
              text-[16px]
              md:text-[17px]
              leading-7
              text-[#666]
            "
          >
            We are dedicated to creating exceptional educational 
            resources that make a difference. Our team is passionate 
            about helping students succeed and building a brighter 
            future for education in Ghana and beyond.
          </motion.p>

          <motion.a
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            href="/careers/what-we-do"
            className="
              inline-flex
              items-center
              gap-2
              mt-7
              px-7
              py-3
              bg-[#2189df]
              hover:bg-[#1678ca]
              text-white
              text-[14px]
              font-medium
              transition-colors
            "
          >
            Learn More
            <FaArrowRight className="text-[10px]" />
          </motion.a>

        </div>
      </section>


      <Footer />

    </div>
  );
};


/* =============================================================
   JOB CARD - Now clickable with navigation
============================================================= */

const JobCard = ({ title, image, onClick, openings }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.35 }}
      onClick={onClick}
      className="
        group
        block
        relative
        overflow-hidden
        bg-gray-100
        cursor-pointer
        rounded-xl
        shadow-sm
        hover:shadow-xl
        transition-all
        duration-300
      "
    >
      <div className="relative h-[190px] md:h-[160px] lg:h-[175px]">

        <img
          src={image}
          alt={title}
          loading="lazy"
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            transition-transform
            duration-500
            group-hover:scale-[1.08]
          "
        />

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/20" />

        {/* Reference-style dark translucent strip */}
        <div
          className="
            absolute
            left-0
            right-0
            bottom-0
            bg-gradient-to-t from-black/80 via-black/60 to-transparent
            px-4
            pt-8
            pb-4
          "
        >
          <span
            className="
              block
              text-white
              text-[19px]
              md:text-[18px]
              font-normal
              text-center
            "
          >
            {title}
          </span>

          {/* Openings badge */}
          <div className="flex justify-center items-center gap-2 mt-1">
            <span className="text-[10px] text-white/70 font-light">
              {openings} {openings === 1 ? 'opening' : 'openings'}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="text-[10px] text-white/70 font-light">
              Click to apply
            </span>
          </div>
        </div>

        {/* View details indicator on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="bg-white/90 text-[#333] px-4 py-2 rounded-full text-xs font-medium shadow-lg">
            View Openings →
          </span>
        </div>
      </div>
    </motion.div>
  );
};


/* =============================================================
   SIMPLE DECORATIVE PERSON
   Temporary CSS illustration until actual UWorld-style
   illustration asset is supplied.
============================================================= */

const Person = ({ color, height }) => {
  return (
    <div className={`relative ${height} w-8 md:w-12 shrink-0`}>

      {/* head */}
      <div
        className="
          absolute
          top-0
          left-1/2
          -translate-x-1/2
          w-7
          h-7
          md:w-9
          md:h-9
          rounded-full
          bg-[#d58a62]
        "
      />

      {/* body */}
      <div
        className={`
          absolute
          top-6
          md:top-8
          left-1/2
          -translate-x-1/2
          w-8
          md:w-12
          h-[calc(100%-24px)]
          md:h-[calc(100%-32px)]
          ${color}
          rounded-t-[18px]
        `}
      />
    </div>
  );
};

export default CareerPage;