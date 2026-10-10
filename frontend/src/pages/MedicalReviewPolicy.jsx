// src/pages/MedicalReviewPolicy.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaUserMd, FaCheckCircle } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MedicalReviewPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="pt-32 pb-12 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#00a3a1] transition-colors mb-6"
          >
            <FaArrowLeft /> Back to Blog
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FaUserMd className="text-emerald-600 text-xl" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Medical Review Policy
            </h1>
          </div>
          <p className="text-gray-500 text-sm">Last updated: November 2024</p>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm prose prose-lg max-w-none
          prose-headings:font-bold prose-headings:text-gray-900
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-5
          prose-a:text-[#00a3a1] prose-a:no-underline hover:prose-a:underline
          prose-ul:my-4 prose-li:text-gray-700 prose-li:mb-2
        ">
          <p className="lead">
            Every health article published on Alveoly undergoes review by a
            qualified medical professional before it reaches our readers. This
            policy explains our medical review process.
          </p>

          <h2>Who Reviews Our Content</h2>
          <p>
            Our medical reviewers are licensed physicians, registered dietitians,
            psychologists, or other qualified healthcare professionals with
            relevant clinical experience. Reviewer credentials are displayed on
            each article they review.
          </p>

          <h2>What Reviewers Check</h2>
          <ul>
            <li><strong>Accuracy:</strong> Are all factual claims correct and supported by evidence?</li>
            <li><strong>Completeness:</strong> Are important caveats, risks, or alternatives missing?</li>
            <li><strong>Balance:</strong> Is the information presented fairly, without bias?</li>
            <li><strong>Evidence quality:</strong> Are claims supported by appropriate sources?</li>
            <li><strong>Safety:</strong> Could any reader be harmed by following this information?</li>
            <li><strong>Clarity:</strong> Is the information understandable to a general audience?</li>
          </ul>

          <h2>Evidence Hierarchy</h2>
          <p>We prioritize evidence in the following order:</p>
          <ol>
            <li>Systematic reviews and meta-analyses</li>
            <li>Randomized controlled trials</li>
            <li>Cohort and case-control studies</li>
            <li>Clinical guidelines from major health authorities</li>
            <li>Expert opinion (used sparingly and clearly identified)</li>
          </ol>

          <h2>Review Process</h2>
          <ol>
            <li>Draft article is written by a qualified author</li>
            <li>Article is fact-checked against primary sources</li>
            <li>Article is reviewed by a medical professional with relevant expertise</li>
            <li>Author addresses reviewer comments</li>
            <li>Final review and approval</li>
            <li>Publication with reviewer byline and review date</li>
          </ol>

          <h2>Ongoing Review</h2>
          <p>
            Articles are reviewed periodically — at minimum every 2 years — to
            ensure they remain current. Articles covering rapidly evolving topics
            may be reviewed more frequently.
          </p>

          <h2>Corrections</h2>
          <p>
            If a reviewer identifies an error after publication, the article is
            corrected promptly and a correction note is added.
          </p>

          <h2>Limitations</h2>
          <p>
            While our content is medically reviewed, it is for educational
            purposes only and does not constitute medical advice. Readers should
            consult their own healthcare provider for personalized guidance.
          </p>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default MedicalReviewPolicy;