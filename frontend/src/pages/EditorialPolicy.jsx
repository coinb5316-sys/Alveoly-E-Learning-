// src/pages/EditorialPolicy.jsx — THE ALVEOLY JOURNAL EDITORIAL POLICY
// A public statement of how we work. No component imports.
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft, FaHome, FaSearch, FaChevronDown, FaTwitter,
  FaLinkedin, FaInstagram, FaYoutube, FaRss, FaListUl,
  FaCheckCircle, FaEnvelope, FaArrowUp,
} from "react-icons/fa";

/* ============================================================
   UTILITIES
============================================================ */

/* ============================================================
   PRIMITIVES
============================================================ */

const SectionLabel = ({ icon: Icon, children }) => (
  <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-3 flex items-center gap-2">
    {Icon && <Icon className="text-xs" />}
    {children}
  </p>
);

const JournalNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    { to: "/blog", label: "Home" },
    { to: "/blog/archive", label: "Archive" },
    { to: "/blog/podcasts", label: "Podcasts" },
    { to: "/blog/videos", label: "Videos" },
    { to: "/blog/search", label: "Search" },
    { to: "/sitemap", label: "Sitemap" },
  ];

  return (
    <nav className="border-b border-stone-200 dark:border-stone-800 bg-white/85 dark:bg-stone-950/85 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-5">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition text-sm flex items-center gap-2"
            >
              <FaHome className="text-xs" />
              <span className="hidden sm:inline">Alveoly</span>
            </Link>
            <span className="text-stone-300 dark:text-stone-700">/</span>
            <Link
              to="/blog"
              className="font-serif text-lg font-bold tracking-tight text-stone-900 dark:text-stone-50"
            >
              The Journal
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-2 rounded-full text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/blog/search"
              className="ml-2 inline-flex items-center justify-center w-9 h-9 rounded-full border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:border-stone-900 dark:hover:border-stone-100 hover:text-stone-900 dark:hover:text-stone-100 transition"
              title="Search"
            >
              <FaSearch className="text-xs" />
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
          >
            Menu
            <FaChevronDown
              className={`text-[10px] transition-transform ${
                mobileOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-stone-200 dark:border-stone-800"
            >
              <div className="py-3 flex flex-col">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className="px-2 py-2.5 text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

const JournalFooter = () => {
  const policyLinks = [
    { to: "/editorial-policy", label: "Editorial Policy", active: true },
    { to: "/medical-review-policy", label: "Medical Review Policy" },
    { to: "/advertising-policy", label: "Advertising Policy" },
  ];
  const contentLinks = [
    { to: "/blog", label: "All articles" },
    { to: "/blog/archive", label: "Archive" },
    { to: "/blog/podcasts", label: "Podcasts" },
    { to: "/blog/videos", label: "Videos" },
    { to: "/blog/search", label: "Search" },
    { to: "/sitemap", label: "Sitemap" },
  ];
  const socials = [
    { icon: FaTwitter, href: "https://twitter.com/alveoly", label: "Twitter" },
    { icon: FaInstagram, href: "https://instagram.com/alveoly", label: "Instagram" },
    { icon: FaYoutube, href: "https://youtube.com/@alveoly", label: "YouTube" },
    { icon: FaLinkedin, href: "https://linkedin.com/company/alveoly", label: "LinkedIn" },
    { icon: FaRss, href: "/blog/rss", label: "RSS" },
  ];

  return (
    <footer className="border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-6xl mx-auto px-5 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link
              to="/blog"
              className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50"
            >
              The Alveoly Journal
            </Link>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-4 max-w-sm leading-relaxed">
              A clinician-written publication on heart health, nutrition,
              mental wellness, and public health. Evidence in plain language,
              reviewed for accuracy, free of clickbait.
            </p>
            <div className="flex items-center gap-4 mt-6">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                >
                  <s.icon />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-4">
              Content
            </p>
            <ul className="space-y-2.5">
              {contentLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-4">
              Trust
            </p>
            <ul className="space-y-2.5">
              {policyLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className={`text-sm transition ${
                      l.active
                        ? "text-stone-900 dark:text-stone-100 font-medium"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/"
                  className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                >
                  Back to Alveoly
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 dark:text-stone-500">
          <p>© {new Date().getFullYear()} Alveoly. All rights reserved.</p>
          <p className="italic">
            The content is educational only and not a substitute for medical
            advice.
          </p>
        </div>
      </div>
    </footer>
  );
};

/* ============================================================
   TABLE OF CONTENTS
============================================================ */

const PolicyTOC = ({ sections }) => {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-90px 0px -70% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className="my-10 p-6 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
      <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-4 flex items-center gap-2">
        <FaListUl className="text-xs" />
        On this page
      </p>
      <ol className="space-y-2">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(s.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`text-sm leading-snug transition-colors block ${
                activeId === s.id
                  ? "text-rose-600 dark:text-rose-400 font-medium"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              {activeId === s.id && <span className="mr-1.5">→</span>}
              {s.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};

/* ============================================================
   CONTENT SECTIONS
============================================================ */

const sections = [
  {
    id: "mission",
    title: "Our mission",
    body: (
      <>
        <p>
          Alveoly exists to make reliable health information accessible to
          everyone. We believe that access to accurate health knowledge is a
          fundamental right, and we work to remove the barriers — linguistic,
          economic, and educational — that stand between people and the
          information they need to make informed decisions about their health.
        </p>
      </>
    ),
  },
  {
    id: "independence",
    title: "Editorial independence",
    body: (
      <>
        <p>
          Our editorial team operates independently of our commercial
          operations. Advertisers, sponsors, and partners have no influence
          over the content we publish. Where commercial relationships exist,
          they are clearly disclosed on the page itself.
        </p>
        <p>
          No journalist at Alveoly is permitted to accept gifts, trips, or
          hospitality from any company whose products they might cover. Where
          a story concerns a company with which Alveoly has a commercial
          relationship, the story is handled by an editor with no involvement
          in that relationship.
        </p>
      </>
    ),
  },
  {
    id: "process",
    title: "How a story is made",
    body: (
      <>
        <h3>1. Topic selection</h3>
        <p>
          Topics are chosen based on reader questions, public health
          priorities, emerging research, and gaps in accessible health
          information — not on what will drive the most traffic.
        </p>

        <h3>2. Research and writing</h3>
        <p>
          Stories are written by practicing clinicians, health journalists, or
          subject matter experts. Writers are required to use primary sources —
          peer-reviewed journals, clinical guidelines, and official health
          authority publications — and to avoid relying on secondary sources
          alone.
        </p>

        <h3>3. Medical review</h3>
        <p>
          Every health story is reviewed by a qualified medical professional
          before publication. The reviewer checks for accuracy, completeness,
          balance, and the appropriate use of evidence. If a reviewer
          disagrees with a claim, the story is revised until the disagreement
          is resolved.
        </p>

        <h3>4. Editing</h3>
        <p>
          Editors ensure clarity, readability, and adherence to our style
          guide. We write for a general audience without sacrificing accuracy.
        </p>

        <h3>5. Fact-checking</h3>
        <p>
          Every factual claim is verified against primary sources.
          Statistical claims are checked for context and correct
          interpretation. Numbers are never rounded to look more dramatic than
          the data supports.
        </p>

        <h3>6. Publication and updates</h3>
        <p>
          Stories are published with clear dates and author bylines. When
          significant new evidence emerges, the story is updated — and the
          update is dated and noted.
        </p>
      </>
    ),
  },
  {
    id: "corrections",
    title: "Corrections policy",
    body: (
      <>
        <p>
          We are committed to correcting errors promptly and transparently.
          When an error is identified:
        </p>
        <ul>
          <li>It is corrected as quickly as possible</li>
          <li>
            A dated correction note is added at the bottom of the article
          </li>
          <li>
            Significant corrections are shared on our social channels
          </li>
        </ul>
        <p>
          To report an error, email{" "}
          <a href="mailto:corrections@alveoly.com">
            corrections@alveoly.com
          </a>
          . We reply to every substantive correction within five working days.
        </p>
      </>
    ),
  },
  {
    id: "ai",
    title: "Use of AI",
    body: (
      <>
        <p>
          We may use AI tools for research assistance, transcription, and
          administrative tasks. However, all content is written, reviewed, and
          edited by humans. No article is published without human medical
          review.
        </p>
        <p>
          We do not use AI to generate images that could be mistaken for
          photographs of real people, real procedures, or real health
          conditions.
        </p>
      </>
    ),
  },
  {
    id: "conflicts",
    title: "Conflicts of interest",
    body: (
      <>
        <p>
          Writers and reviewers are required to disclose any financial or
          personal relationships that could influence their work — including
          grants, consultancies, advisory roles, and equity holdings. Where a
          conflict exists, the individual is recused from the relevant
          assignment.
        </p>
        <p>
          Disclosures are published at the bottom of each story where they
          apply. If we miss one, tell us. We'd rather over-disclose than
          under-disclose.
        </p>
      </>
    ),
  },
  {
    id: "advertising",
    title: "Advertising and sponsorship",
    body: (
      <>
        <p>
          We accept advertising from organisations whose products and services
          are consistent with our editorial standards. Advertising is clearly
          distinguished from editorial content and labelled as such. We do not
          accept advertising for products that are known to be harmful or that
          make unsupported health claims.
        </p>
        <p>
          Sponsored content, when it appears, is written and labelled by
          Alveoly. We do not publish advertiser-written stories under our
          byline.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <>
        <p>
          For editorial inquiries, email{" "}
          <a href="mailto:editorial@alveoly.com">editorial@alveoly.com</a>.
          For corrections, use{" "}
          <a href="mailto:corrections@alveoly.com">
            corrections@alveoly.com
          </a>
          . For review-related questions, see our{" "}
          <Link to="/medical-review-policy">Medical Review Policy</Link>.
        </p>
      </>
    ),
  },
];

/* ============================================================
   MAIN
============================================================ */

const EditorialPolicy = () => {
  const lastUpdated = "November 2024";

  const tocEntries = useMemo(
    () => sections.map((s) => ({ id: s.id, title: s.title })),
    []
  );

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <JournalNav />

      {/* ---------- MASTHEAD ---------- */}
      <header className="border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-3xl mx-auto px-5 pt-12 md:pt-16 pb-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition mb-8"
          >
            <FaArrowLeft className="text-xs" />
            Back to the journal
          </Link>

          <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 mb-4">
            Trust
          </p>

          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.1] mb-5">
            Editorial Policy
          </h1>

          <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 leading-relaxed">
            How we choose stories, who writes them, how they are reviewed, and
            how we handle mistakes. This is the document we hold ourselves to.
          </p>

          <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone-500 dark:text-stone-500">
            <span>
              <strong className="font-semibold text-stone-900 dark:text-stone-100">
                Last updated
              </strong>{" "}
              {lastUpdated}
            </span>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <span>Applies to all content published on The Alveoly Journal</span>
          </div>
        </div>
      </header>

      {/* ---------- BODY ---------- */}
      <article className="max-w-3xl mx-auto px-5 py-12">
        <p className="text-lg md:text-xl text-stone-700 dark:text-stone-300 leading-relaxed mb-10 font-light">
          Alveoly publishes health information for people who need it, in
          plain language, without overstatement. This page explains what that
          means in practice — the standards we set for our writers, our
          reviewers, and ourselves.
        </p>

        <PolicyTOC sections={tocEntries} />

        <div className="prose-editorial">
          {sections.map((s) => (
            <section
              key={s.id}
              id={s.id}
              className="scroll-mt-24 pt-6 first:pt-0"
            >
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-4 mt-10 first:mt-0">
                {s.title}
              </h2>
              <div>{s.body}</div>
            </section>
          ))}
        </div>

        {/* ---------- POLICY CROSS-LINKS ---------- */}
        <div className="mt-16 pt-10 border-t border-stone-200 dark:border-stone-800">
          <SectionLabel icon={FaCheckCircle}>Related policies</SectionLabel>
          <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 mb-6">
            How the journal works, in three documents
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link
              to="/medical-review-policy"
              className="group p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-900 dark:hover:border-stone-100 transition"
            >
              <p className="text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold mb-2">
                Read next
              </p>
              <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 mb-2 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition">
                Medical Review Policy
              </h4>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Who reviews our stories, what credentials they hold, and how
                review is documented.
              </p>
            </Link>
            <Link
              to="/advertising-policy"
              className="group p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-900 dark:hover:border-stone-100 transition"
            >
              <p className="text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold mb-2">
                Read next
              </p>
              <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 mb-2 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition">
                Advertising Policy
              </h4>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                What we will and won't accept money for, and how we label it.
              </p>
            </Link>
            <Link
              to="/sitemap"
              className="group p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-900 dark:hover:border-stone-100 transition"
            >
              <p className="text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold mb-2">
                Browse
              </p>
              <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 mb-2 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition">
                Sitemap
              </h4>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                A structured index of every section, contributor, and article.
              </p>
            </Link>
          </div>
        </div>

        {/* ---------- CONTACT BLOCK ---------- */}
        <div className="mt-14 p-6 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <div className="flex items-start gap-4">
            <FaEnvelope className="text-rose-600 dark:text-rose-400 mt-1 text-lg" />
            <div>
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">
                Something wrong in an article?
              </p>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-3">
                Corrections are welcome and taken seriously. If we got it
                wrong, we want to know.
              </p>
              <a
                href="mailto:corrections@alveoly.com"
                className="text-sm font-medium text-stone-900 dark:text-stone-100 underline underline-offset-4 hover:text-rose-600 dark:hover:text-rose-400 transition"
              >
                corrections@alveoly.com
              </a>
            </div>
          </div>
        </div>

        {/* ---------- BACK TO TOP ---------- */}
        <div className="mt-14 flex justify-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-stone-300 dark:border-stone-700 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-stone-100 transition"
          >
            <FaArrowUp className="text-xs" />
            Back to top
          </button>
        </div>
      </article>

      <JournalFooter />
    </div>
  );
};

export default EditorialPolicy;