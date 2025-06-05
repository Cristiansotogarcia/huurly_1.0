
import { Header } from '@/components/Header';

const Privacybeleid = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-dutch-blue mb-8">Privacybeleid</h1>
          
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-dutch-blue mb-3">1. Inleiding</h2>
              <p>
                Huurly respecteert uw privacy en is transparant over hoe wij uw persoonlijke gegevens 
                verzamelen, gebruiken en beschermen. Dit privacybeleid legt uit welke gegevens wij 
                verzamelen en hoe wij deze gebruiken.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dutch-blue mb-3">2. Welke gegevens verzamelen wij</h2>
              <p>Wij verzamelen de volgende categorieën gegevens:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Persoonlijke identificatiegegevens (naam, e-mailadres, telefoonnummer)</li>
                <li>Profielinformatie (geboortedatum, beroep, inkomen)</li>
                <li>Woonvoorkeuren en zoekfilters</li>
                <li>Geüploade documenten voor verificatie</li>
                <li>Communicatie tussen gebruikers</li>
                <li>Technische gegevens (IP-adres, browser informatie)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dutch-blue mb-3">3. Hoe gebruiken wij uw gegevens</h2>
              <p>Uw gegevens worden gebruikt voor:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Het aanmaken en beheren van uw account</li>
                <li>Het matchen van huurders en verhuurders</li>
                <li>Verificatie van identiteit en inkomen</li>
                <li>Communicatie over ons platform</li>
                <li>Verbetering van onze diensten</li>
                <li>Naleving van wettelijke verplichtingen</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dutch-blue mb-3">4. Delen van gegevens</h2>
              <p>
                Wij delen uw gegevens alleen met:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Andere gebruikers (alleen relevante profielinformatie)</li>
                <li>Derde partijen voor verificatiediensten</li>
                <li>Wetshandhavingsinstanties indien wettelijk vereist</li>
                <li>Serviceproviders die ons helpen het platform te beheren</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dutch-blue mb-3">5. Beveiliging</h2>
              <p>
                Wij nemen technische en organisatorische maatregelen om uw gegevens te beschermen 
                tegen ongeautoriseerde toegang, verlies of misbruik. Dit omvat encryptie, 
                beveiligde servers en regelmatige beveiligingsaudits.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dutch-blue mb-3">6. Uw rechten</h2>
              <p>U heeft het recht om:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Inzage te krijgen in uw persoonlijke gegevens</li>
                <li>Onjuiste gegevens te laten corrigeren</li>
                <li>Uw gegevens te laten verwijderen</li>
                <li>Bezwaar te maken tegen verwerking</li>
                <li>Uw gegevens over te dragen</li>
                <li>Een klacht in te dienen bij de Autoriteit Persoonsgegevens</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dutch-blue mb-3">7. Cookies</h2>
              <p>
                Wij gebruiken cookies en vergelijkbare technologieën om uw ervaring te verbeteren, 
                voorkeuren te onthouden en het gebruik van ons platform te analyseren. U kunt 
                cookies uitschakelen in uw browserinstellingen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dutch-blue mb-3">8. Bewaarperiode</h2>
              <p>
                Wij bewaren uw gegevens zo lang als nodig voor de doeleinden waarvoor ze zijn 
                verzameld, of zo lang als wettelijk vereist. Na beëindiging van uw account 
                worden gegevens binnen 30 dagen verwijderd.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dutch-blue mb-3">9. Wijzigingen</h2>
              <p>
                Wij kunnen dit privacybeleid van tijd tot tijd bijwerken. Belangrijke wijzigingen 
                worden bekendgemaakt via e-mail of een kennisgeving op het platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dutch-blue mb-3">10. Contact</h2>
              <p>
                Voor vragen over dit privacybeleid of uw persoonlijke gegevens kunt u contact 
                opnemen via privacy@huurly.nl of via ons contactformulier.
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

export default Privacybeleid;
