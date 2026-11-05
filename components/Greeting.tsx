import React, { useState, useEffect, useRef } from 'react';
import { store } from '../lib/storage';
import { getGreeting } from '../lib/greeting';

export function Greeting() {
  const [name, setName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Load name and update greeting
  useEffect(() => {
    store.settings.getValue().then((settings) => {
      setName(settings.name || '');
      setGreeting(getGreeting(settings.name || ''));
    });

    const unwatch = store.settings.watch((settings) => {
      if (settings) {
        setName(settings.name || '');
        setGreeting(getGreeting(settings.name || ''));
      }
    });

    // Update greeting string every 60 seconds
    const interval = setInterval(() => {
      setGreeting(getGreeting(name));
    }, 60000);

    return () => {
      unwatch();
      clearInterval(interval);
    };
  }, [name]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const saveName = async () => {
    setIsEditing(false);
    const settings = await store.settings.getValue();
    await store.settings.setValue({ ...settings, name: name.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveName();
  };

  return (
    <div className="flex justify-center text-center mb-2">
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[var(--fg)] drop-shadow-md cursor-pointer transition-opacity hover:opacity-80 flex items-center justify-center gap-2" onClick={() => setIsEditing(true)}>
        {greeting.split(',')[0]}
        {greeting.includes(',') ? ',' : ''}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="bg-transparent border-b border-[var(--fg)] outline-none text-center min-w-[50px] p-0"
            style={{ width: `${Math.max(name.length, 1)}ch` }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <span className="ml-1">{name}</span>
        )}
      </h1>
    </div>
  );
}
