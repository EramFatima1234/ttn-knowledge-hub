"use client";

import { animate, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

export default function AnimatedNumber({
  value,
  decimals = 0,
  suffix = "",
  className,
}: AnimatedNumberProps) {
  const motionVal = useMotionValue(0);
  const [text, setText] = useState(
    decimals > 0 ? `0.${"0".repeat(decimals)}${suffix}` : `0${suffix}`,
  );

  useEffect(() => {
    const ctrl = animate(motionVal, value, { duration: 0.7, ease: "easeOut" });
    return () => ctrl.stop();
  }, [motionVal, value]);

  useMotionValueEvent(motionVal, "change", (latest) => {
    const formatted =
      decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toString();
    setText(`${formatted}${suffix}`);
  });

  return <span className={className}>{text}</span>;
}
