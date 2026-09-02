// Contact.jsx
import React, { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../api/axios";

import {
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaPaperPlane,
  FaCheckCircle,
} from "react-icons/fa";

const Contact = () => {
  const formRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [expandedFaq, setExpandedFaq] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  /*
  |--------------------------------------------------------------------------
  | FAQ DATA
  |--------------------------------------------------------------------------
  */

  const faqCategories = [
    {
      id: "payment",
      category: "Payment",
      questions: [
        {
          q: "How do I purchase a subscription from the website?",
          a: "Any of our product offerings can be purchased from our website. Payment is due in full at the time of purchase via credit or debit card or via mobile money. You must have an account to make a purchase.",
        },
        {
          q: "What forms of payment do you accept?",
          a: "We accept credit/debit cards with Visa, MasterCard, or American Express logos, mobile money, and bank transfers. After a successful payment, your subscription will immediately be available.",
        },
        {
          q: "Do you offer a Military Discount?",
          a: "We are grateful to our men and women in uniform! We offer a 10% discount on new packages for active duty members and veterans. Please contact us for more information.",
        },
        {
          q: "What is your refund policy?",
          a: "All direct Alveoly purchase refund requests are evaluated case-by-case. The refund amounts determined are final. Please contact our support team for assistance.",
        },
        {
          q: "Can I upgrade or downgrade my subscription purchase?",
          a: "If your subscription purchase has not been activated, you may request to upgrade or downgrade it. Current subscription pricing will apply to all upgrades and downgrades.",
        },
        {
          q: "Do you offer a shorter duration or custom packages?",
          a: "Please contact our support team to discuss available subscription options and current package offerings.",
        },
        {
          q: "Can I get a guest account or a free trial?",
          a: "Please contact our support team for information about available access options and current trial offers.",
        },
        {
          q: "Can I purchase a subscription as a gift?",
          a: "Please contact our support team for assistance with subscription purchases intended as gifts.",
        },
      ],
    },

    {
      id: "subscriptions",
      category: "Subscriptions",
      questions: [
        {
          q: "How do I activate and/or access my subscription?",
          a: "Log in to your account, click on the 'Activate' button associated with the subscription you wish to start. If already activated, click on the 'Launch' button.",
        },
        {
          q: "I forgot my username/password; how can I retrieve it?",
          a: "If you have forgotten your password, please use the 'Forgot Password?' link on the login page to reset your password. You may be required to answer a security question.",
        },
        {
          q: "How can I change my registered email address and password?",
          a: "You may update your registered email address by signing in, clicking on the Profile tab, and entering your desired email address. A verification email will be sent to confirm the change.",
        },
        {
          q: "How can I renew/extend my subscription?",
          a: "You can renew your subscription by logging into your account and clicking the 'Renew' button. A renewal is an extension of time to continue accessing an active subscription.",
        },
        {
          q: "When does a new purchase/renewal begin?",
          a: "All new subscriptions go into effect from when they are activated, not at the time of purchase. Renewal purchases are effective from the existing expiration date.",
        },
      ],
    },

    {
      id: "content",
      category: "Content",
      questions: [
        {
          q: "I want to reset/delete my qbank test history (or) start all over again. Is this possible?",
          a: "We offer a one-time reset option for subscriptions active for 180 days or more. Once a reset has been used, a subscription cannot be reset again, regardless of the duration remaining on the subscription or the purchase of additional renewals.",
        },
        {
          q: "How do I reuse questions with no reset option available (to avoid repetition)?",
          a: "We recommend using Marked Question Mode to redo specific questions and ensure no duplicates in future generated test blocks. To mark a question, click the flag icon during testing or review.",
        },
        {
          q: "Can I save my subscription content to my hard disk or print the material?",
          a: "Printing, saving, copying, screen capture, etc., of Alveoly materials is strictly prohibited. Attempts to use system commands or third-party utilities to capture our content is copyright infringement.",
        },
      ],
    },

    {
      id: "technical",
      category: "Technical",
      questions: [
        {
          q: "What are the system/device/network requirements?",
          a: "Alveoly products are compatible with most recent Windows and Mac laptop or desktop systems. We also offer mobile applications compatible with recent Android and iOS devices.",
        },
        {
          q: "How do I access my purchased subscription?",
          a: "All Alveoly subscriptions require an active internet connection. Sign in to your account and click the 'Activate' or 'Launch' button beside your subscription.",
        },
        {
          q: "Can I access my subscriptions on a mobile device?",
          a: "Yes! Access to QBank and Self-Assessment subscriptions is offered through our companion application for Android and iOS devices for convenient on-the-go access.",
        },
        {
          q: "Why are the images/media in the questions not loading?",
          a: "Please check your internet connection and refresh the application. If the issue continues, contact our support team.",
        },
        {
          q: "How do I ensure I am viewing the latest version of the web app? (Clear browser cache)",
          a: "To ensure you are viewing the latest version, please clear your browser cache. You can do this by pressing Ctrl-Shift-Delete on Windows or Command-Shift-Delete on Mac and selecting 'Clear browsing data'.",
        },
        {
          q: "How can I delete a test block?",
          a: "Open your test history and select the test block you would like to remove. If you are unable to delete it, contact our support team.",
        },
        {
          q: "Why did I receive an incompatible process/application or screenshot warning message?",
          a: "This warning can appear when unsupported applications or screen-capture processes are detected while using protected content.",
        },
      ],
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const getAllQuestions = () => {
    return faqCategories.flatMap((category) =>
      category.questions.map((question) => ({
        ...question,
        category: category.category,
        categoryId: category.id,
      }))
    );
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;

    setSearchQuery(value);

    if (!value.trim()) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const results = getAllQuestions()
      .filter((item) =>
        `${item.q} ${item.a}`
          .toLowerCase()
          .includes(value.toLowerCase())
      )
      .slice(0, 5);

    setSearchSuggestions(results);
    setShowSuggestions(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const query = searchQuery.trim().toLowerCase();

    if (!query) return;

    const match = getAllQuestions().find((item) =>
      `${item.q} ${item.a}`.toLowerCase().includes(query)
    );

    if (match) {
      openQuestion(match);
    }
  };

  const openQuestion = (question) => {
    const categoryIndex = faqCategories.findIndex(
      (category) => category.id === question.categoryId
    );

    const questionIndex = faqCategories[
      categoryIndex
    ].questions.findIndex((item) => item.q === question.q);

    setExpandedFaq(`${categoryIndex}-${questionIndex}`);
    setShowSuggestions(false);

    setTimeout(() => {
      const categoryElement = document.getElementById(question.categoryId);

      if (categoryElement) {
        categoryElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  /*
  |--------------------------------------------------------------------------
  | FAQ
  |--------------------------------------------------------------------------
  */

  const toggleFaq = (id) => {
    setExpandedFaq((current) => (current === id ? null : id));
  };

  /*
  |--------------------------------------------------------------------------
  | CONTACT FORM
  |--------------------------------------------------------------------------
  */

  const handleChange = (e) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setSubmitSuccess(false);

    try {
      await API.post("/messages", formData);

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setSubmitSuccess(true);

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setTimeout(() => {
        setSubmitSuccess(false);
        setIsModalOpen(false);
      }, 2500);
    } catch (err) {
      console.error("Error sending message:", err);

      alert(
        err.response?.data?.message ||
          "Failed to send message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE SEARCH SUGGESTIONS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".contact-search")) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FILTERED FAQS
  |--------------------------------------------------------------------------
  */

  const filteredFaqs = searchQuery.trim()
    ? faqCategories
        .map((category) => ({
          ...category,
          questions: category.questions.filter((question) =>
            `${question.q} ${question.a}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((category) => category.questions.length > 0)
    : faqCategories;

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-white overflow-x-hidden text-[#3f3f46]">
      <Navbar />

      {/* ================================================================
          HERO
      ================================================================ */}

      <section className="bg-[#f4f4f6] min-h-[650px] flex items-center">
        <div className="w-full max-w-[960px] mx-auto px-5 sm:px-8 text-center pt-20 pb-24">

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="
              text-[40px]
              sm:text-[48px]
              md:text-[54px]
              font-light
              tracking-[-1.5px]
              text-[#4a4a4a]
              mb-8
            "
          >
            Hi there, how can we help?
          </motion.h1>

          {/* Search */}
          <div className="contact-search relative max-w-[605px] mx-auto">

            <form
              onSubmit={handleSearchSubmit}
              className="flex h-[48px] bg-white shadow-sm"
            >
              <div className="relative flex-1">
                <FaSearch
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-[#9acbe8]
                    text-[17px]
                  "
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() =>
                    searchQuery && setShowSuggestions(true)
                  }
                  placeholder="Ask a question..."
                  className="
                    w-full
                    h-full
                    pl-11
                    pr-4
                    bg-white
                    border-0
                    outline-none
                    text-[16px]
                    text-[#555]
                    placeholder:text-[#c8c8c8]
                  "
                />
              </div>

              <button
                type="submit"
                className="
                  w-[76px]
                  bg-[#1689df]
                  hover:bg-[#087aca]
                  text-white
                  text-[14px]
                  font-medium
                  transition-colors
                "
              >
                Search
              </button>
            </form>

            {/* Search Suggestions */}
            <AnimatePresence>
              {showSuggestions && searchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="
                    absolute
                    left-0
                    right-0
                    top-[54px]
                    z-40
                    bg-white
                    border
                    border-gray-200
                    shadow-xl
                    text-left
                  "
                >
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => openQuestion(suggestion)}
                      className="
                        w-full
                        px-5
                        py-3
                        text-left
                        border-b
                        border-gray-100
                        last:border-0
                        hover:bg-[#f7faff]
                        transition-colors
                      "
                    >
                      <div className="flex items-start gap-3">
                        <FaSearch className="mt-1 text-[#1689df] text-xs" />

                        <div>
                          <p className="text-sm text-[#444]">
                            {suggestion.q}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {suggestion.category}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-7 text-[16px] sm:text-[17px] text-[#777]">
            Choose a category to quickly find what you need or{" "}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="
                text-[#1689df]
                hover:text-[#087aca]
                transition-colors
              "
            >
              contact us
            </button>
          </p>

        </div>
      </section>

      {/* ================================================================
          FAQ SECTION
      ================================================================ */}

      <main className="bg-white">

        {filteredFaqs.map((category, categoryIndex) => (
          <section
            key={category.id}
            id={category.id}
            className="
              max-w-[960px]
              mx-auto
              px-5
              sm:px-8
              pt-16
              pb-6
              scroll-mt-24
            "
          >

            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="
                text-center
                text-[30px]
                sm:text-[32px]
                font-light
                text-[#4d4d4d]
                mb-9
              "
            >
              {category.category}
            </motion.h2>

            <div className="max-w-[560px] mx-auto">

              {category.questions.map((faq, questionIndex) => {
                const faqId = `${categoryIndex}-${questionIndex}`;
                const isOpen = expandedFaq === faqId;

                return (
                  <div
                    key={faq.q}
                    className="border-b border-[#b9d8e8]"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faqId)}
                      className="
                        w-full
                        min-h-[62px]
                        py-4
                        flex
                        items-center
                        justify-between
                        gap-5
                        text-left
                        group
                      "
                    >
                      <span
                        className="
                          text-[16px]
                          sm:text-[17px]
                          leading-[1.45]
                          text-[#505050]
                          group-hover:text-[#1689df]
                          transition-colors
                        "
                      >
                        {faq.q}
                      </span>

                      <span className="flex-shrink-0 text-[#1689df]">
                        {isOpen ? (
                          <FaChevronUp className="text-[13px]" />
                        ) : (
                          <span className="text-[22px] font-light leading-none">
                            +
                          </span>
                        )}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{
                            height: 0,
                            opacity: 0,
                          }}
                          animate={{
                            height: "auto",
                            opacity: 1,
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                          }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pb-5 pr-8 text-[15px] leading-7 text-[#777]">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

            </div>
          </section>
        ))}

        {/* No search results */}
        {filteredFaqs.length === 0 && (
          <section className="max-w-[960px] mx-auto px-5 py-24 text-center">
            <h2 className="text-2xl font-light text-[#555]">
              No results found
            </h2>

            <p className="mt-3 text-gray-500">
              Try searching with different keywords.
            </p>
          </section>
        )}

      </main>

      {/* ================================================================
          ADDRESS & HOURS
      ================================================================ */}

      <section className="bg-white pt-20 pb-24">
        <div className="max-w-[760px] mx-auto px-5 sm:px-8">

          <h2
            className="
              text-center
              text-[30px]
              sm:text-[32px]
              font-light
              text-[#555]
              mb-12
            "
          >
            Address &amp; Hours of Operation
          </h2>

          <div className="grid md:grid-cols-2 gap-10 md:gap-20">

            {/* Address */}
            <div className="text-[#666] text-[16px] leading-6">
              <p>Alveoly E-Learning Academy</p>
              <p>Accra, Ghana</p>
            </div>

            {/* Hours */}
            <div className="text-[#666] text-[16px] leading-6">
              <p>Monday-Friday</p>
              <p>9 AM to 6 PM GMT</p>

              <p className="mt-6">
                Phone: +233 54 955 6116
              </p>

              <p className="mt-1">
                Fax: +233 54 955 6116
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================
          CONTACT CTA
      ================================================================ */}

      <section
        className="
          bg-[#1689df]
          min-h-[430px]
          flex
          items-center
          justify-center
          text-center
          px-5
        "
      >
        <div className="max-w-[720px]">

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="
              text-white
              text-[30px]
              sm:text-[34px]
              font-light
              mb-7
            "
          >
            Can't find what you are looking for?
          </motion.h2>

          <p
            className="
              text-white
              text-[16px]
              sm:text-[17px]
              leading-7
              max-w-[620px]
              mx-auto
              mb-10
            "
          >
            If you can't find the answers to the questions you are
            looking for, simply message us and we will respond back
            to you promptly.
          </p>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="
              bg-white
              text-[#2775a8]
              px-10
              py-3
              rounded-full
              text-[17px]
              shadow-md
              hover:shadow-lg
              hover:-translate-y-[1px]
              transition-all
            "
          >
            Contact Us
          </button>

        </div>
      </section>

      {/* ================================================================
          PRODUCT EXPLORER
      ================================================================ */}

      <section className="bg-[#071522] text-white py-16">

        <div className="max-w-[1100px] mx-auto px-6">

          <div className="text-center mb-14">

            <h2 className="text-[29px] sm:text-[32px] font-light">
              Explore All Alveoly Products
            </h2>

            <p className="text-gray-300 mt-3 text-[15px]">
              Choose your exam
            </p>

          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-10">

            {/* Accounting */}
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

            {/* High School */}
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

            {/* Finance */}
            <ProductColumn
              title="Finance"
              items={[
                "CFA®",
                "CMT®",
                "Blog",
                "Grad School",
                "MCAT®",
                "Blog",
              ]}
            />

            {/* Legal */}
            <ProductColumn
              title="Legal"
              items={[
                "Bar Review",
                "MBE®",
                "LLM",
                "MPT®",
                "Legal Curriculum",
                "JD-Next",
                "Blog",
              ]}
            />

            {/* Medical */}
            <ProductColumn
              title="Medical"
              items={[
                "USMLE® Step 1",
                "USMLE Step 2 CK",
                "USMLE Step 2 CS",
                "USMLE Step 3",
                "COMLEX® Level 1",
                "COMLEX Level 2",
                "Internal Medicine",
                "Family Medicine",
                "International Clinical QBank",
                "Medical Library",
                "PA (PANCE® / PANRE®)",
                "Blog",
              ]}
            />

            {/* Nursing / Pharmacy */}
            <div>
              <h3 className="text-[18px] font-semibold mb-5">
                Nursing
              </h3>

              <ProductItems
                items={[
                  "NCLEX RN®",
                  "NCLEX PN®",
                  "Clinical Med Math",
                  "FNP",
                  "Blog",
                ]}
              />

              <h3 className="text-[18px] font-semibold mt-8 mb-5">
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
      </section>

      {/* ================================================================
          CONTACT MODAL
      ================================================================ */}

      <AnimatePresence>
        {isModalOpen && (
          <div
            className="
              fixed
              inset-0
              z-[100]
              bg-black/50
              flex
              items-center
              justify-center
              p-4
            "
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setIsModalOpen(false);
              }
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.97,
              }}
              transition={{ duration: 0.2 }}
              className="
                bg-white
                w-full
                max-w-[520px]
                max-h-[90vh]
                overflow-y-auto
                shadow-2xl
              "
            >

              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">

                <h2 className="text-[24px] font-light text-[#444]">
                  Contact Us
                </h2>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="
                    text-gray-400
                    hover:text-gray-700
                    p-2
                    transition-colors
                  "
                >
                  <FaTimes />
                </button>

              </div>

              <div className="px-6 py-6">

                {submitSuccess && (
                  <div
                    className="
                      mb-5
                      p-4
                      bg-green-50
                      border
                      border-green-200
                      flex
                      gap-3
                      items-start
                    "
                  >
                    <FaCheckCircle className="text-green-500 mt-1" />

                    <div>
                      <p className="font-medium text-green-700">
                        Message Sent Successfully!
                      </p>

                      <p className="text-sm text-green-600 mt-1">
                        We'll get back to you within 24 hours.
                      </p>
                    </div>
                  </div>
                )}

                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  <FormField
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />

                  <FormField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                  />

                  <FormField
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                  />

                  <div>
                    <label className="block text-sm text-[#555] mb-2">
                      Message
                    </label>

                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      required
                      placeholder="Type your message here..."
                      className="
                        w-full
                        border
                        border-gray-300
                        px-4
                        py-3
                        outline-none
                        resize-none
                        focus:border-[#1689df]
                        transition-colors
                      "
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      w-full
                      bg-[#1689df]
                      hover:bg-[#087aca]
                      disabled:opacity-60
                      text-white
                      py-3
                      flex
                      items-center
                      justify-center
                      gap-2
                      transition-colors
                    "
                  >
                    {loading ? (
                      <>
                        <span
                          className="
                            w-4
                            h-4
                            border-2
                            border-white/40
                            border-t-white
                            rounded-full
                            animate-spin
                          "
                        />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Send Message
                      </>
                    )}
                  </button>

                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| SMALL REUSABLE COMPONENTS
|--------------------------------------------------------------------------
*/

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
      <button
        key={`${item}-${index}`}
        type="button"
        className="
          block
          text-left
          text-[13px]
          text-gray-300
          hover:text-white
          transition-colors
        "
      >
        {item}
      </button>
    ))}
  </div>
);

const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
}) => (
  <div>
    <label className="block text-sm text-[#555] mb-2">
      {label}
    </label>

    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className="
        w-full
        border
        border-gray-300
        px-4
        py-3
        outline-none
        focus:border-[#1689df]
        transition-colors
      "
    />
  </div>
);

export default Contact;