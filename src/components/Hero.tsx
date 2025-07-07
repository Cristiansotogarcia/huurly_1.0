
import { Button } from '@/components/ui/button';

interface HeroProps {
  onShowSignup?: () => void;
}

export const Hero = ({ onShowSignup }: HeroProps) => {
  return (
    <section className="hero-gradient text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Verlies geen tijd met
            <br />
            zoeken, <span className="text-orange-300">laat de woning jou vinden!</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Huurly is de beste en snelste oplossing voor huurders en verhuurders.
            Maak je profiel aan en laat verhuurders jou vinden als de perfecte
            kandidaat.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-white text-dutch-blue hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
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
