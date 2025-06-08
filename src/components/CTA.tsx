
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const CTA = () => {
  return (
    <section className="bg-dutch-blue py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Klaar om je perfecte woning te vinden?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Sluit je aan bij duizenden tevreden gebruikers die hun droomwoning hebben gevonden via Huurly.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-dutch-orange hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold"
          >
            Profiel aanmaken
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-dutch-blue px-8 py-4 text-lg font-semibold"
          >
            Meer informatie
          </Button>
        </div>
      </div>
    </section>
  );
};
