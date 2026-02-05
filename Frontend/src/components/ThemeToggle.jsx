import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.documentElement.classList.add('light');
      setIsLight(true);
    }
  }, []);

  const toggle = () => {
    if (isLight) {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
      setIsLight(false);
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
      setIsLight(true);
    }
  };

  return (
    <button
      onClick={toggle}
      className="px-2 py-1 rounded bg-transparent-600 border border-[var(--border-dark)] rounded-xl"
      aria-label="Toggle theme"
    >

      <img src="..\src\assets\brightness-and-contrast.png" alt="" width={20}/>
    </button>
  );
};

export default ThemeToggle;
