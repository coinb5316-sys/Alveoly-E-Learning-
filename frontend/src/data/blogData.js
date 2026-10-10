// src/data/blogData.js
// Realistic mock data for the Alveoly health blog

export const authors = [
  {
    id: "dr-amara-okafor",
    name: "Dr. Amara Okafor",
    role: "Chief Medical Editor",
    credentials: "MBBS, MPH, PhD Public Health",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
    bio: "Dr. Amara Okafor is a public health physician with over 15 years of experience in clinical practice and health education. She oversees the medical accuracy of all content published on Alveoly and is passionate about making evidence-based health information accessible to everyone.",
    social: {
      twitter: "https://twitter.com/alveoly",
      linkedin: "https://linkedin.com/company/alveoly",
      email: "editorial@alveoly.com",
    },
    specialties: ["Public Health", "Epidemiology", "Preventive Medicine"],
  },
  {
    id: "dr-james-mensah",
    name: "Dr. James Mensah",
    role: "Senior Cardiology Contributor",
    credentials: "MD, FACC, Cardiologist",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
    bio: "Dr. James Mensah is a board-certified cardiologist who writes about heart health, hypertension, and cardiovascular prevention. He believes that understanding your heart is the first step to protecting it.",
    social: {
      twitter: "https://twitter.com/alveoly",
      linkedin: "https://linkedin.com/company/alveoly",
    },
    specialties: ["Cardiology", "Hypertension", "Heart Disease Prevention"],
  },
  {
    id: "sarah-njeri",
    name: "Sarah Njeri",
    role: "Registered Dietitian & Nutrition Editor",
    credentials: "RD, MSc Clinical Nutrition",
    avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face",
    bio: "Sarah Njeri is a registered dietitian specializing in clinical nutrition and metabolic health. She translates complex nutritional science into practical, everyday advice.",
    social: {
      twitter: "https://twitter.com/alveoly",
      instagram: "https://instagram.com/alveoly",
    },
    specialties: ["Clinical Nutrition", "Diabetes", "Weight Management"],
  },
  {
    id: "dr-fatima-ali",
    name: "Dr. Fatima Ali",
    role: "Mental Health Contributor",
    credentials: "MBBS, MRCPsych",
    avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face",
    bio: "Dr. Fatima Ali is a psychiatrist with a special interest in community mental health, anxiety disorders, and the intersection of culture and mental wellness.",
    social: {
      twitter: "https://twitter.com/alveoly",
      linkedin: "https://linkedin.com/company/alveoly",
    },
    specialties: ["Psychiatry", "Anxiety", "Depression", "Community Mental Health"],
  },
  {
    id: "dr-kwame-asante",
    name: "Dr. Kwame Asante",
    role: "Pediatrics Contributor",
    credentials: "MD, FAAP",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face",
    bio: "Dr. Kwame Asante is a pediatrician dedicated to child health, vaccination advocacy, and supporting parents with evidence-based guidance.",
    social: {
      linkedin: "https://linkedin.com/company/alveoly",
    },
    specialties: ["Pediatrics", "Child Nutrition", "Vaccination"],
  },
];

export const categories = [
  {
    id: "heart-health",
    name: "Heart Health",
    slug: "heart-health",
    description: "Evidence-based articles on cardiovascular health, hypertension, cholesterol, and heart disease prevention.",
    color: "from-rose-500 to-red-600",
    icon: "heart",
    image: "https://images.unsplash.com/photo-1628348070889-cb656235b4eb?w=800&h=600&fit=crop",
  },
  {
    id: "nutrition",
    name: "Nutrition & Diet",
    slug: "nutrition",
    description: "Practical nutrition science for real life — from meal planning to metabolic health.",
    color: "from-emerald-500 to-green-600",
    icon: "apple",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop",
  },
  {
    id: "mental-health",
    name: "Mental Health",
    slug: "mental-health",
    description: "Compassionate, stigma-free coverage of anxiety, depression, stress, and emotional wellbeing.",
    color: "from-violet-500 to-purple-600",
    icon: "brain",
    image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&h=600&fit=crop",
  },
  {
    id: "womens-health",
    name: "Women's Health",
    slug: "womens-health",
    description: "Reproductive health, pregnancy, menopause, and the unique health needs of women.",
    color: "from-pink-500 to-rose-600",
    icon: "female",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop",
  },
  {
    id: "mens-health",
    name: "Men's Health",
    slug: "mens-health",
    description: "Prostate health, testosterone, cardiovascular risk, and preventive care for men.",
    color: "from-blue-500 to-indigo-600",
    icon: "male",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
  },
  {
    id: "child-health",
    name: "Child Health",
    slug: "child-health",
    description: "Pediatric guidance for parents — from newborn care to adolescent wellbeing.",
    color: "from-amber-500 to-orange-600",
    icon: "baby",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop",
  },
  {
    id: "infectious-disease",
    name: "Infectious Disease",
    slug: "infectious-disease",
    description: "Malaria, TB, HIV, and emerging infections — prevention, treatment, and public health.",
    color: "from-teal-500 to-cyan-600",
    icon: "virus",
    image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&h=600&fit=crop",
  },
  {
    id: "public-health",
    name: "Public Health",
    slug: "public-health",
    description: "Population health, policy, epidemiology, and the social determinants of health.",
    color: "from-slate-500 to-gray-600",
    icon: "globe",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop",
  },
];

export const tags = [
  "Hypertension", "Diabetes", "Cholesterol", "Exercise", "Sleep",
  "Stress", "Anxiety", "Depression", "Pregnancy", "Vaccination",
  "Malaria", "HIV", "Cancer Screening", "Obesity", "Vitamin D",
  "Gut Health", "Immunity", "Heart Disease", "Stroke", "Asthma",
];

export const posts = [
  {
    id: "silent-killer-hypertension",
    slug: "silent-killer-understanding-hypertension",
    title: "The Silent Killer: Understanding Hypertension Before It Strikes",
    excerpt: "Hypertension affects 1 in 3 adults globally, yet most don't know they have it. Here's what every adult needs to know about blood pressure, risk factors, and prevention.",
    content: `
      <p class="lead">Hypertension — commonly known as high blood pressure — is often called the "silent killer" for a reason: it typically produces no symptoms until it has already damaged your heart, kidneys, or brain. In this article, we break down what blood pressure actually means, why it matters, and what you can do today to protect yourself.</p>

      <h2>What Is Blood Pressure, Really?</h2>
      <p>Blood pressure is the force your blood exerts against the walls of your arteries as your heart pumps. It's measured in two numbers: <strong>systolic</strong> (the pressure when your heart beats) over <strong>diastolic</strong> (the pressure when your heart rests between beats).</p>
      <p>A normal reading is generally below 120/80 mmHg. Anything consistently at or above 140/90 mmHg is considered hypertension in most clinical guidelines.</p>

      <blockquote>
        <p>"Hypertension is the single largest contributor to cardiovascular disease worldwide — and it's also one of the most modifiable."</p>
        <cite>— World Health Organization, 2023</cite>
      </blockquote>

      <h2>Why It Matters</h2>
      <p>Uncontrolled hypertension is a leading risk factor for:</p>
      <ul>
        <li><strong>Heart attack and heart failure</strong> — the heart works harder and eventually weakens</li>
        <li><strong>Stroke</strong> — damaged arteries in the brain can rupture or block</li>
        <li><strong>Kidney disease</strong> — the kidneys' delicate blood vessels are particularly vulnerable</li>
        <li><strong>Vision loss</strong> — the tiny vessels in the retina can be damaged</li>
      </ul>

      <h2>Risk Factors You Can Control</h2>
      <p>The good news: many hypertension risk factors are within your control. Here are the most impactful:</p>
      <ol>
        <li><strong>Reduce sodium intake</strong> — aim for less than 2,300 mg per day (ideally 1,500 mg)</li>
        <li><strong>Exercise regularly</strong> — 150 minutes of moderate activity per week</li>
        <li><strong>Maintain a healthy weight</strong> — even a 5 kg loss can lower blood pressure significantly</li>
        <li><strong>Limit alcohol</strong> — no more than 1–2 drinks per day</li>
        <li><strong>Quit smoking</strong> — smoking damages blood vessels and accelerates hypertension</li>
        <li><strong>Manage stress</strong> — chronic stress keeps blood pressure elevated</li>
        <li><strong>Sleep well</strong> — poor sleep is strongly linked to hypertension</li>
      </ol>

      <h2>The Role of Diet</h2>
      <p>The DASH diet (Dietary Approaches to Stop Hypertension) is one of the most studied dietary patterns for blood pressure management. It emphasizes:</p>
      <ul>
        <li>Fruits and vegetables (4–5 servings each per day)</li>
        <li>Whole grains</li>
        <li>Lean proteins and fish</li>
        <li>Low-fat dairy</li>
        <li>Reduced saturated fat and cholesterol</li>
      </ul>
      <p>Potassium-rich foods like bananas, spinach, and beans are particularly helpful because potassium helps counterbalance sodium's effects.</p>

      <h2>When Medication Is Necessary</h2>
      <p>Lifestyle changes are powerful, but sometimes medication is essential. Common antihypertensive classes include:</p>
      <ul>
        <li>ACE inhibitors (e.g., lisinopril)</li>
        <li>Angiotensin receptor blockers (ARBs)</li>
        <li>Calcium channel blockers</li>
        <li>Diuretics</li>
        <li>Beta-blockers</li>
      </ul>
      <p>Never stop or change medication without consulting your doctor.</p>

      <h2>Monitor at Home</h2>
      <p>Home blood pressure monitoring is one of the best investments you can make in your health. A validated upper-arm cuff costs modestly and gives you a real picture of your numbers over time — which is far more useful than a single reading at the doctor's office.</p>

      <h2>Key Takeaways</h2>
      <ul>
        <li>Hypertension is common, dangerous, and often symptomless</li>
        <li>Regular monitoring is essential — know your numbers</li>
        <li>Lifestyle changes can be as effective as medication for some people</li>
        <li>Combining diet, exercise, and stress management yields the best results</li>
        <li>Work with your healthcare provider — don't self-manage</li>
      </ul>

      <p class="medical-disclaimer"><strong>Medical Disclaimer:</strong> This article is for educational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.</p>
    `,
    categoryId: "heart-health",
    authorId: "dr-james-mensah",
    publishedAt: "2024-11-18T08:00:00Z",
    updatedAt: "2024-11-20T10:00:00Z",
    readingTime: 9,
    featured: true,
    editorsPick: true,
    image: "https://images.unsplash.com/photo-1628348070889-cb656235b4eb?w=1200&h=800&fit=crop",
    tags: ["Hypertension", "Heart Disease", "Stroke", "Prevention"],
    medicallyReviewed: true,
    reviewedBy: "dr-amara-okafor",
    views: 24871,
    likes: 1243,
    comments: 87,
  },
  {
    id: "gut-health-microbiome",
    slug: "gut-health-microbiome-complete-guide",
    title: "Your Gut Microbiome: A Complete Guide to the Bacteria That Run Your Body",
    excerpt: "The trillions of bacteria in your gut influence everything from immunity to mood. Here's the science — and the practical steps — behind a healthy microbiome.",
    content: `
      <p class="lead">Your gut is home to roughly 38 trillion microorganisms — bacteria, viruses, fungi, and more. Collectively known as the gut microbiome, this ecosystem weighs about 2 kg and plays a role in virtually every system in your body.</p>

      <h2>What Does the Microbiome Do?</h2>
      <p>Research over the past two decades has linked the gut microbiome to:</p>
      <ul>
        <li>Digestion and nutrient absorption</li>
        <li>Immune system regulation</li>
        <li>Metabolism and weight</li>
        <li>Brain function and mood (the gut-brain axis)</li>
        <li>Inflammation and autoimmune conditions</li>
      </ul>

      <h2>Signs Your Gut May Be Out of Balance</h2>
      <ul>
        <li>Frequent bloating, gas, or constipation</li>
        <li>Chronic fatigue</li>
        <li>Skin issues like eczema or acne</li>
        <li>Frequent infections</li>
        <li>Mood swings or anxiety</li>
      </ul>

      <h2>How to Support Your Microbiome</h2>
      <h3>1. Eat More Fiber</h3>
      <p>Aim for 25–35 g per day from vegetables, fruits, legumes, and whole grains. Fiber feeds beneficial bacteria and produces short-chain fatty acids that protect your gut lining.</p>

      <h3>2. Eat Fermented Foods</h3>
      <p>Yogurt, kefir, kimchi, sauerkraut, and miso introduce live beneficial bacteria. Studies suggest regular consumption increases microbiome diversity.</p>

      <h3>3. Limit Ultra-Processed Foods</h3>
      <p>Emulsifiers and artificial sweeteners may disrupt gut bacteria. Minimize packaged snacks, sodas, and processed meats.</p>

      <h3>4. Prioritize Sleep and Exercise</h3>
      <p>Both are strongly linked to microbiome diversity. Even modest exercise — 30 minutes of walking — makes a difference.</p>

      <h3>5. Be Cautious With Antibiotics</h3>
      <p>Antibiotics are life-saving but can decimate gut bacteria. Only use them when prescribed and consider probiotics after a course.</p>

      <h2>Probiotics vs. Prebiotics</h2>
      <p><strong>Probiotics</strong> are live beneficial bacteria. <strong>Prebiotics</strong> are the fibers that feed them. Both matter — and food sources are generally better than supplements for most people.</p>

      <h2>Key Takeaways</h2>
      <ul>
        <li>Your microbiome influences far more than digestion</li>
        <li>Fiber and fermented foods are the foundation of gut health</li>
        <li>Lifestyle — sleep, exercise, stress — matters</li>
        <li>Supplement claims are often ahead of the science</li>
      </ul>

      <p class="medical-disclaimer"><strong>Medical Disclaimer:</strong> This article is for educational purposes only and does not constitute medical advice. Consult a healthcare professional for personalized guidance.</p>
    `,
    categoryId: "nutrition",
    authorId: "sarah-njeri",
    publishedAt: "2024-11-15T09:30:00Z",
    updatedAt: "2024-11-17T11:00:00Z",
    readingTime: 7,
    featured: true,
    editorsPick: false,
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=800&fit=crop",
    tags: ["Gut Health", "Immunity", "Nutrition"],
    medicallyReviewed: true,
    reviewedBy: "dr-amara-okafor",
    views: 18432,
    likes: 892,
    comments: 64,
  },
  {
    id: "managing-anxiety-modern-life",
    slug: "managing-anxiety-modern-life-evidence-based-strategies",
    title: "Managing Anxiety in Modern Life: Evidence-Based Strategies That Actually Work",
    excerpt: "Anxiety disorders affect over 300 million people worldwide. Here's what actually helps — from CBT to lifestyle changes — without the wellness-industry noise.",
    content: `
      <p class="lead">Occasional anxiety is a normal human response. But when anxiety becomes persistent, overwhelming, or interferes with daily life, it may be an anxiety disorder — and it's one of the most treatable mental health conditions.</p>

      <h2>Understanding Anxiety</h2>
      <p>Anxiety disorders include generalized anxiety disorder (GAD), panic disorder, social anxiety disorder, and specific phobias. Common symptoms include:</p>
      <ul>
        <li>Persistent, uncontrollable worry</li>
        <li>Restlessness or feeling on edge</li>
        <li>Racing heart, sweating, trembling</li>
        <li>Difficulty concentrating</li>
        <li>Sleep disturbances</li>
      </ul>

      <h2>What Works: The Evidence</h2>
      <h3>Cognitive Behavioral Therapy (CBT)</h3>
      <p>CBT is the gold standard for anxiety. It helps you identify and challenge unhelpful thought patterns. Numerous studies show it's as effective as medication for many people — and the benefits last longer.</p>

      <h3>Medication</h3>
      <p>SSRIs and SNRIs are first-line medications for anxiety disorders. Benzodiazepines are effective short-term but carry dependence risk.</p>

      <h3>Exercise</h3>
      <p>Aerobic exercise has robust evidence for reducing anxiety symptoms. Even 20 minutes of moderate activity can produce measurable calming effects.</p>

      <h3>Mindfulness and Breathing</h3>
      <p>Slow diaphragmatic breathing activates the parasympathetic nervous system. Mindfulness-Based Stress Reduction (MBSR) has strong evidence for anxiety reduction.</p>

      <h3>Sleep Hygiene</h3>
      <p>Anxiety and poor sleep form a vicious cycle. Prioritizing consistent sleep and wake times is foundational.</p>

      <h2>What Doesn't Work (or Is Overhyped)</h2>
      <ul>
        <li>Most "detox" products</li>
        <li>Unregulated herbal supplements</li>
        <li>Alcohol (makes anxiety worse long-term)</li>
        <li>Avoidance — it reinforces anxiety</li>
      </ul>

      <h2>When to Seek Help</h2>
      <p>Seek professional support if anxiety:</p>
      <ul>
        <li>Lasts more than 6 months</li>
        <li>Interferes with work, relationships, or daily functioning</li>
        <li>Causes panic attacks</li>
        <li>Leads to avoidance of important activities</li>
      </ul>

      <h2>Key Takeaways</h2>
      <ul>
        <li>Anxiety disorders are common and highly treatable</li>
        <li>CBT and medication are both evidence-based first-line options</li>
        <li>Exercise, sleep, and breathing practices support recovery</li>
        <li>Beware of unregulated "anxiety cures"</li>
      </ul>

      <p class="medical-disclaimer"><strong>Medical Disclaimer:</strong> This article is for educational purposes only and does not constitute medical advice. If you are experiencing a mental health crisis, contact emergency services or a crisis line in your area.</p>
    `,
    categoryId: "mental-health",
    authorId: "dr-fatima-ali",
    publishedAt: "2024-11-12T07:15:00Z",
    updatedAt: "2024-11-14T09:00:00Z",
    readingTime: 8,
    featured: true,
    editorsPick: true,
    image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1200&h=800&fit=crop",
    tags: ["Anxiety", "Stress", "Depression"],
    medicallyReviewed: true,
    reviewedBy: "dr-amara-okafor",
    views: 31245,
    likes: 1876,
    comments: 142,
  },
  {
    id: "childhood-vaccination-schedule",
    slug: "childhood-vaccination-schedule-what-parents-need-to-know",
    title: "Childhood Vaccination Schedule: What Every Parent Needs to Know",
    excerpt: "Vaccines are one of the greatest public health achievements in history. Here's a clear, evidence-based guide to the childhood immunization schedule.",
    content: `
      <p class="lead">Vaccines prevent an estimated 4–5 million deaths every year worldwide. For parents, understanding the schedule can feel overwhelming — this guide cuts through the noise.</p>

      <h2>Why Vaccines Matter</h2>
      <p>Vaccines train the immune system to recognize and fight specific pathogens before you encounter them. They protect not only the vaccinated child but also those who cannot be vaccinated — a concept called herd immunity.</p>

      <h2>The Core Schedule (0–18 months)</h2>
      <ul>
        <li><strong>Birth:</strong> Hepatitis B, BCG (in many countries)</li>
        <li><strong>2 months:</strong> DTaP, IPV, Hib, PCV, Rotavirus, Hep B</li>
        <li><strong>4 months:</strong> Repeat of 2-month vaccines</li>
        <li><strong>6 months:</strong> DTaP, IPV, Hib, PCV, Hep B, flu (annual)</li>
        <li><strong>12–15 months:</strong> MMR, Varicella, Hep A, PCV booster, Hib booster</li>
        <li><strong>18 months:</strong> DTaP booster, Hep A booster</li>
      </ul>

      <h2>Common Concerns, Addressed</h2>
      <h3>"Too many vaccines too soon?"</h3>
      <p>Children's immune systems handle thousands of antigens daily. The vaccine schedule is designed to protect when children are most vulnerable.</p>

      <h3>"Do vaccines cause autism?"</h3>
      <p>No. This claim originated from a fraudulent 1998 paper that has been retracted. Dozens of large studies involving millions of children have found no link.</p>

      <h3>"Can I delay the schedule?"</h3>
      <p>Delaying leaves children unprotected during the highest-risk period. Discuss any concerns with your pediatrician.</p>

      <h2>What About Side Effects?</h2>
      <p>Most side effects are mild — soreness, low-grade fever, fussiness. Serious reactions are extremely rare (roughly 1 in a million for most vaccines).</p>

      <h2>Key Takeaways</h2>
      <ul>
        <li>Vaccines are safe, effective, and rigorously tested</li>
        <li>The schedule is designed to protect when children are most vulnerable</li>
        <li>Herd immunity protects those who cannot be vaccinated</li>
        <li>Talk to your pediatrician about any concerns</li>
      </ul>

      <p class="medical-disclaimer"><strong>Medical Disclaimer:</strong> This article is for educational purposes only. Always follow the guidance of your child's healthcare provider and local health authority.</p>
    `,
    categoryId: "child-health",
    authorId: "dr-kwame-asante",
    publishedAt: "2024-11-08T10:00:00Z",
    updatedAt: "2024-11-10T08:00:00Z",
    readingTime: 6,
    featured: false,
    editorsPick: true,
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&h=800&fit=crop",
    tags: ["Vaccination", "Child Health", "Prevention"],
    medicallyReviewed: true,
    reviewedBy: "dr-amara-okafor",
    views: 15678,
    likes: 723,
    comments: 58,
  },
  {
    id: "womens-heart-health",
    slug: "womens-heart-health-overlooked-risk",
    title: "Women's Heart Health: The Overlooked Risk Hiding in Plain Sight",
    excerpt: "Heart disease is the leading cause of death for women worldwide — yet symptoms are often missed and research lags behind. Here's what women need to know.",
    content: `
      <p class="lead">Heart disease kills more women than all cancers combined. Yet for decades, cardiovascular research focused almost exclusively on men, and women's symptoms are still frequently missed.</p>

      <h2>How Women's Heart Disease Differs</h2>
      <p>Women often experience different symptoms than men. While chest pain is common, women are more likely to report:</p>
      <ul>
        <li>Shortness of breath</li>
        <li>Fatigue</li>
        <li>Nausea or indigestion</li>
        <li>Pain in the neck, jaw, or back</li>
        <li>Dizziness</li>
      </ul>

      <h2>Unique Risk Factors for Women</h2>
      <ul>
        <li>Pregnancy complications (preeclampsia, gestational diabetes)</li>
        <li>Polycystic ovary syndrome (PCOS)</li>
        <li>Early menopause (before 45)</li>
        <li>Autoimmune conditions (lupus, rheumatoid arthritis)</li>
        <li>Depression and chronic stress</li>
      </ul>

      <h2>Prevention: What Works</h2>
      <ul>
        <li>Regular blood pressure and cholesterol checks</li>
        <li>Aerobic exercise — 150 minutes per week</li>
        <li>Mediterranean-style diet</li>
        <li>Stress management</li>
        <li>Not smoking</li>
        <li>Maintaining healthy weight</li>
      </ul>

      <h2>Advocating for Yourself</h2>
      <p>If you feel your symptoms are being dismissed, ask directly: "Could this be heart-related?" Request an EKG, stress test, or referral to a cardiologist if you're concerned.</p>

      <h2>Key Takeaways</h2>
      <ul>
        <li>Heart disease is the leading killer of women</li>
        <li>Symptoms often differ from men's</li>
        <li>Unique risk factors exist for women</li>
        <li>Self-advocacy is essential</li>
      </ul>

      <p class="medical-disclaimer"><strong>Medical Disclaimer:</strong> This article is for educational purposes only. Consult a healthcare provider for personalized advice.</p>
    `,
    categoryId: "womens-health",
    authorId: "dr-james-mensah",
    publishedAt: "2024-11-05T08:00:00Z",
    updatedAt: "2024-11-07T10:00:00Z",
    readingTime: 7,
    featured: false,
    editorsPick: true,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1200&h=800&fit=crop",
    tags: ["Heart Disease", "Women's Health", "Prevention"],
    medicallyReviewed: true,
    reviewedBy: "dr-amara-okafor",
    views: 12345,
    likes: 654,
    comments: 43,
  },
  {
    id: "malaria-prevention-2024",
    slug: "malaria-prevention-2024-whats-changed",
    title: "Malaria Prevention in 2024: What's Changed and What Hasn't",
    excerpt: "With new vaccines and evolving resistance patterns, malaria prevention looks different than it did a decade ago. Here's the current landscape.",
    content: `
      <p class="lead">Malaria remains one of the world's deadliest infectious diseases, with an estimated 249 million cases and 608,000 deaths in 2022. But the tools to fight it are evolving.</p>

      <h2>The New Malaria Vaccines</h2>
      <p>Two vaccines — RTS,S/AS01 and R21/Matrix-M — are now recommended by the WHO for children in moderate-to-high transmission areas. Both reduce severe malaria and death, though they don't replace other prevention measures.</p>

      <h2>Bed Nets Still Matter</h2>
      <p>Insecticide-treated nets remain one of the most cost-effective interventions. However, mosquito resistance to common insecticides is growing, driving development of next-generation nets.</p>

      <h2>Chemoprevention</h2>
      <p>Seasonal malaria chemoprevention (SMC) — giving antimalarial drugs to children during peak transmission — has saved hundreds of thousands of lives.</p>

      <h2>What Hasn't Changed</h2>
      <ul>
        <li>Prompt diagnosis and treatment save lives</li>
        <li>Vector control remains essential</li>
        <li>Pregnant women remain at high risk</li>
        <li>Travelers need prophylaxis</li>
      </ul>

      <h2>Key Takeaways</h2>
      <ul>
        <li>New vaccines are a major advance but not a silver bullet</li>
        <li>Bed nets, chemoprevention, and prompt treatment remain critical</li>
        <li>Resistance is an ongoing challenge</li>
      </ul>

      <p class="medical-disclaimer"><strong>Medical Disclaimer:</strong> This article is for educational purposes only. Consult a healthcare provider for personalized advice, especially if traveling to malaria-endemic regions.</p>
    `,
    categoryId: "infectious-disease",
    authorId: "dr-amara-okafor",
    publishedAt: "2024-11-01T09:00:00Z",
    updatedAt: "2024-11-03T11:00:00Z",
    readingTime: 6,
    featured: false,
    editorsPick: false,
    image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=1200&h=800&fit=crop",
    tags: ["Malaria", "Vaccination", "Public Health"],
    medicallyReviewed: true,
    reviewedBy: "dr-amara-okafor",
    views: 9876,
    likes: 432,
    comments: 29,
  },
  {
    id: "mens-preventive-health",
    slug: "mens-preventive-health-checklist-40s",
    title: "Men's Preventive Health: A Checklist for Your 40s and Beyond",
    excerpt: "Men are less likely to see a doctor regularly and more likely to die from preventable conditions. Here's a practical, evidence-based checklist.",
    content: `
      <p class="lead">Men live on average 5 years less than women worldwide. Much of this gap is preventable — driven by higher rates of cardiovascular disease, late diagnoses, and lower healthcare utilization.</p>

      <h2>Screening Checklist (40s)</h2>
      <ul>
        <li><strong>Blood pressure:</strong> Every 1–2 years</li>
        <li><strong>Cholesterol:</strong> Every 5 years (more often if risk factors)</li>
        <li><strong>Blood sugar / A1c:</strong> Every 3 years (annually if overweight)</li>
        <li><strong>Colorectal cancer:</strong> Starting at 45</li>
        <li><strong>Prostate:</strong> Discuss with doctor starting at 50 (45 if high risk)</li>
        <li><strong>Dental and eye exams:</strong> Regular</li>
      </ul>

      <h2>Lifestyle Priorities</h2>
      <ul>
        <li>Exercise: 150 minutes moderate aerobic + strength training 2x/week</li>
        <li>Diet: vegetables, whole grains, lean proteins, healthy fats</li>
        <li>Sleep: 7–9 hours</li>
        <li>Alcohol: minimize</li>
        <li>Smoking: quit</li>
      </ul>

      <h2>Mental Health Matters Too</h2>
      <p>Men are less likely to seek help for depression and anxiety. If you're struggling, talk to someone — a doctor, therapist, or trusted friend.</p>

      <h2>Key Takeaways</h2>
      <ul>
        <li>Preventive care saves lives</li>
        <li>Screening schedules vary by risk factors</li>
        <li>Lifestyle is the foundation</li>
        <li>Mental health is health</li>
      </ul>

      <p class="medical-disclaimer"><strong>Medical Disclaimer:</strong> This article is for educational purposes only. Consult a healthcare provider for personalized advice.</p>
    `,
    categoryId: "mens-health",
    authorId: "dr-james-mensah",
    publishedAt: "2024-10-28T08:00:00Z",
    updatedAt: "2024-10-30T09:00:00Z",
    readingTime: 5,
    featured: false,
    editorsPick: false,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop",
    tags: ["Prevention", "Cancer Screening", "Heart Disease"],
    medicallyReviewed: true,
    reviewedBy: "dr-amara-okafor",
    views: 8765,
    likes: 398,
    comments: 21,
  },
  {
    id: "sleep-science-2024",
    slug: "sleep-science-2024-what-we-know-now",
    title: "Sleep Science in 2024: What We Know Now (and Still Don't)",
    excerpt: "Sleep research has exploded in the past decade. Here's a clear-eyed look at what the evidence actually supports — and where the science is still catching up.",
    content: `
      <p class="lead">Sleep is arguably the most underrated health behavior. Chronic sleep deprivation is linked to cardiovascular disease, diabetes, obesity, depression, and impaired immunity.</p>

      <h2>How Much Sleep Do You Need?</h2>
      <p>Adults: 7–9 hours. Some people genuinely need less; most who think they do are wrong. Children and teens need more.</p>

      <h2>What the Evidence Says Helps</h2>
      <ul>
        <li>Consistent sleep and wake times (even weekends)</li>
        <li>Cool, dark, quiet bedroom</li>
        <li>Morning light exposure</li>
        <li>Limit caffeine after noon</li>
        <li>Regular exercise (but not right before bed)</li>
        <li>Wind-down routine</li>
      </ul>

      <h2>What Doesn't Help (or Is Overhyped)</h2>
      <ul>
        <li>Alcohol (disrupts REM sleep)</li>
        <li>Melatonin for chronic insomnia (modest effect, not a cure)</li>
        <li>Expensive "sleep trackers" with dubious accuracy</li>
        <li>Weekend "catch-up" sleep</li>
      </ul>

      <h2>When to See a Doctor</h2>
      <p>See a doctor if you snore heavily, wake gasping, have persistent insomnia, or feel exhausted despite adequate sleep. Sleep apnea is common and serious.</p>

      <h2>Key Takeaways</h2>
      <ul>
        <li>Sleep is foundational to health</li>
        <li>Consistency beats perfection</li>
        <li>Beware of expensive gadgets with weak evidence</li>
        <li>Sleep disorders are common and treatable</li>
      </ul>

      <p class="medical-disclaimer"><strong>Medical Disclaimer:</strong> This article is for educational purposes only. Consult a healthcare provider for personalized advice.</p>
    `,
    categoryId: "public-health",
    authorId: "sarah-njeri",
    publishedAt: "2024-10-25T07:30:00Z",
    updatedAt: "2024-10-27T10:00:00Z",
    readingTime: 6,
    featured: false,
    editorsPick: false,
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=1200&h=800&fit=crop",
    tags: ["Sleep", "Stress", "Public Health"],
    medicallyReviewed: true,
    reviewedBy: "dr-amara-okafor",
    views: 7654,
    likes: 321,
    comments: 18,
  },
  {
    id: "diabetes-type-2-prevention",
    slug: "type-2-diabetes-prevention-what-works",
    title: "Type 2 Diabetes Prevention: What Actually Works",
    excerpt: "Type 2 diabetes is largely preventable — but only if the interventions are evidence-based and sustainable. Here's what the research supports.",
    content: `
      <p class="lead">Over 500 million people worldwide live with type 2 diabetes, and the number is rising. The good news: major trials show that lifestyle changes can reduce risk by up to 58%.</p>

      <h2>Who Is at Risk?</h2>
      <ul>
        <li>Overweight or obese</li>
        <li>Family history of diabetes</li>
        <li>Physically inactive</li>
        <li>Over 45</li>
        <li>History of gestational diabetes</li>
        <li>Certain ethnic backgrounds</li>
      </ul>

      <h2>What Works: The Evidence</h2>
      <h3>Weight Loss</h3>
      <p>Losing 5–7% of body weight can dramatically reduce risk. The Diabetes Prevention Program showed this clearly.</p>

      <h3>Physical Activity</h3>
      <p>150 minutes per week of moderate activity (e.g., brisk walking) is the target. Adding strength training helps.</p>

      <h3>Dietary Changes</h3>
      <ul>
        <li>Reduce refined carbohydrates and added sugars</li>
        <li>Increase fiber and vegetables</li>
        <li>Choose whole grains over refined</li>
        <li>Healthy fats (olive oil, nuts, fish)</li>
      </ul>

      <h2>Medication for Prevention?</h2>
      <p>Metformin is sometimes used for high-risk individuals, particularly those with prediabetes. Lifestyle changes remain first-line.</p>

      <h2>Key Takeaways</h2>
      <ul>
        <li>Type 2 diabetes is largely preventable</li>
        <li>Weight loss, exercise, and diet are the foundation</li>
        <li>Medication is an option for high-risk individuals</li>
        <li>Small, sustainable changes beat dramatic short-term efforts</li>
      </ul>

      <p class="medical-disclaimer"><strong>Medical Disclaimer:</strong> This article is for educational purposes only. Consult a healthcare provider for personalized advice.</p>
    `,
    categoryId: "nutrition",
    authorId: "sarah-njeri",
    publishedAt: "2024-10-22T09:00:00Z",
    updatedAt: "2024-10-24T11:00:00Z",
    readingTime: 7,
    featured: false,
    editorsPick: true,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1200&h=800&fit=crop",
    tags: ["Diabetes", "Obesity", "Nutrition"],
    medicallyReviewed: true,
    reviewedBy: "dr-amara-okafor",
    views: 11234,
    likes: 567,
    comments: 38,
  },
  {
    id: "air-pollution-health",
    slug: "air-pollution-hidden-health-crisis",
    title: "Air Pollution: The Hidden Health Crisis Affecting Billions",
    excerpt: "Air pollution is linked to 7 million premature deaths annually. Here's what the science says about how it affects your body — and what you can do.",
    content: `
      <p class="lead">Air pollution is one of the largest environmental health risks of our time, affecting 99% of the global population to some degree. It's linked to heart disease, stroke, lung cancer, and respiratory infections.</p>

      <h2>How Air Pollution Affects the Body</h2>
      <ul>
        <li><strong>Lungs:</strong> Irritation, asthma exacerbation, COPD, lung cancer</li>
        <li><strong>Heart:</strong> Increased risk of heart attack and stroke</li>
        <li><strong>Brain:</strong> Emerging evidence links to cognitive decline</li>
        <li><strong>Pregnancy:</strong> Low birth weight, preterm birth</li>
      </ul>

      <h2>What You Can Do</h2>
      <ul>
        <li>Check local Air Quality Index (AQI) before outdoor exercise</li>
        <li>Use air purifiers indoors during high-pollution days</li>
        <li>Avoid burning wood or trash</li>
        <li>Support clean energy policies</li>
        <li>Wear N95 masks in heavily polluted environments</li>
      </ul>

      <h2>Global Context</h2>
      <p>Low- and middle-income countries bear the highest burden. Indoor air pollution from cooking with solid fuels remains a major issue.</p>

      <h2>Key Takeaways</h2>
      <ul>
        <li>Air pollution is a major global health threat</li>
        <li>Both outdoor and indoor sources matter</li>
        <li>Individual actions help; systemic change is essential</li>
      </ul>

      <p class="medical-disclaimer"><strong>Medical Disclaimer:</strong> This article is for educational purposes only. Consult a healthcare provider for personalized advice.</p>
    `,
    categoryId: "public-health",
    authorId: "dr-amara-okafor",
    publishedAt: "2024-10-18T08:00:00Z",
    updatedAt: "2024-10-20T09:00:00Z",
    readingTime: 6,
    featured: false,
    editorsPick: false,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=800&fit=crop",
    tags: ["Public Health", "Immunity", "Asthma"],
    medicallyReviewed: true,
    reviewedBy: "dr-amara-okafor",
    views: 6543,
    likes: 287,
    comments: 15,
  },
];

export const podcasts = [
  {
    id: "podcast-1",
    title: "The Heart of the Matter: Understanding Blood Pressure",
    description: "Dr. James Mensah joins us to break down what blood pressure really means, why hypertension is so dangerous, and what listeners can do today.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: "42:15",
    episodeNumber: 12,
    publishedAt: "2024-11-18T08:00:00Z",
    image: "https://images.unsplash.com/photo-1628348070889-cb656235b4eb?w=400&h=400&fit=crop",
    guests: ["Dr. James Mensah"],
  },
  {
    id: "podcast-2",
    title: "Gut Feelings: The Microbiome Revolution",
    description: "Sarah Njeri explains how the trillions of bacteria in your gut influence your mood, immunity, and metabolism.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: "38:42",
    episodeNumber: 11,
    publishedAt: "2024-11-11T08:00:00Z",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop",
    guests: ["Sarah Njeri"],
  },
  {
    id: "podcast-3",
    title: "Mental Health Matters: Breaking the Stigma",
    description: "Dr. Fatima Ali discusses anxiety, depression, and why seeking help is a sign of strength, not weakness.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: "45:08",
    episodeNumber: 10,
    publishedAt: "2024-11-04T08:00:00Z",
    image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=400&fit=crop",
    guests: ["Dr. Fatima Ali"],
  },
];

export const videos = [
  {
    id: "video-1",
    title: "How to Check Your Blood Pressure at Home (Correctly)",
    description: "A step-by-step guide to accurate home blood pressure monitoring.",
    youtubeId: "dQw4w9WgXcQ", // placeholder — replace with real health video
    duration: "5:24",
    category: "Heart Health",
    publishedAt: "2024-11-18T08:00:00Z",
    thumbnail: "https://images.unsplash.com/photo-1628348070889-cb656235b4eb?w=800&h=450&fit=crop",
  },
  {
    id: "video-2",
    title: "5 Evidence-Based Ways to Improve Your Gut Health",
    description: "Practical, science-backed steps to support your microbiome.",
    youtubeId: "dQw4w9WgXcQ",
    duration: "7:12",
    category: "Nutrition",
    publishedAt: "2024-11-11T08:00:00Z",
    thumbnail: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=450&fit=crop",
  },
];

export const trendingTopics = [
  "Hypertension", "Gut Health", "Anxiety", "Type 2 Diabetes", "Sleep", "Air Pollution",
];