// Design tokens extracted from the Stitch UI export (DESIGN.md)
// Keep this file as the single source of truth for colors/spacing/type
// so every screen stays visually consistent with the approved design.

export const colors = {
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
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  gutter: 24,
};

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const typography = {
  display: { fontSize: 36, fontWeight: "700" as const, lineHeight: 44 },
  h1: { fontSize: 24, fontWeight: "700" as const, lineHeight: 32 }, // h1-mobile
  h2: { fontSize: 24, fontWeight: "600" as const, lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: "600" as const, lineHeight: 28 },
  bodyLg: { fontSize: 18, fontWeight: "400" as const, lineHeight: 28 },
  bodyMd: { fontSize: 16, fontWeight: "400" as const, lineHeight: 24 },
  bodySm: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
  labelMd: { fontSize: 14, fontWeight: "500" as const, lineHeight: 20 },
  labelSm: { fontSize: 12, fontWeight: "500" as const, lineHeight: 16 },
};
