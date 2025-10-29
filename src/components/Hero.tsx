
import { Button } from '@/components/ui/button';

interface HeroProps {
  onShowSignup?: () => void;
}

export const Hero = ({ onShowSignup }: HeroProps) => {
  return (
    <section className="hero-gradient text-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Verlies geen tijd met
            <br />
            zoeken, <span className="text-orange-300">laat de woning jou vinden!</span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Huurly is de beste en snelste oplossing voor huurders en verhuurders.
            Maak je profiel aan en laat verhuurders jou vinden als de perfecte
            kandidaat.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-white text-dutch-blue hover:bg-gray-100 px-6 sm:px-8 py-4 text-base sm:text-lg font-semibold min-h-[56px] w-full sm:w-auto max-w-xs sm:max-w-none"
              onClick={onShowSignup}
            >
              Profiel aanmaken
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
