// src/components/icons/BrandIcons.js
// Lucide dropped brand logos from the icon library (Twitter, Youtube, etc.).
// We source them here from react-icons/fa so any file in the app can import
// a consistent set of brand marks from a single, stable path.
//
// Usage in a page:
//
//   import { Twitter, Linkedin, Instagram, Youtube } from ".../icons/BrandIcons";
//
// The `as` aliases below mirror the exact names Lucide used to export, so
// dropping this file in requires zero changes at the call sites.

export {
  FaTwitter as Twitter,
  FaLinkedin as Linkedin,
  FaInstagram as Instagram,
  FaYoutube as Youtube,
  FaFacebook as Facebook,
  FaWhatsapp as Whatsapp,
  FaGithub as Github,
  FaGlobe as Globe,
} from "react-icons/fa";