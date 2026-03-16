"use client";

import { useState } from "react";
import {
  STANDARD_COLORS,
  SPECIAL_COLORS,
  SPECIAL_FILAMENT_SURCHARGE,
  isSpecialColor,
  type FilamentColorDef,
} from "@/lib/colors";
import BuyButton from "./BuyButton";

function ColorSwatch({
  color,
  selected,
  onClick,
}: {
  color: FilamentColorDef;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={color.name}
      onClick={onClick}
      className={`h-8 w-8 rounded-full border-2 transition ${
        selected
          ? "border-indigo-600 ring-2 ring-indigo-300"
          : "border-gray-300 hover:border-gray-400"
      }`}
      style={
        color.hex === "rainbow"
          ? {
              background:
                "conic-gradient(red, orange, yellow, green, cyan, blue, violet, red)",
            }
          : color.hex2
            ? {
                background: `linear-gradient(135deg, ${color.hex} 50%, ${color.hex2} 50%)`,
              }
            : { backgroundColor: color.hex }
      }
    />
  );
}

export default function ColorPartSelector({
  slug,
  price,
  colorParts,
}: {
  slug: string;
  price: number;
  colorParts: string[];
}) {
  const [selections, setSelections] = useState<Record<string, string>>({});

  const allSelected = colorParts.every((part) => selections[part]);

  const specialCount = Object.values(selections).filter(isSpecialColor).length;
  const totalSurcharge = specialCount * SPECIAL_FILAMENT_SURCHARGE;
  const totalPrice = price + totalSurcharge;

  function selectColor(part: string, colorName: string) {
    setSelections((prev) => ({ ...prev, [part]: colorName }));
  }

  return (
    <div className="space-y-4">
      {colorParts.map((part) => (
        <div key={part}>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {part}
            {selections[part] && (
              <span className="ml-2 text-xs text-gray-400">
                {selections[part]}
              </span>
            )}
          </label>

          <div className="flex flex-wrap gap-2">
            {STANDARD_COLORS.map((color) => (
              <ColorSwatch
                key={color.name}
                color={color}
                selected={selections[part] === color.name}
                onClick={() => selectColor(part, color.name)}
              />
            ))}
          </div>

          <p className="mb-1 mt-2 text-xs text-gray-400">
            Special (+${(SPECIAL_FILAMENT_SURCHARGE / 100).toFixed(2)}/part)
          </p>
          <div className="flex flex-wrap gap-2">
            {SPECIAL_COLORS.map((color) => (
              <ColorSwatch
                key={color.name}
                color={color}
                selected={selections[part] === color.name}
                onClick={() => selectColor(part, color.name)}
              />
            ))}
          </div>
        </div>
      ))}

      {!allSelected && (
        <p className="text-xs text-gray-500">
          Select a color for each part to continue.
        </p>
      )}

      {totalSurcharge > 0 && (
        <p className="text-xs text-gray-500">
          Includes +${(totalSurcharge / 100).toFixed(2)} for special filament
        </p>
      )}

      <BuyButton
        slug={slug}
        price={totalPrice}
        colorSelections={allSelected ? selections : undefined}
        disabled={!allSelected}
      />
    </div>
  );
}
