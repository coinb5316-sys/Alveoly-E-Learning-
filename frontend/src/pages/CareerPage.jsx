// src/pages/CareerPage.jsx

import React from "react";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
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

const CareerPage = () => {
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
              Love Your Job, Live Your Life,
              <br />
              Make An Impact
            </h1>

            <motion.a
              href="#featured-jobs"
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
              See Job Openings
              <FaArrowRight className="text-[11px]" />
            </motion.a>
          </motion.div>
        </div>

        {/* =====================================================
            GREAT PLACE TO WORK BADGE
        ====================================================== */}
        <div
          className="
            absolute
            z-20
            right-[7%]
            bottom-[105px]
            hidden
            md:block
          "
        >
          <div className="w-[145px] md:w-[160px]">

            <div
              className="
                bg-[#ed1b2f]
                text-white
                px-3
                py-4
                font-bold
                leading-[0.92]
                text-[28px]
                md:text-[30px]
              "
            >
              Great
              <br />
              Place
              <br />
              To
              <br />
              Work
              <span className="text-[12px] align-top ml-1">®</span>
            </div>

            <div
              className="
                bg-[#173f78]
                text-white
                text-center
                px-2
                pt-2
                pb-3
                relative
              "
            >
              <div className="font-bold text-[21px]">
                Certified
              </div>

              <div className="text-[10px] font-medium mt-1">
                OCT 2023-OCT 2024
              </div>

              <div className="text-[10px] font-medium">
                USA
              </div>

              {/* badge point */}
              <div
                className="
                  absolute
                  left-1/2
                  -translate-x-1/2
                  -bottom-[17px]
                  w-0
                  h-0
                  border-l-[28px]
                  border-r-[28px]
                  border-t-[17px]
                  border-l-transparent
                  border-r-transparent
                  border-t-[#173f78]
                "
              />
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================
          GREAT PLACE TO WORK / CULTURE SECTION
      ========================================================== */}
      <section className="relative bg-[#e8f8fc] overflow-hidden">

        <div
          className="
            max-w-[1100px]
            mx-auto
            px-6
            pt-24
            md:pt-28
            pb-0
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
              md:gap-10
              text-center
              md:text-left
            "
          >

            {/* Badge */}
            <div className="shrink-0">
              <div className="w-[115px] md:w-[125px]">

                <div
                  className="
                    bg-[#ed1b2f]
                    text-white
                    px-3
                    py-3
                    font-bold
                    leading-[0.9]
                    text-[23px]
                  "
                >
                  Great
                  <br />
                  Place
                  <br />
                  To
                  <br />
                  Work
                  <span className="text-[9px] align-top">®</span>
                </div>

                <div
                  className="
                    bg-[#173f78]
                    text-white
                    text-center
                    px-1
                    py-2
                  "
                >
                  <div className="font-bold text-[16px]">
                    Certified
                  </div>

                  <div className="text-[7px] mt-1">
                    OCT 2023-OCT 2024
                  </div>

                  <div className="text-[8px]">
                    USA
                  </div>
                </div>
              </div>
            </div>

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
                Our employees have spoken!
                <br />
                Our company culture is amazing and our
                <br className="hidden md:block" />
                Great Place to Work Certification™ proves it.
              </h2>

              <p className="mt-4 text-[10px] md:text-[11px] text-[#4f6875]">
                Source: 2023 Great Place To Work Trust Index® Survey
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            PEOPLE ILLUSTRATION
            Replace this with your actual illustration asset
            if you have one.
        ====================================================== */}
        <div className="mt-12 md:mt-16 h-[220px] md:h-[275px] relative overflow-hidden">

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-center">

            {/* Decorative people silhouettes */}
            <div className="flex items-end justify-center gap-1 md:gap-3 w-full">

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
      </section>


      {/* =========================================================
          FEATURED JOB LISTINGS
      ========================================================== */}
      <section
        id="featured-jobs"
        className="bg-white pt-20 md:pt-24 pb-20"
      >
        <div className="max-w-[1100px] mx-auto px-6">

          <div className="mb-7">
            <h2
              className="
                inline-block
                text-[16px]
                md:text-[17px]
                font-medium
                text-[#333]
                border-b
                border-[#333]
                pb-[2px]
              "
            >
              Featured Job Listings
            </h2>
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

            <JobCard
              title="Physicians"
              image={IMAGES.physicians}
            />

            <JobCard
              title="Marketing"
              image={IMAGES.marketing}
            />

            <JobCard
              title="Sales"
              image={IMAGES.sales}
            />

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
            Preparation that enables success
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
            We pride ourselves on producing the highest quality
            educational resources. Our goal is to create an environment
            where talented people can do meaningful work, grow their
            skills, and make a lasting impact.
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
   JOB CARD
============================================================= */

const JobCard = ({ title, image }) => {
  return (
    <motion.a
      href="#jobs"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.35 }}
      className="
        group
        block
        relative
        overflow-hidden
        bg-gray-100
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
            group-hover:scale-[1.03]
          "
        />

        {/* Reference-style dark translucent strip */}
        <div
          className="
            absolute
            left-0
            right-0
            bottom-0
            bg-black/55
            px-4
            py-4
          "
        >
          <span
            className="
              text-white
              text-[19px]
              md:text-[18px]
              font-normal
            "
          >
            {title}
          </span>
        </div>
      </div>
    </motion.a>
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