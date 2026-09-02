// src/pages/CareerWhatWeDo.jsx

import React from "react";
import { motion } from "framer-motion";
import CareerNavbar from "../components/CareerNavbar";
import Footer from "../components/Footer";

import backgroundVideo from "../assets/background-video.mp4";

// -----------------------------------------------------------------------------
// Replace these with your actual images if you have them.
// Keeping the paths centralized makes the page easy to update.
// -----------------------------------------------------------------------------

import studyImage from "../assets/kalveoBg.jpg";
// If you have dedicated What We Do images, use them here instead.
// import professionalImage from "../assets/what-we-do-professional.jpg";
// import scienceImage from "../assets/what-we-do-science.jpg";

const CareerWhatWeDo = () => {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden font-['Inter',sans-serif]">
      <CareerNavbar />

      {/* =====================================================================
          HERO
      ====================================================================== */}

      <section className="relative h-[72vh] min-h-[560px] max-h-[760px] overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>

        {/* Dark overlay matching the reference */}
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 h-full max-w-[1280px] mx-auto px-8 flex items-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="
              max-w-[520px]
              text-white
              text-[42px]
              sm:text-[50px]
              md:text-[58px]
              lg:text-[64px]
              font-light
              leading-[1.05]
              tracking-[-1.5px]
            "
          >
            Helping students
            <br />
            become professionals
          </motion.h1>
        </div>
      </section>

      {/* =====================================================================
          INTRODUCTION
      ====================================================================== */}

      <section className="bg-white">
        <div className="max-w-[900px] mx-auto px-6 py-[105px] text-center">

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="
              text-[32px]
              sm:text-[38px]
              md:text-[42px]
              font-light
              leading-[1.2]
              text-[#555]
            "
          >
            Simply stated: We create study materials
            <br className="hidden sm:block" />
            for high-stakes exams.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="
              max-w-[700px]
              mx-auto
              mt-8
              text-[16px]
              sm:text-[17px]
              leading-[1.65]
              text-[#666]
            "
          >
            Specifically, we create practice question banks (QBanks) to
            help users immediately engage with content. Our material
            doesn't just prepare users for their exams, it ensures they
            understand the concept behind each question with expertly
            crafted explanations and visuals.
          </motion.p>

        </div>
      </section>

      {/* =====================================================================
          VISUAL COLLAGE
      ====================================================================== */}

      <section className="bg-white pb-[110px]">
        <div className="max-w-[880px] mx-auto px-6">

          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* Left image */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="h-[300px] sm:h-[360px] overflow-hidden"
            >
              <img
                src={studyImage}
                alt="Student studying"
                className="
                  w-full
                  h-full
                  object-cover
                "
              />
            </motion.div>

            {/* Right visual */}
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="
                h-[300px]
                sm:h-[360px]
                bg-[#f2f2f4]
                flex
                items-center
                justify-center
                overflow-hidden
              "
            >
              {/* Lightweight medical illustration placeholder.
                  Replace with your actual medical illustration asset. */}

              <div className="relative w-[250px] h-[230px] opacity-80">

                <div
                  className="
                    absolute
                    left-1/2
                    top-1/2
                    -translate-x-1/2
                    -translate-y-1/2
                    w-[155px]
                    h-[120px]
                    rounded-[45%]
                    bg-[#d6d8e0]
                    border-[14px]
                    border-[#bfc2ce]
                    rotate-[-12deg]
                  "
                />

                <div
                  className="
                    absolute
                    left-[55px]
                    top-[82px]
                    w-[130px]
                    h-[65px]
                    rounded-full
                    border-[8px]
                    border-[#9da0ae]
                    rotate-[20deg]
                  "
                />

                <div className="absolute left-[100px] top-[82px] w-3 h-3 rounded-full bg-[#7d8fc8]" />
                <div className="absolute left-[137px] top-[72px] w-3 h-3 rounded-full bg-[#9b80b8]" />
                <div className="absolute left-[125px] top-[105px] w-3 h-3 rounded-full bg-[#7897c8]" />
                <div className="absolute left-[155px] top-[100px] w-3 h-3 rounded-full bg-[#b783a6]" />

                <div
                  className="
                    absolute
                    left-[60px]
                    bottom-[15px]
                    w-[130px]
                    h-[8px]
                    rounded-full
                    bg-[#a5a7b5]
                    rotate-[28deg]
                  "
                />

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          INDUSTRY LEADER FEATURE
      ====================================================================== */}

      <section className="relative h-[500px] sm:h-[580px] overflow-hidden">

        <img
          src={studyImage}
          alt=""
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            scale-105
          "
        />

        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 h-full max-w-[1100px] mx-auto px-8 flex items-center justify-end">

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="w-full md:w-[48%] text-white"
          >

            <h2
              className="
                text-[34px]
                sm:text-[42px]
                md:text-[46px]
                font-light
                leading-[1.15]
                mb-7
              "
            >
              We are an industry
              <br />
              leader for a reason.
              <br />
              Our people are
              <br />
              educators.
            </h2>

            <p className="text-[16px] leading-7 text-white/90 max-w-[460px] mb-8">
              We bring together educators, healthcare professionals,
              technologists, designers, and creative thinkers to build
              learning experiences that make difficult subjects easier
              to understand.
            </p>

            <a
              href="/careers/jobs"
              className="
                inline-flex
                items-center
                justify-center
                bg-[#1689df]
                hover:bg-[#087aca]
                text-white
                px-9
                py-3.5
                min-w-[185px]
                text-[15px]
                font-medium
                transition-colors
              "
            >
              See Job Openings
            </a>

          </motion.div>

        </div>
      </section>

      {/* =====================================================================
          MISSION / BETTER WORLD
      ====================================================================== */}

      <section className="bg-white py-[115px]">
        <div className="max-w-[880px] mx-auto px-6">

          <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="h-[420px]"
            >
              <img
                src={studyImage}
                alt="Professional at work"
                className="
                  w-full
                  h-full
                  object-cover
                "
              />
            </motion.div>

            {/* Blue panel */}
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="
                min-h-[420px]
                bg-[#1689df]
                px-10
                sm:px-14
                py-14
                sm:py-16
                flex
                flex-col
                justify-center
              "
            >

              <h2
                className="
                  text-white
                  text-[32px]
                  sm:text-[39px]
                  font-light
                  leading-[1.2]
                  mb-7
                "
              >
                We want to make the
                <br />
                world a better place,
                <br />
                one student at a time.
              </h2>

              <p
                className="
                  text-white/95
                  text-[15px]
                  sm:text-[16px]
                  leading-7
                  mb-8
                  max-w-[390px]
                "
              >
                If that's your goal too, then take a look at our job
                openings and let's talk!
              </p>

              <div>
                <a
                  href="/careers/jobs"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    bg-white
                    text-[#1689df]
                    px-9
                    py-3.5
                    min-w-[190px]
                    text-[15px]
                    font-medium
                    hover:bg-gray-50
                    transition-colors
                  "
                >
                  See Job Openings
                </a>
              </div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          EXPLORE PRODUCTS
      ====================================================================== */}

      <section className="bg-[#071522] text-white py-16">

        <div className="max-w-[1100px] mx-auto px-6">

          <div className="text-center mb-14">

            <h2 className="text-[30px] sm:text-[34px] font-light">
              Explore All UWorld Products
            </h2>

            <p className="mt-3 text-[15px] text-gray-300">
              Choose your exam
            </p>

          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-12">

            <ProductColumn
              title="Accounting"
              items={[
                "CPA",
                "CMA",
                "CIA",
                "CPE",
                "EA",
                "Blog",
              ]}
            />

            <ProductColumn
              title="High School"
              items={[
                "For Students",
                "SAT®",
                "ACT®",
                "AP®",
                "Blog",
                "For Educators",
                "AP®",
                "SAT®",
                "ACT®",
                "Blog",
              ]}
            />

            <div>
              <ProductColumn
                title="Finance"
                items={[
                  "CFA®",
                  "CMT®",
                  "Blog",
                ]}
              />

              <div className="mt-8">
                <h3 className="text-[18px] font-semibold mb-5">
                  Grad School
                </h3>

                <ProductItems
                  items={[
                    "MCAT®",
                    "Blog",
                  ]}
                />
              </div>
            </div>

            <ProductColumn
              title="Legal"
              items={[
                "Bar Review",
                "MBE®",
                "LLM",
                "MPRE®",
                "Legal Curriculum",
                "Blog",
              ]}
            />

            <ProductColumn
              title="Medical"
              items={[
                "USMLE® Step 1",
                "USMLE Step 2 CK",
                "USMLE Step 2 CS",
                "USMLE Step 3",
                "COMLEX® Level 1",
                "COMLEX Level 2",
                "Internal Medicine (ABIM®)",
                "Family Medicine (ABFM®)",
                "International Clinical QBank",
                "Medical Library",
                "PA (PANCE® / PANRE®)",
                "Blog",
              ]}
            />

            <div>

              <ProductColumn
                title="Nursing"
                items={[
                  "NCLEX RN®",
                  "NCLEX PN®",
                  "Clinical Med Math",
                  "FNP",
                  "Blog",
                ]}
              />

              <div className="mt-8">
                <h3 className="text-[18px] font-semibold mb-5">
                  Pharmacy
                </h3>

                <ProductItems
                  items={[
                    "NAPLEX®",
                    "MPJE®",
                    "CPJE",
                  ]}
                />
              </div>

            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

/* ============================================================================
   PRODUCT COMPONENTS
============================================================================ */

const ProductColumn = ({ title, items }) => (
  <div>
    <h3 className="text-[18px] font-semibold mb-5">
      {title}
    </h3>

    <ProductItems items={items} />
  </div>
);

const ProductItems = ({ items }) => (
  <div className="space-y-2.5">
    {items.map((item, index) => (
      <a
        href="#"
        key={`${item}-${index}`}
        className="
          block
          text-[13px]
          leading-5
          text-gray-300
          hover:text-white
          transition-colors
        "
      >
        {item}
      </a>
    ))}
  </div>
);

export default CareerWhatWeDo;