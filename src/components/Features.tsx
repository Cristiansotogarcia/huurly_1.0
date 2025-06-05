
import { User, Shield, Home } from 'lucide-react';

export const Features = () => {
  const features = [
    {
      icon: User,
      title: 'Geverifieerde Profielen',
      description: 'Alle huurders worden zorgvuldig gescreend met volledige documentatie en verificatie',
      stats: '10.000+',
      statsLabel: 'Actieve huurders'
    },
    {
      icon: Shield,
      title: 'Directe Matching',
      description: 'Verhuurders vinden direct geschikte kandidaten op basis van hun specifieke criteria',
      stats: '2.500+',
      statsLabel: 'Geverifieerde verhuurders'
    },
    {
      icon: Home,
      title: 'Sneller Proces',
      description: 'Geen eindeloos zoeken meer - laat de perfecte woning bij jou terechtkomen',
      stats: '4.8',
      statsLabel: 'Gemiddelde tevredenheid'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-dutch-blue mb-4">
            Waarom kiezen voor Huurly?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Een slimme databank die huurders en verhuurders direct met elkaar
            verbindt
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 text-center card-hover">
              <div className="w-16 h-16 bg-gradient-to-r from-dutch-blue to-dutch-lightBlue rounded-full flex items-center justify-center mx-auto mb-6">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-dutch-blue mb-4">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {feature.description}
              </p>

              <div className="text-center">
                <div className="text-3xl font-bold text-dutch-orange mb-1">
                  {feature.stats}
                </div>
                <div className="text-sm text-gray-500">
                  {feature.statsLabel}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
