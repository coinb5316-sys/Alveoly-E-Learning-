import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

import CareerNavbar from "../components/CareerNavbar";
import Footer from "../components/Footer";

// Using Unsplash placeholder images instead of local files
const accountingImg = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80";
const adminImg = "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&q=80";
const animationImg = "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=600&q=80";
const financeImg = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80";
const legalImg = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80";
const medicalImg = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80";
const nursingImg = "https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=600&q=80";
const pharmacyImg = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80";
const salesImg = "https://images.unsplash.com/photo-1552581234-26160f608093?w=600&q=80";
const softwareImg = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80";

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

const departments = [
  {
    title: "Accounting",
    image: accountingImg,
  },
  {
    title: "Admin, HR & Recruiting",
    image: adminImg,
  },
  {
    title: "Animation & Illustration",
    image: animationImg,
  },
  {
    title: "Finance",
    image: financeImg,
  },
  {
    title: "Legal",
    image: legalImg,
  },
  {
    title: "Medical",
    image: medicalImg,
  },
  {
    title: "Nursing",
    image: nursingImg,
  },
  {
    title: "Pharmacy",
    image: pharmacyImg,
  },
  {
    title: "Sales",
    image: salesImg,
  },
  {
    title: "Software Development",
    image: softwareImg,
  },
];

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

const CareerJobs = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const filteredDepartments = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return departments;
    }

    return departments.filter((department) =>
      department.title.toLowerCase().includes(value)
    );
  }, [search]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[#4d4d4d]">
      <CareerNavbar />

      {/* ======================================================
          JOB SEARCH
      ====================================================== */}

      <main className="bg-white">
        <section className="mx-auto max-w-[1100px] px-6 pb-16 pt-32 sm:px-10 sm:pb-20 sm:pt-36 md:pt-40 lg:pt-44">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-center"
          >
            <h1 className="mx-auto max-w-[900px] text-3xl font-light leading-[1.2] tracking-[-0.025em] text-[#555] sm:text-4xl md:text-[42px]">
              Search for the job you've always dreamed of
            </h1>

            {/* Search */}
            <div className="mx-auto mt-10 flex max-w-[500px] items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search jobs"
                  className="h-12 w-full border-0 border-b border-[#555] bg-transparent px-1 pr-3 text-base font-light text-[#444] outline-none placeholder:text-[#999] focus:border-[#258EDB]"
                  placeholder=""
                />
              </div>

              <button
                type="button"
                aria-label="Search jobs"
                className="ml-4 flex h-12 w-12 items-center justify-center text-[#444] transition-colors duration-200 hover:text-[#258EDB]"
              >
                <FaSearch className="text-[24px]" />
              </button>
            </div>
          </motion.div>

          {/* ======================================================
              DEPARTMENT CARDS
          ====================================================== */}

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeUp}
            className="mt-16 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredDepartments.map((department) => (
              <motion.button
                key={department.title}
                type="button"
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="group relative block h-[170px] w-full overflow-hidden bg-gray-100 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-[#258EDB]"
              >
                <img
                  src={department.image}
                  alt={department.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />

                {/* Exact-style dark translucent title strip */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-5 py-4">
                  <span className="block text-center text-lg font-light text-white sm:text-[18px]">
                    {department.title}
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>

          {filteredDepartments.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center"
            >
              <p className="text-lg font-light text-[#666]">
                No departments found.
              </p>
            </motion.div>
          )}
        </section>

        {/* ======================================================
            GENERAL APPLICATION MESSAGE
        ====================================================== */}

        <section className="bg-white">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="mx-auto max-w-[1050px] px-6 pb-24 pt-8 text-center sm:px-10 md:pb-28 lg:pb-32"
          >
            <h2 className="mx-auto max-w-[850px] text-3xl font-light leading-[1.25] tracking-[-0.025em] text-[#555] sm:text-4xl md:text-[42px]">
              We're always looking for the best
              <br />
              even if we're not quite ready for you yet
            </h2>

            <div className="mx-auto mt-8 max-w-[920px] space-y-7 text-base font-light leading-7 text-[#666] sm:text-lg sm:leading-8">
              <p>
                Don't see a position that fits your skillset? Email your
                resume to{" "}
                <a
                  href="mailto:jobs@alveoly.com"
                  className="text-[#258EDB] underline underline-offset-2 transition-colors hover:text-[#167fc9]"
                >
                  Jobs@alveoly.com
                </a>
                . If you're awesome (and of course you are - why else would you
                be here?), then we'll see if there's an opportunity for you
                down the road!
              </p>

              <p>
                Alveoly is growing rapidly, and we update our site regularly
                with new opportunities. Check back soon to see if something
                fits, but in the meantime, give us your info now - we can't
                wait to see what you have to offer.
              </p>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ======================================================
          PRODUCT EXPLORER
      ====================================================== */}

      <section className="bg-[#454545] text-white">
        <div className="mx-auto max-w-[1280px] px-6 py-20 sm:px-10 md:py-24 lg:px-14">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
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

export default CareerJobs;