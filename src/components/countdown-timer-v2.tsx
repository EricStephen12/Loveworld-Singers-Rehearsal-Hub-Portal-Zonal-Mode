'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerV2Props {
  targetDate: Date;
  onComplete?: () => void;
  className?: string;
}

export function CountdownTimerV2({ targetDate, onComplete, className = '' }: CountdownTimerV2Props) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
        if (onComplete) {
          onComplete();
        }
      }
    };

    // Calculate immediately
    calculateTimeLeft();
    
        const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  const formatNumber = (num: number) => (num < 10 ? `0${num}` : num);

  if (isExpired) {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-2xl font-bold text-red-600">
          Event Started!
        </div>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
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


