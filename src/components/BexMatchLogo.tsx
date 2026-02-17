import logoImage from "@/assets/logo.png";
import { forwardRef } from "react";

interface BexMatchLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

const textSizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
};

const BexMatchLogo = forwardRef<HTMLDivElement, BexMatchLogoProps>(
  ({ size = "md", showText = true, className = "" }, ref) => {
    return (
      <div ref={ref} className={`flex items-center gap-2.5 ${className}`}>
        <img
          src={logoImage}
          alt="BexMatch"
          className={`${sizeClasses[size]} object-contain`}
        />
        {showText && (
          <span className={`${textSizeClasses[size]} font-extrabold tracking-tight`}>
            Bex<span className="text-gradient-primary">Match</span>
          </span>
        )}
      </div>
    );
  },
);

BexMatchLogo.displayName = "BexMatchLogo";

export default BexMatchLogo;
