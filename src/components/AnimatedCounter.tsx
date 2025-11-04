import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1.5,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const springValue = useSpring(0, { duration: duration * 1000 });

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(latest);
    });

    return () => unsubscribe();
  }, [springValue]);

  const formattedValue = displayValue.toFixed(decimals);

  return (
    <span className={className}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}

export function useAnimatedCounter(target: number, duration: number = 1.5) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);

  useEffect(() => {
    const start = countRef.current;
    const end = target;
    const startTime = Date.now();
    const durationMs = duration * 1000;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);

      const current = Math.floor(start + (end - start) * easedProgress);
      setCount(current);
      countRef.current = current;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
}
