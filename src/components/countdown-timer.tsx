'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    // Calculate immediately
    calculateTimeLeft();
    
    // Then update every second
    const timer = setInterval(calculateTimeLeft, 1000);
    
    // Cleanup
    return () => clearInterval(timer);
  }, [targetDate]);

  // Format single digit numbers with leading zero
  const formatNumber = (num: number) => (num < 10 ? `0${num}` : num);

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 sm:gap-2">
        <div className="flex flex-col items-center">
          <span className="text-xl sm:text-2xl font-bold text-purple-600">
            {formatNumber(timeLeft.days)}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-600">Days</span>
        </div>
        <span className="text-xl font-bold text-slate-400">:</span>
        <div className="flex flex-col items-center">
          <span className="text-xl sm:text-2xl font-bold text-blue-600">
            {formatNumber(timeLeft.hours)}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-600">Hours</span>
        </div>
        <span className="text-xl font-bold text-slate-400">:</span>
        <div className="flex flex-col items-center">
          <span className="text-xl sm:text-2xl font-bold text-green-600">
            {formatNumber(timeLeft.minutes)}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-600">Minutes</span>
        </div>
        <span className="text-xl font-bold text-slate-400">:</span>
        <div className="flex flex-col items-center">
          <span className="text-xl sm:text-2xl font-bold text-orange-600">
            {formatNumber(timeLeft.seconds)}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-600">Seconds</span>
        </div>
      </div>
    </div>
  );
}
