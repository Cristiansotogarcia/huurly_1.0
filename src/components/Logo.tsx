
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
        className="h-8 w-auto"
        onError={(e) => {
          // Fallback to text if SVG fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent && !parent.querySelector('.logo-text')) {
            const textLogo = document.createElement('span');
            textLogo.className = 'logo-text text-2xl font-bold text-dutch-blue';
            textLogo.textContent = 'Huurly';
            parent.appendChild(textLogo);
          }
        }}
      />
      <span className="ml-2 text-2xl font-bold text-dutch-blue">Huurly</span>
    </div>
  );
};
