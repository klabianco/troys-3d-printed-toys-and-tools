export interface FilamentColorDef {
  name: string;
  hex: string;
  /** Optional second hex for dual-tone / multi-color swatches */
  hex2?: string;
  special?: boolean;
}

/** Price premium per part using a special filament, in cents */
export const SPECIAL_FILAMENT_SURCHARGE = 50;

export const STANDARD_COLORS: FilamentColorDef[] = [
  { name: "Red", hex: "#DC2626" },
  { name: "Green", hex: "#16A34A" },
  { name: "Purple", hex: "#9333EA" },
  { name: "Black", hex: "#1F2937" },
  { name: "White", hex: "#F9FAFB" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Orange", hex: "#EA580C" },
];

export const SPECIAL_COLORS: FilamentColorDef[] = [
  // Metallic glow-in-the-dark
  { name: "Metallic Blue Green", hex: "#0EA5E9", hex2: "#16A34A", special: true },
  { name: "Metallic Blue Yellow", hex: "#0EA5E9", hex2: "#EAB308", special: true },
  { name: "Metallic Dark Blue Green", hex: "#1E3A5F", hex2: "#166534", special: true },
  { name: "Metallic Dark Blue Yellow", hex: "#1E3A5F", hex2: "#CA8A04", special: true },
  // Glow-in-the-dark
  { name: "Glow Yellow", hex: "#FDE047", special: true },
  { name: "Glow Red", hex: "#FCA5A5", special: true },
  { name: "Glow Blue", hex: "#93C5FD", special: true },
  { name: "Glow Purple", hex: "#C4B5FD", special: true },
  { name: "Glow Multi-Color", hex: "#FDE047", hex2: "#C4B5FD", special: true },
];

export const ALL_COLORS: FilamentColorDef[] = [...STANDARD_COLORS, ...SPECIAL_COLORS];

export function isSpecialColor(name: string): boolean {
  return SPECIAL_COLORS.some((c) => c.name === name);
}

export function getColorDef(name: string): FilamentColorDef | undefined {
  return ALL_COLORS.find((c) => c.name === name);
}
