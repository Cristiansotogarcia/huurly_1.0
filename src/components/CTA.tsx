
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { SignupForm } from './auth/SignupForm';
import { useState } from 'react';

export const CTA = () => {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <section className="bg-dutch-blue py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Klaar om je perfecte woning te vinden?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Sluit je aan bij duizenden tevreden gebruikers die hun droomwoning hebben gevonden via Huurly.
        </p>
        
        <div className="flex justify-center">
          <Dialog open={showSignup} onOpenChange={setShowSignup}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="bg-dutch-orange hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold"
              >
                Profiel aanmaken
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white">
              <SignupForm onClose={() => setShowSignup(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
};
