
import { Header } from '@/components/Header';

const AlgemeneVoorwaarden = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-dutch-blue mb-8">Algemene Voorwaarden</h1>
          
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-dutch-blue mb-3">1. Algemeen</h2>
              <p>
                Deze algemene voorwaarden zijn van toepassing op alle diensten die worden aangeboden door Huurly, 
                een platform dat verhuurders en huurders met elkaar verbindt. Door gebruik te maken van onze diensten, 
                gaat u akkoord met deze voorwaarden.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dutch-blue mb-3">2. Dienstverlening</h2>
              <p>
                Huurly faciliteert contact tussen verhuurders en potentiële huurders. Wij zijn geen verhuurder en 
                sluiten geen huurovereenkomsten af. Alle overeenkomsten worden rechtstreeks tussen verhuurder en 
                huurder gesloten.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dutch-blue mb-3">3. Gebruik van het platform</h2>
              <p>
                Gebruikers verplichten zich om:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Juiste en volledige informatie te verstrekken</li>
                <li>Het platform niet te gebruiken voor illegale doeleinden</li>
                <li>Respectvol om te gaan met andere gebruikers</li>
                <li>Geen valse profielen aan te maken</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dutch-blue mb-3">4. Verificatie</h2>
              <p>
                Huurly kan documenten en informatie verifiëren ter bescherming van alle gebruikers. 
                Het verstrekken van valse informatie kan leiden tot uitsluiting van het platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dutch-blue mb-3">5. Betalingen</h2>
              <p>
                Voor bepaalde diensten kunnen kosten in rekening worden gebracht. Alle prijzen zijn 
                inclusief BTW tenzij anders vermeld. Betalingen zijn niet-restitueerbaar tenzij 
                wettelijk vereist.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dutch-blue mb-3">6. Aansprakelijkheid</h2>
              <p>
                Huurly is niet aansprakelijk voor schade die voortvloeit uit het gebruik van het platform 
                of overeenkomsten tussen gebruikers. Gebruikers zijn zelf verantwoordelijk voor het 
                controleren van woningen en contracten.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dutch-blue mb-3">7. Wijzigingen</h2>
              <p>
                Huurly behoudt zich het recht voor deze voorwaarden te wijzigen. Wijzigingen worden 
                bekendgemaakt op het platform en treden in werking na publicatie.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dutch-blue mb-3">8. Toepasselijk recht</h2>
              <p>
                Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden voorgelegd 
                aan de bevoegde rechter in Nederland.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Laatste update: {new Date().toLocaleDateString('nl-NL')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgemeneVoorwaarden;
