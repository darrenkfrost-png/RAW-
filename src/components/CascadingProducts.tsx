import React from 'react';
import { motion } from 'motion/react';
import { allProducts } from '../data/products';

export default function CascadingProducts() {
  const products = allProducts.slice(0, 10); // Take a subset

  return (
    <div className="absolute inset-0 z-20 flex justify-center overflow-hidden pointer-events-none" aria-hidden="true">
       {products.map((product, i) => (
         <motion.div
           key={product.id}
           initial={{ y: -500, opacity: 0 }}
           animate={{ y: [0, 800], opacity: [0, 1, 0] }}
           transition={{ 
             duration: 5, 
             delay: i * 0.4, 
             ease: "linear",
             repeat: Infinity 
           }}
           className="absolute w-32 flex flex-col items-center"
           style={{ left: `${(i * 12) + 5}%` }}
         >
           <img src={product.image} alt={product.name} className="w-24 h-24 object-contain" />
           <p className="text-editorial-text text-[0.6875rem] mt-2 text-center uppercase tracking-widest">{product.name}</p>
         </motion.div>
       ))}
       
       <motion.div 
         initial={{ opacity: 0, scale: 0.8 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ delay: 1, duration: 1 }}
         className="absolute top-1/2 -translate-y-1/2 text-center"
       >
         <img src="/brand/raw-logo-red.png" alt="RAW Official" className="h-16 md:h-20 object-contain mx-auto drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]" />
       </motion.div>
    </div>
  );
}
