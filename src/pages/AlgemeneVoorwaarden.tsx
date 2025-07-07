import React from 'react';

const AlgemeneVoorwaarden: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-4">
      <h1 className="text-2xl font-bold">Algemene Voorwaarden</h1>
      <p>
        Deze voorwaarden zijn van toepassing op het gebruik van Huurly. Door je
        aan te melden ga je akkoord met deze voorwaarden en verklaar je dat je
        onze dienst eerlijk zult gebruiken.
      </p>
      <p>
        Wij handelen conform de AVG en behandelen persoonsgegevens zorgvuldig. De
        volledige inhoud van deze voorwaarden kan op verzoek worden toegestuurd.
      </p>
      <p>
        Voor meer informatie of vragen kun je contact opnemen via
        <a href="mailto:info@huurly.nl" className="text-blue-600 underline">
          info@huurly.nl
        </a>
        .
      </p>
    </div>
  );
};

export default AlgemeneVoorwaarden;
