import React from 'react';

const Privacybeleid: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-4">
      <h1 className="text-2xl font-bold">Privacybeleid</h1>
      <p>
        Wij hechten veel waarde aan de bescherming van jouw persoonsgegevens. In
        dit privacybeleid leggen wij uit hoe Huurly omgaat met jouw gegevens en
        hoe wij voldoen aan de Algemene Verordening Gegevensbescherming (AVG).
      </p>
      <p>
        Persoonsgegevens worden uitsluitend gebruikt voor het aanbieden van onze
        dienst. Je gegevens worden niet langer bewaard dan noodzakelijk en nooit
        zonder toestemming gedeeld met derden.
      </p>
      <p>
        Je hebt het recht om jouw gegevens in te zien, te corrigeren of te
        verwijderen. Voor vragen over dit beleid kun je contact opnemen via
        <a href="mailto:info@huurly.nl" className="text-blue-600 underline">
          info@huurly.nl
        </a>
        .
      </p>
    </div>
  );
};

export default Privacybeleid;
