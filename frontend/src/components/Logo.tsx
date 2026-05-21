import { Link } from "react-router-dom";
import { Video } from "lucide-react";
import { cn } from "../lib/utils";

interface LogoProps {
  to?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ to = "/", className, size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: "w-5 h-5", text: "text-lg" },
    md: { icon: "w-6 h-6", text: "text-xl" },
    lg: { icon: "w-8 h-8", text: "text-2xl" },
  };

  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-extrabold gradient-text",
        sizes[size].text,
        className
      )}
    >
      <span className="p-1.5 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/30">
        <Video className={sizes[size].icon} />
      </span>
      IntellMeet
    </span>
  );

  if (to) {
    return (
      <Link to={to} className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
