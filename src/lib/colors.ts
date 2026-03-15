export const FILAMENT_COLORS = [
  "Red",
  "Blue",
  "Green",
  "Black",
  "White",
  "Yellow",
  "Orange",
  "Purple",
  "Pink",
  "Gold",
  "Silver",
] as const;

export type FilamentColor = (typeof FILAMENT_COLORS)[number];

export const COLOR_HEX: Record<FilamentColor, string> = {
  Red: "#DC2626",
  Blue: "#2563EB",
  Green: "#16A34A",
  Black: "#1F2937",
  White: "#F9FAFB",
  Yellow: "#EAB308",
  Orange: "#EA580C",
  Purple: "#9333EA",
  Pink: "#EC4899",
  Gold: "#CA8A04",
  Silver: "#9CA3AF",
};
