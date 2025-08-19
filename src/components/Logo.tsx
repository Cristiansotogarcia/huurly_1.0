
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <div className={cn("flex items-center", className)}>
      <img
        src="/huurly-logo.svg"
        alt="Huurly"
        className="h-4 w-auto sm:h-6 md:h-8"
        onError={(e) => {
          // Hide image if SVG fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
      <span className="ml-2 text-sm sm:text-xl md:text-2xl font-bold text-dutch-blue">
        Huurly
      </span>
    </div>
  );
};
