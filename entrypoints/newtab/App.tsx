import React, { useState, useEffect } from 'react';
import { store } from '../../lib/storage';
import { Onboarding } from '../../components/Onboarding';
import { Greeting } from '../../components/Greeting';
import { Clock } from '../../components/Clock';
import { DailyFocus } from '../../components/DailyFocus';
import { Wallpaper } from '../../components/Wallpaper';
import { WeatherCard } from '../../components/WeatherCard';
import { TaskPanel, TaskInput } from '../../components/TaskList';
import { FocusToggle } from '../../components/FocusToggle';
import { BookmarksPanel } from '../../components/BookmarksPanel';
import { RecentlyClosed } from '../../components/RecentlyClosed';
import { CommandSearch } from '../../components/CommandSearch';
import { ReadLaterSection } from '../../components/ReadLaterSection';
import { Pomodoro } from '../../components/Pomodoro';

export default function App() {
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    store.focusModeOn.getValue().then(setFocusMode);
    const unwatch = store.focusModeOn.watch(val => {
      if (val !== undefined) setFocusMode(val);
    });
    return () => { unwatch(); };
  }, []);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <Wallpaper />
      <Onboarding />
      <FocusToggle />
      <TaskPanel />
      {!focusMode && <BookmarksPanel />}
      {!focusMode && <RecentlyClosed />}
      
      {/* Main Column (Hidden in Focus Mode) */}
      {!focusMode && (
        <div 
          className="relative z-10 flex flex-col items-center justify-center p-12 rounded-3xl"
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.25)', 
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}
        >
          <Greeting />
          <Clock />
          <DailyFocus />
          <Pomodoro />
          <CommandSearch />
          <TaskInput />
          <ReadLaterSection />
        </div>
      )}

      {/* Focus Mode View */}
      {focusMode && (
        <div className="relative z-10 flex flex-col items-center justify-center scale-[1.15] transition-transform duration-700 mt-[-5vh]">
          <DailyFocus />
          <Pomodoro />
        </div>
      )}

      {!focusMode && <WeatherCard />}
    </div>
  );
}
