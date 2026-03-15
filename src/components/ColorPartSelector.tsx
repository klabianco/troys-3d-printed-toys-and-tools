"use client";

import { useState } from "react";
import { FILAMENT_COLORS, COLOR_HEX } from "@/lib/colors";
import BuyButton from "./BuyButton";

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

  function selectColor(part: string, color: string) {
    setSelections((prev) => ({ ...prev, [part]: color }));
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
            {FILAMENT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                onClick={() => selectColor(part, color)}
                className={`h-8 w-8 rounded-full border-2 transition ${
                  selections[part] === color
                    ? "border-indigo-600 ring-2 ring-indigo-300"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                style={{ backgroundColor: COLOR_HEX[color] }}
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

      <BuyButton
        slug={slug}
        price={price}
        colorSelections={allSelected ? selections : undefined}
        disabled={!allSelected}
      />
    </div>
  );
}
