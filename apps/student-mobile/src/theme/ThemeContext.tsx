import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const lightColors = {
  background: "#faf8ff",
  surface: "#faf8ff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f3f3fe",
  surfaceContainer: "#ededf9",
  surfaceContainerHigh: "#e7e7f3",
  surfaceContainerHighest: "#e1e2ed",
  onBackground: "#191b23",
  onSurface: "#191b23",
  onSurfaceVariant: "#434655",
  outline: "#737686",
  outlineVariant: "#c3c6d7",
  primary: "#004ac6",
  onPrimary: "#ffffff",
  primaryContainer: "#2563eb",
  onPrimaryContainer: "#eeefff",
  primaryFixed: "#dbe1ff",
  secondary: "#585f6c",
  secondaryContainer: "#dce2f3",
  onSecondaryContainer: "#5e6572",
  tertiary: "#943700",
  onTertiaryContainer: "#ffede6",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  success: "#15803d",
  successContainer: "#dcfce7",
  tabBar: "#ffffff",
  tabBarBorder: "#c3c6d7",
};

const darkColors = {
  background: "#121218",
  surface: "#1a1a22",
  surfaceContainerLowest: "#1e1e28",
  surfaceContainerLow: "#252530",
  surfaceContainer: "#2a2a36",
  surfaceContainerHigh: "#323240",
  surfaceContainerHighest: "#3a3a48",
  onBackground: "#e6e1e8",
  onSurface: "#e6e1e8",
  onSurfaceVariant: "#c4c0cc",
  outline: "#8e8a99",
  outlineVariant: "#434356",
  primary: "#7c9aff",
  onPrimary: "#001a5e",
  primaryContainer: "#003394",
  onPrimaryContainer: "#dbe1ff",
  primaryFixed: "#dbe1ff",
  secondary: "#bcc7db",
  secondaryContainer: "#3a4556",
  onSecondaryContainer: "#dce2f3",
  tertiary: "#ffb59b",
  onTertiaryContainer: "#5c1300",
  error: "#ffb4ab",
  errorContainer: "#93000a",
  onErrorContainer: "#ffdad6",
  success: "#4ade80",
  successContainer: "#14532d",
  tabBar: "#1e1e28",
  tabBarBorder: "#434356",
};

type ThemeColors = typeof lightColors;

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("@theme").then((val) => {
      if (val === "dark") setIsDark(true);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem("@theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, colors: isDark ? darkColors : lightColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
