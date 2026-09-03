export interface BookPage {
  pageNumber: number; // 1-based page number
  content: string;
  title?: string;
  annotations?: { id: string; text: string; location: string; color: string }[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  category: "Tactical" | "Nutrition" | "Recovery" | "Mindset";
  pages: BookPage[];
}

export const booksData: Book[] = [
  {
    id: "book-01",
    title: "RAW Tactical Protocols // V1",
    author: "Tactical Command Board",
    coverImage: "https://rawofficial.co/wp-content/uploads/2026/02/NMN-Capsules-Mockup-scaled.png",
    description: "The complete operative field handbook covering cardiovascular endurance, functional power, and stress adaptation protocols.",
    category: "Tactical",
    pages: [
      { pageNumber: 1, title: "Mission Readiness Statement", content: "Physical capability is the ultimate currency. This document outlines the protocols required to build a resilient kinetic engine capable of sustaining high anaerobic workloads, sudden environmental shifts, and fast cognitive reaction times." },
      { pageNumber: 2, title: "Aerobic Capacity Baseline", content: "Aerobic development underpins all performance. Formulate a 12-week progression consisting of zone-2 low-intensity runs, stationary-rower intervals, and heavy ruck conditioning to build central mitochondrion density and stroke volume capacity." },
      { pageNumber: 3, title: "Dynamic Strength Mobilisation", content: "Prepare the joint capsules prior to heavy loading. Utilize multi-planar movements, band-distracted hip openers, and scapular wall slides. Never step under a bar cold; cold tissue breaks; hot tissue deforms and adapts." },
      { pageNumber: 4, title: "The 110% Overdrive Principle", content: "To reach 110% capacity, you must selectively push beyond local lactate clearance limits. Set high-intensity intervals at 3-minute blocks with 1-minute passive recovery, forcing the nervous system to coordinate under deep muscular acidosis." },
      { pageNumber: 5, title: "Heavy Load Carries", content: "Carrying awkward loads builds deep armor. Incorporate farmer's walks, sandbag carries, and unilateral overhead holds. This structural conditioning secures the spine, strengthens transverse abdominals, and thickens connective tissues." },
      { pageNumber: 6, title: "Sleep as an Offensive Weapon", content: "Recovery is not passive. Sleep is an active, aggressive process where hormone pathways are reset and cell damage is repaired. Target 8 hours: no blue light 90 minutes before sleep, ambient temperature under 19 degrees." },
      { pageNumber: 7, title: "Tactical Food Allocation", content: "Intake must match mechanical force requirements. High carbohydrates on heavy conditioning days; elevated proteins on recovery days. Eliminate refined vegetable oils, artificial syrups, and unmeasured meals." },
      { pageNumber: 8, title: "Water and Mineral Ratio", content: "Dehydration of just 2% decreases physical work capacity by up to 15%. Dose 400ml of mineralized water with 500mg sodium, 150mg potassium, and 50mg magnesium every 2 hours during high heating stress blocks." },
      { pageNumber: 9, title: "Cognitive Load and Sensory Reset", content: "The human processing unit can only sustain continuous vigilance for 90 minutes before output quality decays. Implement sensory-deprivation breathing protocols consisting of a 4-second box cycles to lower pulse rate." },
      { pageNumber: 10, title: "Module Selection Matrix", content: "This concludes the initial baseline public doctrines. Analyze your current strength-to-weight ratio to select whether to enter Phase II (Hypertrophy/Power) or Phase III (Speed/Conditioning). Prepare to progress." },
      { pageNumber: 11, title: "Phase II: Anaerobic Lactate Power", content: "SECRET CONTENT - This page contains premium field tactical parameters. The lactate power program utilizes extreme resistance bands paired with compound kettlebell complexes for maximum nervous output." },
      { pageNumber: 12, title: "Section 12: Advanced Rucking Formulas", content: "SECRET CONTENT - Military-grade progression formulas matching pack weight to gradient angles to build unilateral structural core power." },
      { pageNumber: 13, title: "Section 13: Neuromuscular Speed Tuning", content: "SECRET CONTENT - Speed tuning protocols utilizing overspeed resistance cords and dynamic reaction lasers to decrease reaction response window under 120ms." },
      { pageNumber: 14, title: "Section 14: Fast-Twist Activation", content: "SECRET CONTENT - Plyometric shock-method depths tailored to athletes needing immediate vertical clearance expansions." },
      { pageNumber: 15, title: "Section 15: Extreme Altitude Adaptability", content: "SECRET CONTENT - Controlled hypoxia training protocols designed to induce blood-volume expansion safely without synthetic drugs." }
    ]
  },
  {
    id: "book-02",
    title: "Neuro-Restoration and Biological Reset",
    author: "N-Systems Research Panel",
    coverImage: "https://rawofficial.co/wp-content/uploads/2026/02/Turmeric-Gummies-Mockup-scaled.png",
    description: "A deep clinical review on downregulating the sympathetic nervous system, optimizing biological bio-rhythms, and repairing muscle structures.",
    category: "Recovery",
    pages: [
      { pageNumber: 1, title: "Stress Pathways Introduction", content: "The modern environment keeps the human organism under a continuous state of low-grade threat. Cortisol remains persistently elevated, downregulating key repair systems, immune functions, and sleep quality." },
      { pageNumber: 2, title: "The Chronobiological Clock", content: "Align your behavior with the earth's solar orbit. View 10 minutes of direct, unfiltered morning sunlight within 1 hour of waking to set the pineal clock. This ensures melatonin secretion begins precisely 14 hours later." },
      { pageNumber: 3, title: "Sympathetic Dampening Techniques", content: "Learn to step off the gas. After training, immediately sit in a quiet dark room. Execute the 'Physiological Sigh': two quick deep inhales through the nose, followed by a long, slow sigh out of the mouth." },
      { pageNumber: 4, title: "Active Rest Protocols", content: "Differentiate active rest from passive resting. Active rest requires low-intensity mobility, conscious breathing, and mindful walking. It accelerates lactic flushing and promotes lymphatic circulation without micro-trauma." },
      { pageNumber: 5, title: "Thermic Shock Adaptations", content: "Exposing the body to short bursts of extreme cold activates brown fat, floods the brain with norepinephrine, and dramatically downregulates muscle inflammation. Execute 3 minutes at 4 degrees Celsius." },
      { pageNumber: 6, title: "Hyperthermic Growth Factors", content: "Sauna exposure of 20 minutes at 90 degrees Celsius elevates growth hormone and upregulates Heat Shock Proteins (HSP). HSPs act as molecular chaperones, repairing damaged cellular proteins instantly." },
      { pageNumber: 7, title: "Biological Supplement Stack", content: "To support structural cellular sleep, consume Magnesium L-Threonate for brain barrier crossing, L-Theanine for alpha-wave induction, and Apigenin for sensory calming 60 minutes prior to bed." },
      { pageNumber: 8, title: "Myofascial Shear Mechanics", content: "Muscle fibers adhere due to repetitive motion and dynamic stress. Utilize soft trigger tools on high-density foam rollers to release localized knots. Maintain 60 seconds of steady, direct pressure." },
      { pageNumber: 9, title: "Metabolic Clearance Pathways", content: "Muscle catabolism produces nitrogenous waste and lactic byproducts. Maintain fluid intake above 3.5 liters with organic citrus additions to assist hepatic filtration and renal clearance cycles." },
      { pageNumber: 10, title: "End of Free Science Modules", content: "This marks the end of the public recovery sequence modules. The remaining sections detail proprietary botanical extraction methods and custom bio-hacking parameters." },
      { pageNumber: 11, title: "Sub-cellular Mitochondria Repair", content: "SECRET CONTENT - Clinical dosages of coenzyme Q10 matched to acetyl-l-carnitine for repairing cell walls damaged by long-term high-intensity training blocks." },
      { pageNumber: 12, title: "Advanced Endocrine Tuning", content: "SECRET CONTENT - Adjusting natural hormone production blocks through specific lipid profiles, trace minerals, and targeted adaptogens." },
      { pageNumber: 13, title: "Sleep Architecture Alteration", content: "SECRET CONTENT - Modifying sleep cycles with micro-dosed amino acid combinations to prolong deep stage-4 sleep and optimize cell reproduction fields." }
    ]
  },
  {
    id: "book-03",
    title: "Combat Nutrition and Energy Systems",
    author: "Dietary Science Division",
    coverImage: "https://rawofficial.co/wp-content/uploads/2026/02/Turmeric-Gummies-Mockup-scaled.png",
    description: "Nutrition guidelines for fighters, combat athletes, and intense conditioning blocks where stamina, strength, and cognitive clarity must meet.",
    category: "Nutrition",
    pages: [
      { pageNumber: 1, title: "Preamble to Combat Nutrition", content: "In a fight, energy is your life force. If your biological engine starves, your guard drops, your reflexes slow, and failure follows. Combat nutrition is not about calorie restriction; it is about maximum fueling efficiency." },
      { pageNumber: 2, title: "Glycogen Loading Parameters", content: "Supercompensate muscle glycogen stores prior to high-volume sparring blocks. Consume 8-10g of low-glycemic complex carbohydrates per kilogram of body weight over 36 hours before intense sparring." },
      { pageNumber: 3, title: "Electrolyte Balance & Muscle Cramps", content: "Sweat loss drains critical minerals, leading to neural misfires and severe cramping. Maintain a tight 3:1 ratio of sodium to potassium in all active hydration mixtures during extreme conditioning." },
      { pageNumber: 4, title: "Inter-round Fast Energy", content: "When energy crashes, reach for rapid-absorbing glucose gels paired with cyclic dextrin. These pass through gastric clearance instantly, fueling blood sugar without causing digestive discomfort." },
      { pageNumber: 5, title: "Amino Acid Restructuring", content: "Training breaks down lean fibers. Deliver a constant flow of essential amino acids (EAAs) to the muscles to stop catabolism and trigger IMMEDIATE repair. Consume 15g EAAs post-workout." },
      { pageNumber: 6, title: "Anti-Inflammatory Nutritional Force", content: "High-impact combat causes widespread systemic inflammation. Consume high-dose Omega-3 fatty acids, raw turmeric root, ginger extracts, and blueberries to speed up soft tissue repair." },
      { pageNumber: 7, title: "The Ketogenic Power Shift", content: "For hyper-endurance without sudden crashes, train your body to utilize ketones. Gradually reduce carbs while increasing clean MCTs, grass-fed butter, and healthy avocado lipids." },
      { pageNumber: 8, title: "Cognitive Focus and Choline", content: "Combat speeds up decision matrices. Supplement with Alpha-GPC and L-Tyrosine 45 minutes before sparring to increase brain acetylcholine reserves, sharpening tunnel focus and processing speed." },
      { pageNumber: 9, title: "Gut Microbiome integrity", content: "A stressed digestive system cannot absorb nutrients. Include daily fermented proteins, glutamine peptide complexes, and high-strength lactobacillus strains to maintain gut health." },
      { pageNumber: 10, title: "Pre-Fight Weight Depletion Control", content: "This concludes the initial nutritional guidance manual. Subscribed operatives can unlock Phase IV: Clinical cutting protocols for rapid weigh-ins and optimal strength preservation." },
      { pageNumber: 11, title: "Phase IV: Scientific Water Loading", content: "SECRET CONTENT - Step-by-step water manipulatory protocols descending from 8 liters daily to 1 liter, inducing temporary hyper-excretion to shed subcutaneous weight safely." },
      { pageNumber: 12, title: "Rehydration Architecture", content: "SECRET CONTENT - Exact carbohydrate-to-mineral ratios required to expand cell volume by 120% in the 24 hours post-weigh-in." },
      { pageNumber: 13, title: "Endogenous Heat Generation", content: "SECRET CONTENT - Utilizing thermogenic spice extracts to accelerate resting calorie burn and lean mass preservation under high stress." }
    ]
  }
];
