"use client";
import React, { useEffect, useRef, useState } from 'react';

interface NumberTickerProps {
  value: number;
  duration?: number;
  className?: string;
  decimalPlaces?: number;
}

export function NumberTicker({ 
  value, 
  duration = 2000, 
  className = '',
  decimalPlaces = 0 
}: NumberTickerProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const endValue = value;

    const updateCount = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function for smooth animation (easeOutQuart)
      const easeOut = 1 - Math.pow(1 - progress, 4);
      
      const currentCount = easeOut * endValue;
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(endValue);
      }
    };

    requestAnimationFrame(updateCount);
  }, [value, duration, isVisible]);

  const formatNumber = (num: number) => {
    if (decimalPlaces > 0) {
      return num.toFixed(decimalPlaces);
    }
    return Math.floor(num).toLocaleString();
  };

  return (
    <span ref={ref} className={className}>
      {formatNumber(count)}
    </span>
  );
}
