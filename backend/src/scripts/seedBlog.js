// server/scripts/seedBlog.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Author from "../models/Author.js";
import Category from "../models/Category.js";
import Tag from "../models/Tag.js";
import Post from "../models/Post.js";
import Podcast from "../models/Podcast.js";
import Video from "../models/Video.js";

dotenv.config();

const authors = [
  {
    name: "Dr. Amara Okafor",
    role: "Chief Medical Editor",
    credentials: "MBBS, MPH, PhD Public Health",
    bio: "Public health physician with over 15 years of experience.",
    specialties: ["Public Health", "Epidemiology", "Preventive Medicine"],
    active: true,
  },
  // ... more
];

const categories = [
  { name: "Heart Health", description: "Cardiovascular health and prevention.", order: 1 },
  { name: "Nutrition", description: "Practical nutrition science.", order: 2 },
  // ... more
];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected");

  await Promise.all([
    Author.deleteMany({}),
    Category.deleteMany({}),
    Tag.deleteMany({}),
    Post.deleteMany({}),
    Podcast.deleteMany({}),
    Video.deleteMany({}),
  ]);

  const createdAuthors = await Author.insertMany(authors);
  const createdCategories = await Category.insertMany(categories);
  await Tag.insertMany(
    ["Hypertension", "Gut Health", "Anxiety", "Sleep"].map((name) => ({ name }))
  );

  console.log("Seeded:", {
    authors: createdAuthors.length,
    categories: createdCategories.length,
  });

  await mongoose.disconnect();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});