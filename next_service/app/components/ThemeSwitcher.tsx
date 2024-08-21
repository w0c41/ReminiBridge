"use client";

import React from "react";
import { useTheme } from "../context/ThemeContext";

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className="switchBtn" onClick={toggleTheme} style={{ marginBottom: '1rem' }}>
      Switch to {theme === "light" ? "dark" : "light"} mode
    </button>
  );
};

export default ThemeSwitcher;
