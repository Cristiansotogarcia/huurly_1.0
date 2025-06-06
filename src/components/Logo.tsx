import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="w-8 h-8 bg-dutch-blue rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-lg">H</span>
      </div>
      <span className="ml-2 text-xl font-bold text-dutch-blue">Huurly</span>
    </div>
  );
};

export default Logo;
