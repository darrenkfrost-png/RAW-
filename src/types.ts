export interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  description?: string;
  stockStatus?: 'AVAILABLE' | 'LOW_STOCK' | 'COMING_SOON' | 'OUT_OF_STOCK' | 'PREORDER_READY';
  shortBenefit?: string;
  overview?: string;
  whatItDoes?: string;
  keyBenefits?: string[];
  whoItsFor?: string[];
  suggestedUse?: string;
  protocolPairings?: string[];
  qualityNotes?: string[] | string;
  responsibleUse?: string;
  protocolTags?: string[];
  goalTags?: string[];
  cautionLevel?: 'low' | 'medium' | 'high';
  productType?: 'supplement' | 'equipment' | 'apparel' | 'accessory';
  idealTime?: 'morning' | 'pre-workout' | 'intra-workout' | 'post-workout' | 'evening' | 'anytime';
  stackRole?: 'foundation' | 'performance' | 'recovery' | 'hydration' | 'sleep' | 'vitality' | 'combat' | 'utility' | 'longevity' | 'calm' | 'mobility';
}
