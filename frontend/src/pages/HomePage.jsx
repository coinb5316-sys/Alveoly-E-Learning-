import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowRight,
  FaUserMd,
  FaLaptopMedical,
  FaCalculator,
  FaMoneyBillWave,
  FaBalanceScale,
  FaUserGraduate,
  FaGraduationCap,
  FaBriefcase,
  FaFlask,
  FaStethoscope,
  FaUsers,
  FaBook,
  FaGlobeAfrica,
  FaWhatsapp,
  FaAward,
  FaQuoteLeft,
  FaQuoteRight,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SmartChatBot from "../components/SmartChatBot";

import kalveoBg from "../images/kalveo-bg.jpg";


/* ============================================================
   PRODUCT DATA
============================================================ */

const PRODUCTS = [
  {
    title: "Medical",
    description: "Making the dream to practice medicine a reality",
    icon: FaUserMd,
    link: "/programs?category=medical",
  },
  {
    title: "Nursing",
    description: "Guiding your success from classroom to clinical",
    icon: FaLaptopMedical,
    link: "/programs?category=nursing",
  },
  {
    title: "Accounting",
    description: "Helping you pass your CPA exams with confidence",
    icon: FaCalculator,
    link: "/programs?category=accounting",
  },
  {
    title: "Finance",
    description: "Preparing you for success in financial careers",
    icon: FaMoneyBillWave,
    link: "/programs?category=finance",
  },
  {
    title: "High School",
    description: "Helping students prepare for the next step",
    icon: FaGraduationCap,
    link: "/programs?category=high-school",
  },
  {
    title: "Grad School",
    description: "Taking your graduate preparation to the next level",
    icon: FaUserGraduate,
    link: "/programs?category=grad-school",
  },
  {
    title: "Legal",
    description: "Equipping you with the tools to pass the bar",
    icon: FaBalanceScale,
    link: "/programs?category=legal",
  },
  {
    title: "Pharmacy",
    description: "Preparing the next generation of pharmacists",
    icon: FaFlask,
    link: "/programs?category=pharmacy",
  },
];


/* ============================================================
   FOOTER PRODUCT COLUMNS
============================================================ */

const FOOTER_PRODUCTS = [
  {
    title: "Medical",
    items: [
      "Medical Licensing",
      "International Medical",
      "Medical Education",
      "Clinical Research",
    ],
  },
  {
    title: "Nursing",
    items: [
      "NCLEX-RN",
      "NCLEX-PN",
      "Nursing Education",
      "Clinical Nursing",
    ],
  },
  {
    title: "Pharmacy",
    items: [
      "Pharmacology",
      "Pharmacy Exams",
      "Clinical Pharmacy",
      "Pharmacy Education",
    ],
  },
  {
    title: "Programs",
    items: [
      "Healthcare",
      "Public Health",
      "Allied Health",
      "Professional Development",
    ],
  },
  {
    title: "Resources",
    items: [
      "For Students",
      "For Educators",
      "Blog",
      "Study Resources",
    ],
  },
];


/* ============================================================
   TESTIMONIALS DATA
============================================================ */

const TESTIMONIALS = [
  {
    id: 1,
    name: "Dr. Kwame Asare",
    role: "Medical Student, University of Ghana",
    quote: "The medical preparation resources at Alveoly transformed my approach to studying. I went from struggling with complex concepts to mastering them with ease.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
  },
  {
    id: 2,
    name: "Ama Serwaa",
    role: "Nursing Student, KNUST",
    quote: "The nursing programs are exceptional! The clinical simulations and practice questions prepared me perfectly for my NCLEX exams. I couldn't have passed without Alveoly.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
  },
  {
    id: 3,
    name: "Michael Osei",
    role: "Pharmacy Graduate, UCC",
    quote: "As a pharmacy student, I needed tools that would challenge me. Alveoly's pharmacology resources were exactly what I needed to excel in my board exams.",
    rating: 4,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
  },
  {
    id: 4,
    name: "Efua Mensah",
    role: "Accounting Professional, KPMG Ghana",
    quote: "The accounting and CPA preparation courses are top-notch. The practical examples and real-world scenarios helped me pass my exams on the first attempt.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
  },
];


/* ============================================================
   HOME PAGE
============================================================ */

const HomePage = () => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    userId: null,
    userName: "Guest",
  });

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  /* ----------------------------------------------------------
     User information
  ---------------------------------------------------------- */

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) return;

    try {
      const userData = JSON.parse(user);

      setUserInfo({
        userId: userData._id || userData.id,
        userName:
          userData.name ||
          userData.email?.split("@")[0] ||
          "Student",
      });
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []);

  /* ----------------------------------------------------------
     Testimonial Auto-Slide
  ---------------------------------------------------------- */

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) =>
        prev === TESTIMONIALS.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const goToTestimonial = (index) => {
    setCurrentTestimonial(index);
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) =>
      prev === TESTIMONIALS.length - 1 ? 0 : prev + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) =>
      prev === 0 ? TESTIMONIALS.length - 1 : prev - 1
    );
  };


  /* ----------------------------------------------------------
     WhatsApp
  ---------------------------------------------------------- */

  const handleWhatsAppClick = () => {
    const phoneNumber = "233549556116";

    const message = encodeURIComponent(
      "Hello! I'm interested in learning more about Alveoly E-Learning Academy. Can you help me?"
    );

    window.open(
      `https://wa.me/${phoneNumber}?text=${message}`,
      "_blank"
    );
  };


  return (
    <div className="min-h-screen bg-white text-[#333] overflow-x-hidden">

      {/* ======================================================
          NAVBAR
      ======================================================= */}

      <Navbar />


      {/* ======================================================
          HERO
      ======================================================= */}

      <section className="relative h-[560px] md:h-[600px] overflow-hidden">

        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${kalveoBg})`,
          }}
        />

        {/* Reference-style dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/15" />

        {/* Hero content */}
        <div className="relative z-10 h-full max-w-[1180px] mx-auto px-6 flex items-center">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-[520px] pt-10"
          >

            <h1
              className="
                text-white
                font-medium
                text-[31px]
                sm:text-[38px]
                md:text-[43px]
                leading-[1.08]
              "
            >
              Simplifying Complex
              <br />
              Concepts for Your Success
            </h1>

            <p
              className="
                mt-3
                text-white/85
                text-[14px]
                md:text-[15px]
                leading-5
                max-w-[330px]
              "
            >
              Adaptive learning solutions
              <br />
              designed for Ghanaian students
            </p>

            <button
              onClick={() => navigate("/programs")}
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                bg-[#f7c928]
                hover:bg-[#eab900]
                text-[#222]
                px-5
                py-2.5
                rounded-full
                text-[12px]
                font-semibold
                transition-colors
              "
            >
              Explore Our Programs
              <FaArrowRight className="text-[9px]" />
            </button>

          </motion.div>
        </div>


        {/* ====================================================
            ANNOUNCEMENT BAR
        ===================================================== */}

        <div
          className="
            absolute
            bottom-0
            left-0
            right-0
            z-20
            bg-black/70
            backdrop-blur-[2px]
            border-t
            border-white/10
          "
        >
          <div
            className="
              max-w-[1180px]
              mx-auto
              px-6
              py-2
              text-[8px]
              md:text-[9px]
              text-white/80
              flex
              items-center
              gap-2
            "
          >
            <span className="uppercase font-bold tracking-wide">
              What's New
            </span>

            <span className="w-px h-3 bg-white/30" />

            <span>
              Explore the latest educational resources,
              programs, and learning tools at Alveoly.
            </span>

            <button
              onClick={() => navigate("/programs")}
              className="text-[#f7c928] font-semibold hover:underline ml-1"
            >
              Read More
            </button>
          </div>
        </div>

      </section>


      {/* ======================================================
          PRODUCT CATEGORIES
      ======================================================= */}

      <section className="bg-white py-10 md:py-14">

        <div className="max-w-[1120px] mx-auto px-6">

          <div
            className="
              grid
              grid-cols-2
              md:grid-cols-4
              gap-x-8
              gap-y-9
            "
          >

            {PRODUCTS.map((product, index) => {

              const Icon = product.icon;

              return (
                <motion.button
                  key={product.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.04,
                  }}
                  onClick={() => navigate(product.link)}
                  className="
                    group
                    text-center
                    focus:outline-none
                  "
                >

                  {/* Icon */}
                  <div className="flex justify-center mb-2">

                    <Icon
                      className="
                        text-[#1687df]
                        text-[20px]
                        md:text-[23px]
                        group-hover:scale-110
                        transition-transform
                      "
                    />

                  </div>

                  {/* Title */}
                  <h3
                    className="
                      text-[#1687df]
                      text-[12px]
                      md:text-[13px]
                      font-medium
                    "
                  >
                    {product.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="
                      mt-1
                      text-[9px]
                      md:text-[10px]
                      leading-[1.35]
                      text-[#777]
                      max-w-[160px]
                      mx-auto
                      min-h-[28px]
                    "
                  >
                    {product.description}
                  </p>

                  {/* CTA */}
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1
                      mt-2
                      text-[#1687df]
                      text-[9px]
                      font-medium
                      group-hover:underline
                    "
                  >
                    Get Started
                    <FaArrowRight className="text-[6px]" />
                  </span>

                </motion.button>
              );
            })}

          </div>

        </div>
      </section>


      {/* ======================================================
          AWARDS & RECOGNITION - GHANA FOCUSED
      ======================================================= */}

      <section className="bg-[#f7f7f7] py-12 md:py-16">

        <div className="max-w-[1050px] mx-auto px-6">

          <h2
            className="
              text-center
              text-[#777]
              font-normal
              text-[18px]
              md:text-[21px]
              mb-9
            "
          >
            Awards & Recognition
          </h2>

          <div
            className="
              flex
              flex-wrap
              justify-center
              items-center
              gap-8
              md:gap-14
            "
          >

            {/* Best EdTech in Ghana */}
            <div className="text-center">
              <div className="mx-auto w-[75px] md:w-[88px]">

                <div
                  className="
                    bg-[#006b3e]
                    text-white
                    font-bold
                    leading-[0.9]
                    text-[15px]
                    md:text-[18px]
                    p-2
                  "
                >
                  Best
                  <br />
                  EdTech
                  <br />
                  in
                  <br />
                  Ghana
                </div>

                <div
                  className="
                    bg-[#f5a623]
                    text-white
                    text-[7px]
                    py-1
                    font-bold
                  "
                >
                  2024 Winner
                </div>

              </div>
            </div>


            {/* Ministry of Education */}
            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                text-[#222]
              "
            >
              <div className="text-[19px] font-bold tracking-tight text-[#006b3e]">
                MoE
              </div>

              <div className="text-[8px] font-semibold">
                Ministry of
              </div>

              <div className="text-[8px]">
                Education
              </div>

              <div className="text-[7px] text-gray-500">
                Partner 2024
              </div>
            </div>


            {/* Ghana Education Service */}
            <div
              className="
                w-[65px]
                h-[65px]
                md:w-[75px]
                md:h-[75px]
                rounded-[12px]
                bg-[#ce1126]
                text-white
                flex
                flex-col
                items-center
                justify-center
                rotate-45
              "
            >
              <div className="-rotate-45 text-center">
                <div className="text-[22px] font-bold leading-none">
                  GES
                </div>
                <div className="text-[7px]">
                  Approved
                </div>
              </div>
            </div>


            {/* Excellence Award */}
            <div
              className="
                w-[65px]
                h-[65px]
                md:w-[75px]
                md:h-[75px]
                rounded-full
                border-[5px]
                border-[#f5a623]
                flex
                items-center
                justify-center
                text-[#d4890a]
              "
            >
              <FaAward className="text-3xl" />
            </div>

          </div>

        </div>
      </section>


      {/* ======================================================
          STUDENT TESTIMONIALS
      ======================================================= */}

      <section className="bg-white py-16 md:py-20">

        <div className="max-w-[900px] mx-auto px-6">

          <h2
            className="
              text-center
              text-[#555]
              font-normal
              text-[23px]
              md:text-[29px]
              mb-4
            "
          >
            What Our Students Say
          </h2>

          <p className="text-center text-[11px] md:text-[12px] text-[#777] mb-10">
            Real stories from students across Ghana who achieved their goals with Alveoly
          </p>

          {/* Testimonial Carousel */}
          <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >

            {/* Dots indicator - NOW ABOVE the testimonials */}
            <div className="flex justify-center items-center gap-2 mb-8">
              {TESTIMONIALS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`
                    transition-all duration-300 rounded-full
                    ${index === currentTestimonial
                      ? 'w-8 h-[2px] bg-[#1687df]'
                      : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
                    }
                  `}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            {/* Testimonial Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-[#f8f9fa] rounded-xl p-8 md:p-10 shadow-sm border border-gray-100"
              >
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <img
                      src={TESTIMONIALS[currentTestimonial].image}
                      alt={TESTIMONIALS[currentTestimonial].name}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-[#1687df]"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center md:text-left">

                    {/* Quote icons */}
                    <div className="text-[#1687df] opacity-30 mb-2">
                      <FaQuoteLeft className="inline text-xl" />
                    </div>

                    <p className="text-[13px] md:text-[15px] leading-relaxed text-[#555] italic mb-4">
                      "{TESTIMONIALS[currentTestimonial].quote}"
                    </p>

                    <div className="text-[#1687df] opacity-30 mb-3">
                      <FaQuoteRight className="inline text-xl" />
                    </div>

                    {/* Rating stars */}
                    <div className="flex justify-center md:justify-start gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`text-[12px] ${
                            i < TESTIMONIALS[currentTestimonial].rating
                              ? 'text-[#f7c928]'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    <h4 className="text-[14px] font-semibold text-[#333]">
                      {TESTIMONIALS[currentTestimonial].name}
                    </h4>

                    <p className="text-[10px] text-[#777]">
                      {TESTIMONIALS[currentTestimonial].role}
                    </p>

                  </div>
                </div>

                {/* Navigation arrows */}
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    onClick={prevTestimonial}
                    className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-[#1687df] hover:text-white hover:border-[#1687df] flex items-center justify-center transition-colors text-[#333] text-xs"
                    aria-label="Previous testimonial"
                  >
                    <FaChevronLeft />
                  </button>

                  <button
                    onClick={nextTestimonial}
                    className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-[#1687df] hover:text-white hover:border-[#1687df] flex items-center justify-center transition-colors text-[#333] text-xs"
                    aria-label="Next testimonial"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>

        </div>
      </section>


      {/* ======================================================
          MAIN VALUE SECTION
      ======================================================= */}

      <section className="bg-[#f7f7f7] py-20 md:py-28">

        <div className="max-w-[900px] mx-auto px-6 text-center">

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="
              text-[#555]
              font-normal
              text-[23px]
              md:text-[29px]
            "
          >
            Empowering students and professionals
            <br className="hidden md:block" />
            with the tools they need to excel
            <br className="hidden md:block" />
            in their academic journey.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="
              mt-6
              text-[11px]
              md:text-[12px]
              leading-5
              text-[#777]
              max-w-[670px]
              mx-auto
            "
          >
            At Alveoly, we offer comprehensive learning tools,
            expert-led educational resources, and flexible
            preparation programs designed to help healthcare
            and science students in Ghana achieve their academic
            and professional goals.
          </motion.p>

        </div>

      </section>


      {/* ======================================================
          EDUCATORS / CAREERS FEATURE
      ======================================================= */}

      <section className="bg-[#edf4f7]">

        <div
          className="
            max-w-[1180px]
            mx-auto
            grid
            md:grid-cols-2
          "
        >

          {/* Image */}
          <div className="min-h-[300px] md:min-h-[380px]">

            <img
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1400&q=85"
              alt="Alveoly team collaborating"
              className="
                w-full
                h-full
                object-cover
              "
            />

          </div>


          {/* Dark panel */}
          <div
            className="
              bg-[#17364d]
              text-white
              flex
              items-center
              px-8
              py-12
              md:px-12
            "
          >

            <div className="max-w-[430px]">

              <h2
                className="
                  text-[21px]
                  md:text-[25px]
                  font-normal
                  leading-[1.25]
                "
              >
                Ready to shape the future
                <br className="hidden md:block" />
                of education in Ghana?
              </h2>

              <p
                className="
                  mt-5
                  text-[11px]
                  md:text-[12px]
                  leading-5
                  text-white/75
                "
              >
                Join our passionate team of educators and
                innovators who are dedicated to creating
                meaningful learning experiences for students
                across Ghana and beyond.
              </p>

              <button
                onClick={() => navigate("/careers")}
                className="
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-[#1687df]
                  hover:bg-[#0d76c8]
                  px-6
                  py-2.5
                  text-[11px]
                  font-medium
                  transition-colors
                "
              >
                Join Our Team
                <FaArrowRight className="text-[8px]" />
              </button>

            </div>

          </div>

        </div>
      </section>


      {/* ======================================================
          EXPLORE ALL PRODUCTS
      ======================================================= */}

      <section className="bg-[#0c2234] text-white py-12 md:py-14">

        <div className="max-w-[1050px] mx-auto px-6">

          <div className="text-center mb-9">

            <h2
              className="
                text-[20px]
                md:text-[23px]
                font-normal
              "
            >
              Explore All Alveoly Programs
            </h2>

            <p className="text-[9px] text-white/50 mt-1">
              Select your area of study
            </p>

          </div>


          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-3
              md:grid-cols-5
              gap-x-8
              gap-y-8
            "
          >

            {FOOTER_PRODUCTS.map((column) => (

              <div key={column.title}>

                <h3
                  className="
                    text-[10px]
                    md:text-[11px]
                    font-semibold
                    text-white
                    mb-3
                  "
                >
                  {column.title}
                </h3>

                <div className="space-y-1.5">

                  {column.items.map((item) => (

                    <button
                      key={item}
                      onClick={() => navigate("/programs")}
                      className="
                        block
                        text-left
                        text-[8px]
                        md:text-[9px]
                        text-white/55
                        hover:text-white
                        transition-colors
                      "
                    >
                      {item}
                    </button>

                  ))}

                </div>

              </div>

            ))}

          </div>

        </div>
      </section>


      {/* ======================================================
          FOOTER
      ======================================================= */}

      <Footer />


      {/* ======================================================
          SMART CHAT & WHATSAPP - IMPROVED VISIBILITY
      ======================================================= */}

      {/* WhatsApp Button - Higher z-index with pulse animation */}
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleWhatsAppClick}
        aria-label="Chat with us on WhatsApp"
        className="
          fixed
          bottom-28
          md:bottom-32
          right-5
          z-[9999]
          w-14
          h-14
          rounded-full
          bg-[#25D366]
          text-white
          shadow-2xl
          flex
          items-center
          justify-center
          hover:shadow-[0_0_30px_rgba(37,211,102,0.5)]
          transition-all
          duration-300
        "
      >
        {/* Pulse ring animation */}
        <span className="absolute inset-0 rounded-full animate-ping bg-[#25D366] opacity-75" />
        <span className="absolute inset-0 rounded-full animate-pulse bg-[#25D366] opacity-50" />
        <FaWhatsapp className="text-2xl relative z-10" />
      </motion.button>

      {/* SmartChatBot with proper positioning */}
      <div className="fixed bottom-20 md:bottom-24 right-0 z-[9998]">
        <SmartChatBot
          userId={userInfo.userId}
          userName={userInfo.userName}
        />
      </div>

    </div>
  );
};

export default HomePage;