import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';

export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = dayjs(time).format('dddd, MMMM D');

  return (
    <div className="flex flex-col items-center justify-center mb-6 drop-shadow-lg">
      <div className="text-[6rem] md:text-[8rem] font-bold tracking-tighter leading-none text-[var(--fg)]">
        {timeString}
      </div>
      <div className="text-xl md:text-2xl font-medium text-[var(--muted)] mt-2">
        {dateString}
      </div>
    </div>
  );
}
