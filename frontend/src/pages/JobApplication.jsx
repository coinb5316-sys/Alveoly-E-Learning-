import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaCloudUploadAlt,
  FaBolt,
  FaChevronDown,
  FaTrashAlt,
  FaQuestionCircle,
  FaExternalLinkAlt,
  FaShareAlt,
  FaLink,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaEnvelope,
} from "react-icons/fa";

import CareerNavbar from "../components/CareerNavbar";
import Footer from "../components/Footer";

const JobApplication = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const resumeInputRef = useRef(null);

  const state = location.state || {};

  const jobTitle = state.jobTitle || "Career Opportunity";
  const jobLocation = state.jobLocation || "Alveoly";
  const jobDescription = state.jobDescription || "";
  const openings = state.openings || 1;

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    coverLetter: "",
    salaryExpectation: "",

    isCPA: "",
    requiresSponsorship: "",
    willingToRelocate: "",
    referralName: "",
  });

  const [resume, setResume] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("application");
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRadioChoice = (name, value) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      validateAndSetResume(file);
    }
  };

  const validateAndSetResume = (file) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/rtf",
    ];

    const allowedExtensions = [".pdf", ".doc", ".docx", ".rtf"];

    const fileName = file.name.toLowerCase();

    const validExtension = allowedExtensions.some((extension) =>
      fileName.endsWith(extension)
    );

    const validType = allowedTypes.includes(file.type);

    if (!validExtension && !validType) {
      alert("Please upload a PDF, DOC, DOCX, or RTF file.");
      return;
    }

    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      alert("Resume must be smaller than 10 MB.");
      return;
    }

    setResume(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      validateAndSetResume(file);
    }
  };

  const clearResume = () => {
    setResume(null);

    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }
  };

  const clearPersonalInformation = () => {
    setForm((previous) => ({
      ...previous,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
    }));
  };

  const clearProfile = () => {
    setResume(null);

    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }
  };

  const clearDetails = () => {
    setForm((previous) => ({
      ...previous,
      coverLetter: "",
      salaryExpectation: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resume) {
      alert("Please upload your resume.");
      return;
    }

    if (!form.isCPA) {
      alert("Please answer whether you are a Certified Public Accountant.");
      return;
    }

    if (!form.salaryExpectation) {
      alert("Please provide your salary expectations.");
      return;
    }

    if (!form.requiresSponsorship) {
      alert("Please answer the sponsorship question.");
      return;
    }

    if (!form.willingToRelocate) {
      alert("Please answer whether you are willing to relocate.");
      return;
    }

    setSubmitting(true);

    /*
      FRONTEND SUBMISSION FOR NOW

      Later, replace this with your Axios API request, for example:

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      formData.append("resume", resume);
      formData.append("jobTitle", jobTitle);
      formData.append("jobLocation", jobLocation);

      await axios.post("/job-applications", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    */

    await new Promise((resolve) => setTimeout(resolve, 700));

    setSubmitting(false);
    setSubmitted(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this job opportunity: ${jobTitle} at Alveoly`;

    switch (platform) {
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
        break;
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent(`Job Opportunity: ${jobTitle}`)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
          alert("Link copied to clipboard!");
        }).catch(() => {
          // Fallback
          prompt("Copy this link:", `${text}\n${url}`);
        });
        break;
      default:
        break;
    }
    setShowShareMenu(false);
  };

  /*
   * ============================================================
   * SUCCESS SCREEN
   * ============================================================
   */

  if (submitted) {
    return (
      <div className="min-h-screen bg-white text-[#3f3f3f]">
        <CareerNavbar />

        <main className="flex min-h-[70vh] items-center justify-center px-5 py-24">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[650px] text-center"
          >
            <FaCheckCircle className="mx-auto text-[64px] text-[#0c6175]" />

            <h1 className="mt-7 text-3xl font-normal text-[#333] sm:text-4xl">
              Application Submitted
            </h1>

            <p className="mx-auto mt-5 max-w-[560px] text-[16px] leading-7 text-[#666]">
              Thank you for applying for the{" "}
              <strong className="font-medium text-[#333]">
                {jobTitle}
              </strong>{" "}
              position at Alveoly.
            </p>

            <p className="mt-3 text-[15px] leading-7 text-[#777]">
              Our team will review your application and contact you if your
              experience matches our current needs.
            </p>

            <button
              type="button"
              onClick={() => navigate("/careers/jobs")}
              className="mt-9 bg-[#0c6175] px-9 py-3 text-sm font-semibold text-white transition hover:bg-[#084e5f]"
            >
              Back to Jobs
            </button>
          </motion.div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f7f3] text-[#3f3f3f]">
      <CareerNavbar />

      {/* ============================================================
          JOB HEADER
      ============================================================ */}

      <header className="bg-white">
        <div className="mx-auto max-w-[940px] px-5 pb-7 pt-28 text-center sm:px-8 sm:pt-32">
          <div className="mb-5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm text-[#0c6175] transition hover:text-[#084e5f]"
            >
              <FaArrowLeft />
              Back
            </button>

            {/* Share Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="inline-flex items-center gap-2 text-sm text-[#0c6175] transition hover:text-[#084e5f]"
              >
                <FaShareAlt />
                Share Job
              </button>

              {showShareMenu && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[200px] overflow-hidden rounded-md border border-[#ddd] bg-white shadow-lg">
                  <button
                    onClick={() => handleShare("linkedin")}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#444] transition hover:bg-[#f3f7f8]"
                  >
                    <FaLinkedin className="text-[#0077B5]" />
                    LinkedIn
                  </button>
                  <button
                    onClick={() => handleShare("twitter")}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#444] transition hover:bg-[#f3f7f8]"
                  >
                    <FaTwitter className="text-[#1DA1F2]" />
                    Twitter
                  </button>
                  <button
                    onClick={() => handleShare("facebook")}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#444] transition hover:bg-[#f3f7f8]"
                  >
                    <FaFacebook className="text-[#1877F2]" />
                    Facebook
                  </button>
                  <button
                    onClick={() => handleShare("email")}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#444] transition hover:bg-[#f3f7f8]"
                  >
                    <FaEnvelope className="text-[#666]" />
                    Email
                  </button>
                  <button
                    onClick={() => handleShare("copy")}
                    className="flex w-full items-center gap-3 border-t border-[#eee] px-4 py-2.5 text-left text-sm text-[#444] transition hover:bg-[#f3f7f8]"
                  >
                    <FaLink className="text-[#666]" />
                    Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Replace this with your actual Alveoly logo if needed */}
          <div className="mx-auto mb-5 flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#0c6175] text-2xl font-bold text-white">
            A
          </div>

          <h1 className="text-[24px] font-semibold leading-tight text-[#292929] sm:text-[28px]">
            {jobTitle}
          </h1>

          <p className="mt-3 text-[14px] text-[#555]">
            On-site · Full time · Careers
          </p>

          <p className="mt-2 text-[14px] text-[#666]">{jobLocation}</p>
        </div>
      </header>

      {/* ============================================================
          STICKY TABS
      ============================================================ */}

      <div className="sticky top-0 z-40 border-y border-[#e5e5e5] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex max-w-[940px] justify-center">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`relative px-6 py-4 text-[12px] font-medium uppercase tracking-wide transition ${
              activeTab === "overview"
                ? "text-[#0c6175] font-semibold"
                : "text-[#666] hover:text-[#0c6175]"
            }`}
          >
            Overview
            {activeTab === "overview" && (
              <span className="absolute bottom-0 left-1/2 h-[3px] w-[78px] -translate-x-1/2 bg-[#0c6175]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("application")}
            className={`relative px-6 py-4 text-[12px] font-medium uppercase tracking-wide transition ${
              activeTab === "application"
                ? "text-[#0c6175] font-semibold"
                : "text-[#666] hover:text-[#0c6175]"
            }`}
          >
            Application
            {activeTab === "application" && (
              <span className="absolute bottom-0 left-1/2 h-[3px] w-[78px] -translate-x-1/2 bg-[#0c6175]" />
            )}
          </button>
        </div>
      </div>

      {/* ============================================================
          TAB CONTENT
      ============================================================ */}

      <main className="mx-auto w-full max-w-[940px] px-5 pb-16 sm:px-8">
        {activeTab === "overview" ? (
          /* ========================================================
             OVERVIEW TAB
          ======================================================== */
          <div className="mt-8">
            <div className="rounded-[7px] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#333] mb-4">
                Job Description
              </h2>
              
              <div className="prose max-w-none text-[#555]">
                <p className="text-[15px] leading-7">
                  Looking to do something more creative with your career? Want to be part of a dream team of educators and innovators? Come join Alveoly and be part of something extraordinary.
                </p>

                <h3 className="text-[16px] font-semibold text-[#333] mt-6 mb-3">
                  Requirements
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-[14px] leading-6">
                  <li>Degree in accounting or taxation</li>
                  <li>CPA certification required</li>
                  <li>CIA or CMA certifications welcome</li>
                  <li>3+ years of experience in accounting or auditing</li>
                  <li>Subject matter expertise in Audit, Taxation, Risk Management, Financial Accounting, Managerial Accounting, or IT Audit</li>
                  <li>Experience in tutoring, teaching, or corporate learning and development is a plus</li>
                </ul>

                <h3 className="text-[16px] font-semibold text-[#333] mt-6 mb-3">
                  Responsibilities
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-[14px] leading-6">
                  <li>Project development, planning, and execution for question banks, textbooks, and videos</li>
                  <li>Create practice questions, answers, and explanations for the question bank</li>
                  <li>Develop, review, and update course review textbooks</li>
                  <li>Write scripts for video lecture materials</li>
                  <li>Validate accuracy and relevance of content</li>
                  <li>Work with a team of experts to identify topics for new product development</li>
                </ul>

                <h3 className="text-[16px] font-semibold text-[#333] mt-6 mb-3">
                  Benefits
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-[14px] leading-6">
                  <li>Competitive compensation (contingent on experience)</li>
                  <li>Paid time off, parental leave, and volunteer time</li>
                  <li>Comprehensive benefits package (medical, vision, dental, life, disability)</li>
                  <li>401(k) plan with employer matching</li>
                  <li>Annual professional and career development opportunities</li>
                  <li>Relaxed work environment with remote flexibility</li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-[#e5e5e5] text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab("application")}
                  className="bg-[#0c6175] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#084e5f]"
                >
                  Start Your Application
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             APPLICATION TAB
          ======================================================== */
          <form onSubmit={handleSubmit}>
            {/* ========================================================
                AUTOFILL
            ======================================================== */}

            <section className="mt-8 rounded-[7px] border border-[#777] bg-white px-5 py-6 sm:px-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FaBolt className="text-[15px] text-[#333]" />

                    <h2 className="text-[13px] font-bold uppercase tracking-wide text-[#333]">
                      Autofill application
                    </h2>
                  </div>

                  <p className="mt-2 max-w-[400px] text-[13px] leading-5 text-[#777]">
                    Save time by importing your resume in one of the following
                    formats: .pdf, .doc, .docx, .odt, or .rtf.
                  </p>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowImportMenu((previous) => !previous)}
                    className="flex min-w-[245px] items-center justify-center gap-3 rounded-[7px] bg-[#0c6175] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#084e5f]"
                  >
                    Import resume from
                    <FaChevronDown
                      className={`text-[11px] transition-transform ${
                        showImportMenu ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showImportMenu && (
                    <div className="absolute right-0 top-[calc(100%+7px)] z-50 w-full min-w-[245px] overflow-hidden rounded-md border border-[#ddd] bg-white shadow-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setShowImportMenu(false);
                          resumeInputRef.current?.click();
                        }}
                        className="block w-full px-4 py-3 text-left text-sm text-[#444] transition hover:bg-[#f3f7f8]"
                      >
                        Upload resume from computer
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowImportMenu(false)}
                        className="block w-full border-t border-[#eee] px-4 py-3 text-left text-sm text-[#888]"
                      >
                        Import from another service
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ========================================================
                REQUIRED FIELDS
            ======================================================== */}

            <div className="mt-8 text-[12px] text-[#777]">
              <span className="text-[#b44b4b]">*</span> Required fields
            </div>

            {/* ========================================================
                PERSONAL INFORMATION
            ======================================================== */}

            <section className="mt-5">
              <SectionHeading
                title="Personal information"
                onClear={clearPersonalInformation}
              />

              <div className="mt-7 space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Input
                    label="First name"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="Last name"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />

                <div>
                  <FieldLabel required>Phone</FieldLabel>

                  <div className="mt-2 flex h-[40px] w-full overflow-hidden rounded-[6px] border border-[#b9b9b9] bg-white">
                    <div className="flex w-[105px] shrink-0 items-center justify-center gap-2 border-r border-[#d2d2d2] bg-[#fafafa] text-sm text-[#555]">
                      <span>🇬🇭</span>
                      <span>+233</span>
                      <FaChevronDown className="ml-1 text-[9px] text-[#888]" />
                    </div>

                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      className="min-w-0 flex-1 border-0 bg-white px-4 text-sm text-[#444] outline-none"
                    />
                  </div>

                  <p className="mt-1.5 text-[12px] text-[#777]">
                    The hiring team may use this number to contact you about this
                    job.
                  </p>
                </div>

                <Input
                  label="Address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  helper="Include your city, region, and country, so that employers can easily manage your application."
                />
              </div>
            </section>

            {/* ========================================================
                PROFILE
            ======================================================== */}

            <section className="mt-12">
              <SectionHeading title="Profile" onClear={clearProfile} />

              <div className="mt-7">
                <FieldLabel required info>
                  Resume
                </FieldLabel>

                <div
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={handleDrop}
                  onClick={() => resumeInputRef.current?.click()}
                  className={`mt-2 flex min-h-[118px] cursor-pointer flex-col items-center justify-center rounded-[6px] border border-dashed px-5 text-center transition ${
                    isDragging
                      ? "border-[#0c6175] bg-[#edf8fa]"
                      : "border-[#999] bg-white hover:border-[#0c6175] hover:bg-[#fbffff]"
                  }`}
                >
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.rtf"
                    onChange={handleResumeChange}
                    className="hidden"
                  />

                  {resume ? (
                    <>
                      <FaCheckCircle className="text-[28px] text-[#0c6175]" />

                      <p className="mt-2 max-w-full truncate text-sm font-medium text-[#444]">
                        {resume.name}
                      </p>

                      <p className="mt-1 text-xs text-[#888]">
                        {(resume.size / 1024 / 1024).toFixed(2)} MB
                      </p>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearResume();
                        }}
                        className="mt-2 text-xs font-medium text-[#b34d4d] hover:underline"
                      >
                        Remove file
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#effbfc]">
                        <FaCloudUploadAlt className="text-[25px] text-[#0c6175]" />
                      </div>

                      <p className="mt-3 text-[13px] text-[#445]">
                        <span className="font-medium">Choose file</span>{" "}
                        or drag and drop here
                      </p>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* ========================================================
                DETAILS
            ======================================================== */}

            <section className="mt-12">
              <SectionHeading title="Details" onClear={clearDetails} />

              <div className="mt-7">
                <label className="block text-[13px] font-semibold text-[#444]">
                  Cover letter{" "}
                  <span className="font-normal text-[#777]">(Optional)</span>
                </label>

                <textarea
                  name="coverLetter"
                  value={form.coverLetter}
                  onChange={handleChange}
                  rows={6}
                  className="mt-2 w-full resize-y rounded-[6px] border border-[#b9b9b9] bg-white px-4 py-3 text-sm leading-6 text-[#444] outline-none transition focus:border-[#0c6175]"
                />
              </div>
            </section>

            {/* ========================================================
                CPA QUESTION
            ======================================================== */}

            <Question
              required
              question="Are you a Certified Public Accountant?"
              value={form.isCPA}
              onChange={(value) => handleRadioChoice("isCPA", value)}
            />

            {/* ========================================================
                SALARY EXPECTATIONS - NEW FIELD
            ======================================================== */}

            <section className="mt-8">
              <FieldLabel required>
                What are your salary expectations? Please provide a number or range.
              </FieldLabel>

              <input
                type="text"
                name="salaryExpectation"
                value={form.salaryExpectation}
                onChange={handleChange}
                required
                placeholder="e.g., GHS 5,000 - GHS 8,000 per month"
                className="mt-2 h-[40px] w-full rounded-[6px] border border-[#b9b9b9] bg-white px-4 text-sm text-[#444] outline-none transition focus:border-[#0c6175]"
              />

              <p className="mt-1.5 text-[12px] text-[#777]">
                Please provide your expected salary range in Ghana Cedis (GHS) or your home currency.
              </p>
            </section>

            {/* ========================================================
                SPONSORSHIP
            ======================================================== */}

            <Question
              required
              question={`Will you now, or in the future require Alveoly to commence ("sponsor") an immigration case in order to employ you? (For example, H-1B or other employment-based immigration case.)`}
              value={form.requiresSponsorship}
              onChange={(value) =>
                handleRadioChoice("requiresSponsorship", value)
              }
            />

            {/* ========================================================
                RELOCATION
            ======================================================== */}

            <Question
              required
              question={`This is a full-time, on-site opportunity. If you are not currently in the area, are you open to relocating?`}
              value={form.willingToRelocate}
              onChange={(value) =>
                handleRadioChoice("willingToRelocate", value)
              }
            />

            {/* ========================================================
                REFERRAL
            ======================================================== */}

            <section className="mt-8">
              <FieldLabel required>
                Were you referred to apply by anyone? If so, please provide the
                referrer's name
              </FieldLabel>

              <input
                type="text"
                name="referralName"
                value={form.referralName}
                onChange={handleChange}
                required
                className="mt-2 h-[40px] w-full rounded-[6px] border border-[#b9b9b9] bg-white px-4 text-sm text-[#444] outline-none transition focus:border-[#0c6175]"
              />
            </section>

            {/* ========================================================
                SUBMIT
            ======================================================== */}

            <section className="pb-12 pt-10">
              <button
                type="submit"
                disabled={submitting}
                className="flex h-[42px] w-full items-center justify-center rounded-[6px] bg-[#0c6175] text-[13px] font-semibold text-white transition hover:bg-[#084e5f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting application..." : "Submit application"}
              </button>
            </section>
          </form>
        )}
      </main>

      {/* ============================================================
          FOOTER DISCLAIMER
      ============================================================ */}

      <div className="border-t border-[#e2e2e2] bg-white px-5 py-6">
        <p className="mx-auto max-w-[600px] text-center text-[11px] leading-5 text-[#777]">
          Alveoly does not discriminate on the basis of race, sex, color,
          religion, age, national origin, marital status, disability, veteran
          status, genetic information, sexual orientation, gender identity or
          any other reason prohibited by law in provision of employment
          opportunities and benefits.
        </p>
      </div>

      <Footer />
    </div>
  );
};

/* =============================================================
   SECTION HEADING COMPONENT
============================================================= */

const SectionHeading = ({ title, onClear }) => {
  return (
    <div className="flex items-center justify-between border-b border-[#e2e2e2] pb-2">
      <h3 className="text-[15px] font-bold text-[#333] uppercase tracking-wide">
        {title}
      </h3>

      <button
        type="button"
        onClick={onClear}
        className="flex items-center gap-1.5 text-[12px] text-[#888] transition hover:text-[#444]"
      >
        <FaTrashAlt className="text-[11px]" />
        Clear
      </button>
    </div>
  );
};

/* =============================================================
   INPUT COMPONENT
============================================================= */

const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  helper = null,
}) => {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-2 h-[40px] w-full rounded-[6px] border border-[#b9b9b9] bg-white px-4 text-sm text-[#444] outline-none transition focus:border-[#0c6175]"
      />

      {helper && <p className="mt-1.5 text-[12px] text-[#777]">{helper}</p>}
    </div>
  );
};

/* =============================================================
   FIELD LABEL COMPONENT
============================================================= */

const FieldLabel = ({ children, required = false, info = false }) => {
  return (
    <label className="block text-[13px] font-semibold text-[#444]">
      {children}
      {required && <span className="ml-0.5 text-[#b44b4b]">*</span>}
      {info && (
        <span className="ml-1.5 inline-flex cursor-help items-center text-[#777]">
          <FaQuestionCircle className="text-[12px]" />
        </span>
      )}
    </label>
  );
};

/* =============================================================
   QUESTION COMPONENT
============================================================= */

const Question = ({ question, value, onChange, required = false }) => {
  return (
    <section className="mt-8">
      <FieldLabel required={required}>{question}</FieldLabel>

      <div className="mt-3 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => onChange("Yes")}
          className={`px-5 py-2.5 text-[13px] font-medium rounded-[6px] transition ${
            value === "Yes"
              ? "bg-[#0c6175] text-white"
              : "bg-white border border-[#b9b9b9] text-[#555] hover:border-[#0c6175]"
          }`}
        >
          Yes
        </button>

        <button
          type="button"
          onClick={() => onChange("No")}
          className={`px-5 py-2.5 text-[13px] font-medium rounded-[6px] transition ${
            value === "No"
              ? "bg-[#0c6175] text-white"
              : "bg-white border border-[#b9b9b9] text-[#555] hover:border-[#0c6175]"
          }`}
        >
          No
        </button>
      </div>
    </section>
  );
};

export default JobApplication;