import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';

const Privacybeleid: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Simple header with logo for navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="hover:opacity-75 transition-opacity">
              <Logo />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-12 px-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacybeleid</h1>
        <p className="text-gray-600">Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL')}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">1. Inleiding</h2>
        <p className="text-gray-700 leading-relaxed">
          Huurly ("wij", "ons", "onze") hecht veel waarde aan de bescherming van jouw privacy en persoonsgegevens. 
          Dit privacybeleid legt uit hoe wij jouw persoonsgegevens verzamelen, gebruiken, opslaan en beschermen 
          wanneer je onze website www.huurly.nl en onze diensten gebruikt. Door gebruik te maken van onze diensten, 
          ga je akkoord met de praktijken die in dit privacybeleid worden beschreven.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">2. Verantwoordelijke voor gegevensverwerking</h2>
        <div className="text-gray-700 leading-relaxed">
          <p><strong>Huurly</strong></p>
          <p>E-mail: info@huurly.nl</p>
          <p>Website: www.huurly.nl</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">3. Welke gegevens verzamelen wij?</h2>
        <div className="space-y-3 text-gray-700 leading-relaxed">
          <h3 className="text-lg font-medium text-gray-800">Persoonlijke identificatiegegevens:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Naam en contactgegevens (e-mailadres, telefoonnummer)</li>
            <li>Profielfoto</li>
            <li>Leeftijd en persoonlijke beschrijving</li>
          </ul>
          
          <h3 className="text-lg font-medium text-gray-800">Financiële informatie:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Inkomensgegevens</li>
            <li>Betalingsgegevens (via Stripe)</li>
            <li>Abonnementsinformatie</li>
          </ul>
          
          <h3 className="text-lg font-medium text-gray-800">Woninggerelateerde gegevens:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Woonvoorkeuren (locatie, huurprijs, aantal kamers)</li>
            <li>Huishoudsamenstelling</li>
            <li>Lifestyle informatie (huisdieren, roken, etc.)</li>
          </ul>
          
          <h3 className="text-lg font-medium text-gray-800">Documenten:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Identiteitsdocumenten</li>
            <li>Inkomensbewijzen</li>
            <li>Referenties</li>
            <li>Andere verificatiedocumenten</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">4. Hoe gebruiken wij jouw gegevens?</h2>
        <div className="text-gray-700 leading-relaxed">
          <p>Wij gebruiken jouw persoonsgegevens voor de volgende doeleinden:</p>
          <ul className="list-disc pl-6 space-y-1 mt-3">
            <li>Het aanbieden en verbeteren van onze matchingdiensten tussen huurders en verhuurders</li>
            <li>Het verifiëren van jouw identiteit en documenten</li>
            <li>Het verwerken van betalingen en abonnementen</li>
            <li>Het verzenden van belangrijke updates en notificaties</li>
            <li>Het bieden van klantenservice en ondersteuning</li>
            <li>Het naleven van wettelijke verplichtingen</li>
            <li>Het voorkomen van fraude en misbruik</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">5. Rechtsgrondslag voor gegevensverwerking</h2>
        <div className="text-gray-700 leading-relaxed">
          <p>Wij verwerken jouw persoonsgegevens op basis van:</p>
          <ul className="list-disc pl-6 space-y-1 mt-3">
            <li><strong>Toestemming:</strong> Voor marketing en niet-essentiële communicatie</li>
            <li><strong>Contractuele noodzaak:</strong> Voor het leveren van onze diensten</li>
            <li><strong>Gerechtvaardigd belang:</strong> Voor veiligheid, fraudepreventie en serviceverbeteringen</li>
            <li><strong>Wettelijke verplichting:</strong> Voor compliance met Nederlandse en EU-wetgeving</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">6. Delen van gegevens</h2>
        <div className="text-gray-700 leading-relaxed">
          <p>Wij delen jouw persoonsgegevens alleen in de volgende gevallen:</p>
          <ul className="list-disc pl-6 space-y-1 mt-3">
            <li><strong>Met verhuurders:</strong> Relevante profielinformatie (met jouw toestemming)</li>
            <li><strong>Met dienstverleners:</strong> Zoals Stripe voor betalingsverwerking en Supabase voor hosting</li>
            <li><strong>Bij wettelijke verplichting:</strong> Wanneer dit vereist is door de wet</li>
            <li><strong>Met jouw toestemming:</strong> In andere gevallen waarin je expliciet toestemming hebt gegeven</li>
          </ul>
          <p className="mt-3">Wij verkopen nooit jouw persoonsgegevens aan derden.</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">7. Gegevensopslag en -beveiliging</h2>
        <div className="text-gray-700 leading-relaxed">
          <p>
            Wij nemen de beveiliging van jouw gegevens serieus en gebruiken passende technische en 
            organisatorische maatregelen om jouw persoonsgegevens te beschermen tegen ongeautoriseerde 
            toegang, verlies, diefstal of misbruik.
          </p>
          <p className="mt-3">
            Jouw gegevens worden opgeslagen op beveiligde servers binnen de Europese Unie. 
            Wij bewaren jouw gegevens niet langer dan noodzakelijk voor de doeleinden waarvoor 
            ze zijn verzameld of zoals vereist door de wet.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">8. Jouw rechten</h2>
        <div className="text-gray-700 leading-relaxed">
          <p>Onder de AVG heb je de volgende rechten:</p>
          <ul className="list-disc pl-6 space-y-1 mt-3">
            <li><strong>Recht op inzage:</strong> Je kunt inzage vragen in de persoonsgegevens die wij van je hebben</li>
            <li><strong>Recht op rectificatie:</strong> Je kunt onjuiste gegevens laten corrigeren</li>
            <li><strong>Recht op wissing:</strong> Je kunt verzoeken om verwijdering van jouw gegevens</li>
            <li><strong>Recht op beperking:</strong> Je kunt de verwerking van jouw gegevens beperken</li>
            <li><strong>Recht op overdraagbaarheid:</strong> Je kunt jouw gegevens in een gestructureerd formaat ontvangen</li>
            <li><strong>Recht van bezwaar:</strong> Je kunt bezwaar maken tegen de verwerking van jouw gegevens</li>
            <li><strong>Recht om toestemming in te trekken:</strong> Je kunt je toestemming op elk moment intrekken</li>
          </ul>
          <p className="mt-3">
            Om een van deze rechten uit te oefenen, neem contact met ons op via 
            <a href="mailto:info@huurly.nl" className="text-primary hover:underline"> info@huurly.nl</a>.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">9. Cookies</h2>
        <div className="text-gray-700 leading-relaxed">
          <p>
            Onze website maakt gebruik van cookies om de functionaliteit te verbeteren en 
            jouw ervaring te personaliseren. Door onze website te blijven gebruiken, 
            ga je akkoord met ons gebruik van cookies zoals beschreven in ons cookiebeleid.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">10. Wijzigingen in dit privacybeleid</h2>
        <div className="text-gray-700 leading-relaxed">
          <p>
            Wij kunnen dit privacybeleid van tijd tot tijd bijwerken. Belangrijke wijzigingen 
            zullen we communiceren via e-mail of een prominente kennisgeving op onze website. 
            We raden je aan om dit privacybeleid regelmatig te bekijken.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">11. Contact</h2>
        <div className="text-gray-700 leading-relaxed">
          <p>
            Als je vragen hebt over dit privacybeleid of over hoe wij omgaan met jouw 
            persoonsgegevens, neem dan contact met ons op:
          </p>
          <div className="mt-3">
            <p><strong>E-mail:</strong> <a href="mailto:info@huurly.nl" className="text-primary hover:underline">info@huurly.nl</a></p>
            <p><strong>Website:</strong> <a href="https://www.huurly.nl" className="text-primary hover:underline">www.huurly.nl</a></p>
          </div>
          <p className="mt-3">
            Je hebt ook het recht om een klacht in te dienen bij de Autoriteit Persoonsgegevens 
            als je van mening bent dat wij niet correct omgaan met jouw persoonsgegevens.
          </p>
        </div>
      </section>
      </div>
    </div>
  );
};

export default Privacybeleid;
