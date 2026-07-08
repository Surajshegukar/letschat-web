import React from "react";

interface AvatarProps {
  src?: string;
  name?: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
}

const getInitials = (name?: string): string => {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
};

export default function Avatar({
  src,
  name,
  className = "",
  size = "md",
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  const sizeClasses = {
    xs: "h-8 w-8 text-xs",
    sm: "h-9 w-9 text-sm",
    md: "h-10 w-10 text-sm",
    lg: "h-11 w-11 text-base",
    xl: "h-14 w-14 text-lg",
    xxl: "h-[130px] w-[130px] text-4xl",
  };

  const actualSizeClass = sizeClasses[size] || sizeClasses.md;

  if (src && !hasError) {
    return (
      <img
        src={src}
        className={`rounded-full object-cover ${actualSizeClass} ${className}`}
        alt={name || "Avatar"}
        onError={() => setHasError(true)}
      />
    );
  }

  const initials = getInitials(name) || "?";

  // Generate a consistent gradient background color based on name/initials
  const colors = [
    "from-emerald-400 to-teal-500",
    "from-violet-400 to-indigo-500",
    "from-blue-400 to-indigo-600",
    "from-rose-400 to-orange-500",
    "from-amber-400 to-orange-500",
  ];
  const charCodeSum = name ? name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  const gradient = colors[charCodeSum % colors.length];

  return (
    <div
      className={`rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white uppercase select-none ${actualSizeClass} ${className}`}
    >
      {initials}
    </div>
  );
}