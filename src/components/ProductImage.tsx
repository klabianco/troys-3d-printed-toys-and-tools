const CATEGORY_EMOJI: Record<string, string> = {
  Tools: "\u{1F527}",
  Toys: "\u{1F3B2}",
  Gadgets: "\u{1F4F1}",
};

export default function ProductImage({
  src,
  alt,
  category,
  size = "md",
}: {
  src?: string;
  alt: string;
  category: string;
  size?: "sm" | "md" | "lg";
}) {
  const textSize = size === "lg" ? "text-6xl" : "text-4xl";
  const hasImage = src && !src.includes("placeholder");

  if (hasImage) {
    return (
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className={`flex h-full items-center justify-center ${textSize} text-gray-300`}>
      {CATEGORY_EMOJI[category] || "\u{1F4E6}"}
    </div>
  );
}
