import { motion, useMotionValue, useSpring, useMotionTemplate } from "motion/react";
import { useEffect } from "react";

export default function MouseBlob() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 40, stiffness: 120 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Secondary, lighter blob
  const cursorXSpring2 = useSpring(cursorX, { damping: 60, stiffness: 80 });
  const cursorYSpring2 = useSpring(cursorY, { damping: 60, stiffness: 80 });

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 250);
      cursorY.set(e.clientY - 250);
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Primary Blob */}
      <motion.div
        style={{
          translateX: cursorXSpring,
          translateY: cursorYSpring,
        }}
        className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full bg-red-600/10 blur-[150px] pointer-events-none z-[100] mix-blend-screen"
      />
      {/* Secondary Blob */}
      <motion.div
        style={{
          translateX: cursorXSpring2,
          translateY: cursorYSpring2,
        }}
        className="fixed top-0 left-0 w-[300px] h-[300px] rounded-full bg-red-900/15 blur-[100px] pointer-events-none z-[99] mix-blend-screen"
      />
    </>
  );
}
