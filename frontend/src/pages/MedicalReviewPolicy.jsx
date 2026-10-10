// src/pages/MedicalReviewPolicy.jsx — THE ALVEOLY JOURNAL MEDICAL REVIEW POLICY
// A public statement of how our medical review works. No component imports.
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft, FaHome, FaSearch, FaChevronDown, FaTwitter,
  FaLinkedin, FaInstagram, FaYoutube, FaRss, FaListUl,
  FaCheckCircle, FaEnvelope, FaArrowUp, FaUserMd,
} from "react-icons/fa";

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
    { to: "/editorial-policy", label: "Editorial Policy" },
    { to: "/medical-review-policy", label: "Medical Review Policy", active: true },
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
    id: "who",
    title: "Who reviews our content",
    body: (
      <>
        <p>
          Medical review at Alveoly is done by licensed physicians, registered
          dietitians, psychologists, pharmacists, and other qualified
          healthcare professionals with directly relevant clinical experience.
          We do not use generalist reviewers for specialist topics — a piece
          about paediatric vaccination is reviewed by a paediatrician, and a
          piece about nutrition is reviewed by a registered dietitian.
        </p>
        <p>
          Reviewer names, credentials, and affiliations are displayed at the
          top of every reviewed article, along with the date of the most
          recent review. Readers can click through to the reviewer's
          contributor page to see their full background.
        </p>
      </>
    ),
  },
  {
    id: "checks",
    title: "What reviewers check",
    body: (
      <>
        <p>
          Every reviewer works from the same checklist, applied to the piece
          they're reviewing:
        </p>
        <ul>
          <li>
            <strong>Accuracy.</strong> Are all factual claims correct and
            supported by the evidence cited?
          </li>
          <li>
            <strong>Completeness.</strong> Are important caveats, risks,
            contraindications, or alternative approaches missing?
          </li>
          <li>
            <strong>Balance.</strong> Is the information presented fairly,
            without bias toward a particular treatment, product, or ideology?
          </li>
          <li>
            <strong>Evidence quality.</strong> Are claims supported by sources
            appropriate to their strength — not single studies cited as if
            they settled a question?
          </li>
          <li>
            <strong>Safety.</strong> Could any reader be harmed — directly or
            through delayed care — by following this information?
          </li>
          <li>
            <strong>Clarity.</strong> Is the information understandable to a
            general audience without losing accuracy?
          </li>
        </ul>
        <p>
          If the reviewer disagrees with a claim, the article is revised until
          the disagreement is resolved — either by changing the claim or by
          adding context that makes the claim defensible.
        </p>
      </>
    ),
  },
  {
    id: "evidence",
    title: "Evidence hierarchy",
    body: (
      <>
        <p>
          We prioritise evidence in the following order. Where two sources
          conflict, the higher tier wins:
        </p>
        <ol>
          <li>
            Systematic reviews and meta-analyses
          </li>
          <li>Randomised controlled trials</li>
          <li>Cohort and case-control studies</li>
          <li>
            Clinical guidelines from major national and international health
            authorities
          </li>
          <li>
            Expert opinion — used sparingly, and always clearly identified as
            such
          </li>
        </ol>
        <p>
          We do not cite pre-prints as settled evidence. We do not cite press
          releases in place of the studies they describe. Where a field is
          genuinely contested, we say so rather than picking a side.
        </p>
      </>
    ),
  },
  {
    id: "process",
    title: "The review process",
    body: (
      <>
        <p>
          Every reviewed article passes through the same six-step process
          before it reaches a reader:
        </p>
        <ol>
          <li>
            The draft is written by a qualified author — a practising
            clinician, health journalist, or subject-matter expert.
          </li>
          <li>
            The draft is fact-checked against primary sources by an editor
            who is not the author.
          </li>
          <li>
            The draft is reviewed by a medical professional with direct
            expertise in the topic.
          </li>
          <li>
            The author addresses each reviewer comment — either by revising
            the text or by adding context in the piece itself.
          </li>
          <li>
            A second editor performs a final review to confirm changes are
            in place and the piece is ready to publish.
          </li>
          <li>
            The article publishes with the reviewer's name, credentials, and
            the review date displayed on the page.
          </li>
        </ol>
        <p>
          No article skips a step, even under publication pressure. If a
          reviewer is unavailable, publication waits.
        </p>
      </>
    ),
  },
  {
    id: "ongoing",
    title: "Ongoing review",
    body: (
      <>
        <p>
          Medical knowledge changes. Every reviewed article is re-examined at
          least once every two years by a qualified reviewer to confirm it
          still reflects current guidance. Articles covering rapidly evolving
          topics — vaccines, infectious disease outbreaks, new classes of
          medication — are reviewed more frequently, sometimes within weeks.
        </p>
        <p>
          When a review results in substantive changes, the article is
          updated and the review date at the top is refreshed. Readers see
          the current date because they deserve to know how fresh the
          information is.
        </p>
      </>
    ),
  },
  {
    id: "corrections",
    title: "Corrections after publication",
    body: (
      <>
        <p>
          If a reviewer, a reader, or an author identifies an error after
          publication, the article is corrected promptly. A dated correction
          note appears at the bottom of the piece stating what was changed
          and why. For substantive corrections — anything that could change a
          reader's decision — we also share the correction on our social
          channels.
        </p>
        <p>
          We do not silently edit articles. The record of a change is part of
          the article's integrity.
        </p>
      </>
    ),
  },
  {
    id: "badge",
    title: "What the review badge means",
    body: (
      <>
        <p>
          The{" "}
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
            <FaCheckCircle className="text-[10px]" />
            Medically reviewed
          </span>{" "}
          badge on an article means exactly one thing: a licensed healthcare
          professional with direct expertise in the subject has read the
          piece, checked it against the standards above, and approved it for
          publication. It does not mean the article is a substitute for
          personalised medical advice. It does not mean Alveoly endorses any
          specific treatment. It means we took the piece seriously before we
          put it in front of you.
        </p>
      </>
    ),
  },
  {
    id: "limitations",
    title: "Limitations",
    body: (
      <>
        <p>
          Our content is educational. It is not a diagnosis, a prescription,
          or a substitute for seeing a clinician who knows your history.
          Readers should use the journal to understand their options, ask
          better questions, and have more informed conversations with their
          own healthcare providers — not to replace them.
        </p>
        <p>
          If you are experiencing a medical emergency, contact your local
          emergency services. If you are in crisis, contact a crisis line in
          your region.
        </p>
      </>
    ),
  },
];

/* ============================================================
   MAIN
============================================================ */

const MedicalReviewPolicy = () => {
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
            Medical Review Policy
          </h1>

          <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 leading-relaxed">
            Who reviews our stories, what credentials they hold, what they
            check, and what the badge on every article actually means.
          </p>

          <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone-500 dark:text-stone-500">
            <span>
              <strong className="font-semibold text-stone-900 dark:text-stone-100">
                Last updated
              </strong>{" "}
              {lastUpdated}
            </span>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <span>
              Applies to every medically reviewed article in the journal
            </span>
          </div>
        </div>
      </header>

      {/* ---------- BODY ---------- */}
      <article className="max-w-3xl mx-auto px-5 py-12">
        {/* Lead paragraph */}
        <p className="text-lg md:text-xl text-stone-700 dark:text-stone-300 leading-relaxed mb-10 font-light">
          Every health article in this journal is read, checked, and signed
          off by a licensed clinician before it reaches you. This page
          explains exactly what that process looks like — who does the
          reviewing, what they check for, and what you should and shouldn't
          assume from the badge at the top of a reviewed piece.
        </p>

        {/* Table of contents */}
        <PolicyTOC sections={tocEntries} />

        {/* Sections */}
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
            The other two documents that hold the journal together
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link
              to="/editorial-policy"
              className="group p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-900 dark:hover:border-stone-100 transition"
            >
              <p className="text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold mb-2">
                Read next
              </p>
              <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 mb-2 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition">
                Editorial Policy
              </h4>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                How we choose stories, who writes them, and how we handle
                mistakes.
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

        {/* ---------- REVIEWER CONTACT BLOCK ---------- */}
        <div className="mt-14 p-6 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <div className="flex items-start gap-4">
            <FaUserMd className="text-rose-600 dark:text-rose-400 mt-1 text-lg" />
            <div>
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">
                Are you a clinician interested in reviewing?
              </p>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-3">
                Reviewers are practising clinicians with directly relevant
                expertise. If you'd like to join the review board, write to
                us with your credentials and areas of practice.
              </p>
              <a
                href="mailto:reviewers@alveoly.com"
                className="text-sm font-medium text-stone-900 dark:text-stone-100 underline underline-offset-4 hover:text-rose-600 dark:hover:text-rose-400 transition"
              >
                reviewers@alveoly.com
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

export default MedicalReviewPolicy;