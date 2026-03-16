export const FILAMENT_COLORS = [
  "Red",
  "Green",
  "Purple",
  "Black",
  "White",
  "Pink",
] as const;

export type FilamentColor = (typeof FILAMENT_COLORS)[number];

export const COLOR_HEX: Record<FilamentColor, string> = {
  Red: "#DC2626",
  Green: "#16A34A",
  Purple: "#9333EA",
  Black: "#1F2937",
  White: "#F9FAFB",
  Pink: "#EC4899",
};
