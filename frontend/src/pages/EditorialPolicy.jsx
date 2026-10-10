// src/pages/EditorialPolicy.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const EditorialPolicy = () => {
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
            <div className="w-12 h-12 rounded-xl bg-[#00a3a1]/10 flex items-center justify-center">
              <FaCheckCircle className="text-[#00a3a1] text-xl" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Editorial Policy
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
            At Alveoly, we are committed to publishing accurate, evidence-based,
            and transparent health information. This Editorial Policy outlines
            our standards, processes, and commitments to our readers.
          </p>

          <h2>Our Mission</h2>
          <p>
            Alveoly exists to make reliable health information accessible to
            everyone. We believe that access to accurate health knowledge is a
            fundamental right, and we work to remove barriers — linguistic,
            economic, and educational — that stand between people and the
            information they need to make informed decisions about their health.
          </p>

          <h2>Editorial Independence</h2>
          <p>
            Our editorial team operates independently of our commercial
            operations. Advertisers, sponsors, and partners have no influence
            over the content we publish. Where commercial relationships exist,
            they are clearly disclosed.
          </p>

          <h2>Content Creation Process</h2>
          <h3>1. Topic Selection</h3>
          <p>
            Topics are selected based on reader questions, public health
            priorities, emerging research, and gaps in accessible health
            information.
          </p>

          <h3>2. Research and Writing</h3>
          <p>
            Articles are written by clinicians, health journalists, or subject
            matter experts. Writers are required to use primary sources —
            peer-reviewed journals, clinical guidelines, and official health
            authority publications — and to avoid relying on secondary sources
            alone.
          </p>

          <h3>3. Medical Review</h3>
          <p>
            All health content is reviewed by a qualified medical professional
            before publication. Reviewers check for accuracy, completeness,
            balance, and the appropriate use of evidence.
          </p>

          <h3>4. Editing</h3>
          <p>
            Our editors ensure clarity, readability, and adherence to our style
            guide. We write for a general audience without sacrificing accuracy.
          </p>

          <h3>5. Fact-Checking</h3>
          <p>
            Every factual claim is verified against primary sources. Statistical
            claims are checked for context and correct interpretation.
          </p>

          <h3>6. Publication and Updates</h3>
          <p>
            Articles are published with clear dates and author bylines. When
            significant new evidence emerges, articles are updated — and the
            update is noted.
          </p>

          <h2>Corrections Policy</h2>
          <p>
            We are committed to correcting errors promptly and transparently.
            When an error is identified:
          </p>
          <ul>
            <li>It is corrected as quickly as possible</li>
            <li>A correction note is added to the article</li>
            <li>Significant corrections are shared on our social channels</li>
          </ul>
          <p>
            To report an error, please email{" "}
            <a href="mailto:corrections@alveoly.com">corrections@alveoly.com</a>.
          </p>

          <h2>Use of AI</h2>
          <p>
            We may use AI tools for research assistance, transcription, and
            administrative tasks. However, all content is written, reviewed, and
            edited by humans. No article is published without human medical
            review.
          </p>

          <h2>Conflicts of Interest</h2>
          <p>
            Writers and reviewers are required to disclose any financial or
            personal relationships that could influence their work. Where a
            conflict exists, the individual is recused from the relevant
            assignment.
          </p>

          <h2>Advertising and Sponsorship</h2>
          <p>
            We accept advertising from organizations whose products and services
            are consistent with our editorial standards. Advertising is clearly
            distinguished from editorial content. We do not accept advertising
            for products that are known to be harmful or that make unsupported
            health claims.
          </p>

          <h2>Contact</h2>
          <p>
            For editorial inquiries, contact{" "}
            <a href="mailto:editorial@alveoly.com">editorial@alveoly.com</a>.
          </p>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default EditorialPolicy;