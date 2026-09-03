const fs = require('fs');

const content = fs.readFileSync('src/data/products.ts', 'utf8');

let arrayStr = content.substring(content.indexOf('['));
if (arrayStr.endsWith(';')) arrayStr = arrayStr.slice(0, -1);
if (arrayStr.endsWith(';\n')) arrayStr = arrayStr.slice(0, -2);

const allProducts = eval('(' + arrayStr + ')');

const defaultRespUse = "RAW Official products are designed to support active lifestyles and performance routines. Supplements should be used as directed on the label and are not intended to diagnose, treat, cure, or prevent disease. Always consult a qualified professional if pregnant, taking medication, under 18, or managing a health condition.";

function getCautionLevel(name, category) {
    const n = name.toLowerCase();
    if (n.includes('melatonin') || n.includes('5-htp') || n.includes('gaba') || n.includes('liver') || n.includes('kidney') || n.includes('testosterone') || n.includes('tongkat')) {
        return 'high';
    }
    if (category === 'Accessories' || category === 'Apparel') return 'low';
    if (n.includes('protein') || n.includes('bcaa') || n.includes('water bottle')) return 'low';
    return 'medium';
}

function getProductType(category) {
    if (category === 'Nutrients') return 'supplement';
    if (category === 'Apparel') return 'apparel';
    if (category === 'Accessories') return 'accessory';
    if (category === 'Recovery' || category === 'Combat') return 'equipment';
    return 'supplement';
}

function getStackRole(name, category) {
    const n = name.toLowerCase();
    if (n.includes('protein') || n.includes('mass') || n.includes('creatine')) return 'foundation';
    if (n.includes('pre-workout') || n.includes('electrolyte') || n.includes('energy') || n.includes('shilajit')) return 'performance';
    if (n.includes('sleep') || n.includes('melatonin') || n.includes('ashwagandha') || n.includes('magnesium') || n.includes('calm') || n.includes('5-htp') || n.includes('lounger')) return 'sleep';
    if (category === 'Recovery' || n.includes('bcaa') || n.includes('ice bath')) return 'recovery';
    if (n.includes('testosterone') || n.includes('tongkat')) return 'vitality';
    if (n.includes('water bottle') || n.includes('shaker') || category === 'Accessories') return 'utility';
    if (category === 'Combat') return 'combat';
    if (n.includes('nad') || n.includes('nmn') || n.includes('resveratrol') || n.includes('turmeric') || n.includes('lion')) return 'longevity';
    return 'foundation';
}

function getGoalTags(stackRole) {
    const map = {
        foundation: ["Build Muscle", "General Wellness", "Beginner Foundation"],
        performance: ["Boost Energy", "Combat Training"],
        recovery: ["Recover Faster", "Mobility Support"],
        sleep: ["Improve Sleep", "Daily Wellness"],
        vitality: ["Boost Energy", "General Wellness"],
        combat: ["Combat Training", "Recover Faster"],
        utility: ["Hydration"],
        longevity: ["Longevity", "Daily Wellness"],
        calm: ["Improve Sleep"],
        hydration: ["Hydration"],
        mobility: ["Joint/Mobility Support"]
    };
    return map[stackRole] || ["General Wellness"];
}

const updatedProducts = allProducts.map(p => {
    const cautionLevel = p.cautionLevel || getCautionLevel(p.name, p.category);
    const productType = p.productType || getProductType(p.category);
    const stackRole = p.stackRole || getStackRole(p.name, p.category);
    
    let responsibleUse = p.responsibleUse;
    if (!responsibleUse && (p.category === 'Nutrients' || productType === 'supplement')) {
        responsibleUse = defaultRespUse;
    }
    
    let specificNote = undefined;
    if (p.name.includes('Melatonin')) {
        specificNote = "May cause drowsiness. Do not drive or operate machinery after use. Avoid combining with alcohol, sedatives, or other sleep aids unless advised by a qualified professional.";
    } else if (p.name.includes('5-HTP') || p.name.includes('GABA')) {
        specificNote = "Consult a qualified professional before use if taking antidepressants, sedatives, or medication affecting mood or sleep.";
    } else if (p.name.includes('L-Arginine')) {
        specificNote = "Consult a qualified professional before use if taking blood pressure medication, heart medication, or medication affecting circulation.";
    } else if (p.name.toLowerCase().includes('kidney') || p.name.toLowerCase().includes('liver')) {
        specificNote = "Do not use as a treatment for kidney, liver, or medical conditions. Seek professional advice if under medical supervision.";
    }
    
    if (specificNote && responsibleUse && !responsibleUse.includes(specificNote)) {
        responsibleUse = responsibleUse + " " + specificNote;
    }
    
    // Explicit manual pairings over random
    let pairings = p.protocolPairings || [];
    if (pairings.length === 0) {
        if (p.name.includes('Creatine')) pairings = ["Protein Peptide Powder (700g)", "Whey Protein Powder (2.3kg)", "Electrolyte Drink Mix", "Gold Standard Pre-Workout (300g)", "RAW Official Protein Shaker Bottle"];
        else if (p.name.includes('Ice Bath')) pairings = ["Electrolyte Drink Mix", "Magnesium (Triple Complex)", "RAW Official Water Bottle + mini RAW towel", "RAW Multi-Purpose Travel Lounger", "BCAA 2:1:1 Recovery Gummies"];
        else if (p.name.includes('Shorts')) pairings = ["RAW Official 4oz Gloves", "RAW Official Sports T-shirt", "Electrolyte Drink Mix", "Gold Standard Pre-Workout (300g)", "RAW Official Water Bottle + mini RAW towel"];
        else if (stackRole === 'sleep') pairings = ["Magnesium (Triple Complex)", "Melatonin Gummies", "5-HTP & GABA Utopia Gummies", "High-Potency Ashwagandha Gummies", "RAW Multi-Purpose Travel Lounger"];
        else if (p.name.toLowerCase().includes('electrolyte') || p.name.toLowerCase().includes('water')) pairings = ["Electrolyte Drink Mix", "RAW Official Water Bottle + mini RAW towel", "BCAA Powder (540g)", "Creatine Monohydrate (300g)", "RAW Official Cool Box + mini RAW towel"];
        else pairings = ["RAW Official Protein Shaker Bottle", "Electrolyte Drink Mix"];
    }

    // Filter self out of pairings
    pairings = pairings.filter(name => name !== p.name);
    
    return {
        ...p,
        stockStatus: p.stockStatus || "AVAILABLE",
        shortBenefit: p.shortBenefit || `Premium ${p.category.toLowerCase()} support.`,
        overview: p.overview || `A core addition to the RAW Official ${p.category.toLowerCase()} lineup, designed to complement your active lifestyle.`,
        whatItDoes: p.whatItDoes || "Supports your performance routine by providing essential elements.",
        keyBenefits: p.keyBenefits || ["Supports active lifestyle", "Premium quality", "Convenient format", "Designed for results"],
        whoItsFor: p.whoItsFor || ["Athletes", "Fitness enthusiasts", "Beginners", "Performance seekers"],
        suggestedUse: p.suggestedUse || "Please follow the guidelines provided on the product label.",
        protocolPairings: pairings,
        qualityNotes: p.qualityNotes || ["Lab tested", "Premium ingredients", "Responsibly sourced"],
        responsibleUse: responsibleUse || undefined,
        protocolTags: p.protocolTags || ["performance", "recovery", p.category.toLowerCase(), stackRole],
        goalTags: p.goalTags || getGoalTags(stackRole),
        cautionLevel,
        productType,
        idealTime: p.idealTime || "anytime",
        stackRole
    };
});

const fileContent = `import { Product } from '../types';

export const allProducts: Product[] = ${JSON.stringify(updatedProducts, null, 2)};
`;

fs.writeFileSync('src/data/products.ts', fileContent);
console.log("Updated products.ts successfully with all required fields!");
