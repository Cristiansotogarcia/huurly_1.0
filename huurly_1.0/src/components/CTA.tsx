
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { SignupForm } from './auth/SignupForm';
import { useState } from 'react';

export const CTA = () => {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <section className="bg-dutch-blue text-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Klaar om gevonden te worden?
        </h2>
        
        <p className="text-xl mb-8 text-blue-100">
          Maak vandaag nog je profiel aan en laat verhuurders jou als perfecte kandidaat vinden
        </p>

        <div className="flex justify-center">
          <Dialog open={showSignup} onOpenChange={setShowSignup}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-dutch-orange hover:bg-orange-600 text-white px-8 py-4">
                Gratis profiel aanmaken
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <SignupForm onClose={() => setShowSignup(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
};
