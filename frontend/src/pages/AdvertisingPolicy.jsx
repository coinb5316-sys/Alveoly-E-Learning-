// src/pages/AdvertisingPolicy.jsx — THE ALVEOLY JOURNAL ADVERTISING POLICY
// A public statement of what we will and won't accept money for. No component imports.
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft, FaHome, FaSearch, FaChevronDown, FaTwitter,
  FaLinkedin, FaInstagram, FaYoutube, FaRss, FaListUl,
  FaCheckCircle, FaEnvelope, FaArrowUp, FaBullhorn, FaTimesCircle,
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
    { to: "/medical-review-policy", label: "Medical Review Policy" },
    { to: "/advertising-policy", label: "Advertising Policy", active: true },
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
    id: "commitment",
    title: "Our commitment",
    body: (
      <>
        <p>
          Advertising pays for the work you read here. It is why every article
          in this journal is free, why no story sits behind a paywall, and why
          we can refuse to run sponsored pieces that don't meet our standards
          — even when the money is good.
        </p>
        <p>
          That independence only exists if we protect it. This page states
          what we will and won't accept money for, and how we make commercial
          relationships visible to readers when they exist.
        </p>
      </>
    ),
  },
  {
    id: "separation",
    title: "Separation of advertising and editorial",
    body: (
      <>
        <p>
          Advertising and editorial are structurally separated at Alveoly.
          Advertisers have no role in choosing topics, shaping stories, or
          reviewing drafts. Writers and medical reviewers are not told which
          companies advertise with us.
        </p>
        <p>
          Every piece of commercial content is labelled at the top of the
          page, before the reader reaches the first sentence. Labels we use:
        </p>
        <ul>
          <li>
            <strong>Sponsored</strong> — content commissioned and paid for by
            an advertiser, written and edited by Alveoly, and reviewed for
            accuracy by our medical team where health claims are involved
          </li>
          <li>
            <strong>Paid partnership</strong> — a collaboration with a
            partner, disclosed in the piece
          </li>
          <li>
            <strong>Advertisement</strong> — a paid placement served by a
            third-party network, not produced by us
          </li>
        </ul>
        <p>
          Editorial articles are never labelled as sponsored, and sponsored
          content is never presented as editorial.
        </p>
      </>
    ),
  },
  {
    id: "won't",
    title: "What we will not accept",
    body: (
      <>
        <p>
          Some money is simply not worth taking. We do not accept advertising
          or sponsorship from:
        </p>
        <ul>
          <li>
            Products or services that make unproven or misleading health
            claims
          </li>
          <li>Tobacco, vaping, and nicotine products</li>
          <li>Illegal substances and illegal services</li>
          <li>
            Products known to be harmful to health, even if legally sold
          </li>
          <li>
            Weight-loss products with unsubstantiated claims — including
            "detox" teas, non-FDA-approved supplements, and rapid-weight-loss
            programmes without clinical evidence
          </li>
          <li>
            Any product marketed as a "miracle cure" or "secret remedy"
          </li>
          <li>
            Products or services that discriminate against people on the basis
            of race, religion, sex, gender identity, sexual orientation,
            disability, or national origin
          </li>
          <li>
            Political campaigns, political action committees, and political
            advocacy organisations
          </li>
          <li>
            Financial products marketed with guaranteed-return or
            high-pressure language
          </li>
        </ul>
        <p>
          This list is not exhaustive. When we're unsure, we err on the side
          of turning the money down.
        </p>
      </>
    ),
  },
  {
    id: "labelling",
    title: "How we label commercial content",
    body: (
      <>
        <p>
          Labels must be visible, unambiguous, and in the same font size as
          the surrounding editorial text. We don't hide them in footers, we
          don't soften them with euphemisms like "partner content," and we
          don't rely on colour alone to distinguish them.
        </p>
        <p>
          On every piece of commercial content you will find, at the top of
          the page, above the headline:
        </p>
        <ul>
          <li>The category of commercial content (Sponsored / Paid partnership / Advertisement)</li>
          <li>The name of the advertiser or partner</li>
          <li>For sponsored editorial, the name of the Alveoly editor who oversaw it</li>
        </ul>
        <p>
          Where a health claim appears in sponsored content, the piece is
          medically reviewed like any other health article, and the reviewer
          is named.
        </p>
      </>
    ),
  },
  {
    id: "transparency",
    title: "Transparency and disclosures",
    body: (
      <>
        <p>
          Beyond labels on commercial content, we disclose:
        </p>
        <ul>
          <li>
            <strong>Affiliate links.</strong> Where a link to a product earns
            us a commission, the piece says so — either inline near the link
            or in a disclosure at the top
          </li>
          <li>
            <strong>Author financial interests.</strong> If a writer or
            reviewer holds equity in, works for, or consults with a company
            mentioned in a piece, that relationship is disclosed in the piece
          </li>
          <li>
            <strong>Alveoly commercial relationships.</strong> If a story
            concerns a company or institution that has an active commercial
            relationship with Alveoly, the piece is handled by an editor with
            no involvement in that relationship, and the relationship itself
            is disclosed at the bottom of the piece
          </li>
          <li>
            <strong>Reviewer relationships.</strong> Reviewers disclose any
            financial relationship with the topic of the piece they review
          </li>
        </ul>
        <p>
          When in doubt, we disclose. Over-disclosure is cheap;
          under-disclosure costs us the one thing that makes this journal
          worth reading.
        </p>
      </>
    ),
  },
  {
    id: "networks",
    title: "Third-party ad networks",
    body: (
      <>
        <p>
          We use third-party ad networks — including Google AdSense — to serve
          programmatic advertising on some pages. These networks place
          cookies on your device to serve ads based on your visits to our
          site and other sites.
        </p>
        <p>
          We do not have visibility into every individual advertiser served by
          these networks. If you see an ad that appears to violate this
          policy, tell us at{" "}
          <a href="mailto:advertising@alveoly.com">
            advertising@alveoly.com
          </a>{" "}
          and we will block it from appearing on our site.
        </p>
        <p>
          For details on how Google uses data from sites that use its
          services, see{" "}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google's Partner Sites policy
          </a>
          . You can opt out of personalised advertising via{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ads Settings
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "experience",
    title: "Reader experience",
    body: (
      <>
        <p>
          Advertising should not cost you the ability to read. We apply the
          following rules to every page:
        </p>
        <ul>
          <li>No pop-ups, no interstitials, no full-screen takeovers</li>
          <li>No auto-playing video or audio ads</li>
          <li>
            No ads that mimic editorial layout or use typography that could be
            mistaken for our own
          </li>
          <li>
            No ads that run above the headline of a piece — the article always
            comes first
          </li>
          <li>
            No third-party ad network that we can't subject to these rules
          </li>
        </ul>
        <p>
          If an advertisement on Alveoly interferes with your reading, tell us
          and we will remove it.
        </p>
      </>
    ),
  },
  {
    id: "reporting",
    title: "Reporting a concern",
    body: (
      <>
        <p>
          If you see an advertisement, sponsorship, or commercial content on
          Alveoly that you believe violates this policy, write to us. Every
          report is read by a member of the editorial team, not an automated
          system.
        </p>
        <p>
          For complaints about a specific ad, include the URL of the page, a
          screenshot if possible, and a short description of the issue. We
          investigate every report and reply within five working days.
        </p>
        <p>
          Email{" "}
          <a href="mailto:advertising@alveoly.com">
            advertising@alveoly.com
          </a>
          .
        </p>
      </>
    ),
  },
];

/* ============================================================
   MAIN
============================================================ */

const AdvertisingPolicy = () => {
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
            Advertising Policy
          </h1>

          <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 leading-relaxed">
            What we will and won't accept money for, how commercial content is
            labelled, and how we keep advertising from touching the stories
            you read.
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
              Applies to all advertising and commercial content on Alveoly
            </span>
          </div>
        </div>
      </header>

      {/* ---------- BODY ---------- */}
      <article className="max-w-3xl mx-auto px-5 py-12">
        {/* Lead paragraph */}
        <p className="text-lg md:text-xl text-stone-700 dark:text-stone-300 leading-relaxed mb-10 font-light">
          Advertising pays for the work you read here — which is why we treat
          it carefully. This page explains what we will and won't accept money
          for, how sponsored pieces are labelled, and how readers can tell
          editorial from paid placement on every page.
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

        {/* ---------- WHAT WE WON'T TAKE (BADGE DEMO) ---------- */}
        <div className="mt-16 pt-10 border-t border-stone-200 dark:border-stone-800">
          <SectionLabel icon={FaTimesCircle}>
            The short version
          </SectionLabel>
          <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 mb-6">
            Not on this site
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Miracle cures",
              "Detox teas",
              "Tobacco and vaping",
              "Unproven supplements",
              "Rapid-weight-loss pills",
              "Political campaigns",
              "Guaranteed-return finance",
              "Discriminatory products",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-sm text-stone-700 dark:text-stone-300"
              >
                <FaTimesCircle className="text-rose-500 dark:text-rose-400 text-xs flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ---------- POLICY CROSS-LINKS ---------- */}
        <div className="mt-16 pt-10 border-t border-stone-200 dark:border-stone-800">
          <SectionLabel icon={FaCheckCircle}>Related policies</SectionLabel>
          <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 mb-6">
            The rest of the trust layer
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
                Who reviews our stories, what credentials they hold, and what
                the badge on every article means.
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

        {/* ---------- ADVERTISING CONTACT BLOCK ---------- */}
        <div className="mt-14 p-6 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <div className="flex items-start gap-4">
            <FaBullhorn className="text-rose-600 dark:text-rose-400 mt-1 text-lg" />
            <div>
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">
                Advertise with us — or report an ad
              </p>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-3">
                For advertising enquiries, or to report an advertisement that
                you believe violates this policy, write to us. Every report is
                read by the editorial team, not an automated system.
              </p>
              <a
                href="mailto:advertising@alveoly.com"
                className="text-sm font-medium text-stone-900 dark:text-stone-100 underline underline-offset-4 hover:text-rose-600 dark:hover:text-rose-400 transition"
              >
                advertising@alveoly.com
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

export default AdvertisingPolicy;