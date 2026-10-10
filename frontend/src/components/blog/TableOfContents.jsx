// src/components/blog/TableOfContents.jsx
import React, { useState, useEffect } from "react";
import { FaListUl, FaChevronDown, FaChevronUp } from "react-icons/fa";

const TableOfContents = ({ content }) => {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Extract headings from HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const h2s = Array.from(doc.querySelectorAll("h2"));
    const h3s = Array.from(doc.querySelectorAll("h3"));

    const items = [...h2s, ...h3s].map((el, i) => {
      const text = el.textContent;
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return { id, text, level: el.tagName.toLowerCase() };
    });

    setHeadings(items);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -70% 0px" }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="bg-gray-50 rounded-2xl p-6 my-8 border border-gray-100">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <FaListUl className="text-[#00a3a1]" />
          <h3 className="text-lg font-bold text-gray-900">Table of Contents</h3>
        </div>
        {isOpen ? <FaChevronUp className="text-gray-400 text-sm" /> : <FaChevronDown className="text-gray-400 text-sm" />}
      </button>
      {isOpen && (
        <nav className="mt-4 space-y-1">
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              className={`block py-1.5 text-sm transition-colors ${
                h.level === "h3" ? "pl-6" : "pl-0"
              } ${
                activeId === h.id
                  ? "text-[#00a3a1] font-semibold"
                  : "text-gray-600 hover:text-[#00a3a1]"
              }`}
            >
              {h.text}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
};

export default TableOfContents;