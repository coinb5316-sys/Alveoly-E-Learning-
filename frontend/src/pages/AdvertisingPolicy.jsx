// src/pages/AdvertisingPolicy.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaBullhorn } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const AdvertisingPolicy = () => {
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
              <FaBullhorn className="text-[#00a3a1] text-xl" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Advertising Policy
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
            Alveoly is committed to maintaining the trust of our readers. This
            Advertising Policy explains how we handle advertising, sponsorship,
            and commercial relationships.
          </p>

          <h2>Our Commitment</h2>
          <p>
            Advertising supports our ability to provide free, high-quality health
            information. However, we will never allow advertising to compromise
            the accuracy, independence, or integrity of our editorial content.
          </p>

          <h2>Separation of Advertising and Editorial</h2>
          <p>
            All advertising is clearly labeled as such. Sponsored content is
            marked with a prominent "Sponsored" or "Paid Partnership" label.
            Editorial content is never influenced by advertisers.
          </p>

          <h2>Advertising Standards</h2>
          <p>We do not accept advertising for:</p>
          <ul>
            <li>Products that make unproven or misleading health claims</li>
            <li>Tobacco and nicotine products</li>
            <li>Illegal substances</li>
            <li>Products known to be harmful to health</li>
            <li>Weight-loss products with unsubstantiated claims</li>
            <li>"Miracle cure" products</li>
            <li>Products that discriminate against protected groups</li>
          </ul>

          <h2>Transparency</h2>
          <p>
            Where an article is sponsored, the sponsor is clearly identified. Where
            we have affiliate relationships, this is disclosed. Where an author or
            reviewer has a financial interest in a product or company mentioned in
            an article, this is disclosed.
          </p>

          <h2>Third-Party Ad Networks</h2>
          <p>
            We may use third-party ad networks, including Google AdSense, to serve
            advertisements. These networks may use cookies to serve ads based on
            your prior visits to our site and other sites. You can learn more
            about how Google uses your data at{" "}
            <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
              Google's Partner Sites policy
            </a>.
          </p>

          <h2>User Experience</h2>
          <p>
            We are committed to ensuring that advertising does not detract from
            the user experience. We limit the number and type of ads on our pages
            and avoid intrusive formats such as pop-ups and auto-playing video ads.
          </p>

          <h2>Reporting Concerns</h2>
          <p>
            If you see an advertisement on Alveoly that you believe violates this
            policy, please contact us at{" "}
            <a href="mailto:advertising@alveoly.com">advertising@alveoly.com</a>.
          </p>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default AdvertisingPolicy;