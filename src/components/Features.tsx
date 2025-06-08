
import { CheckCircle, Shield, Clock } from 'lucide-react';

export const Features = () => {
  const features = [
    {
      icon: <CheckCircle className="h-8 w-8 text-dutch-orange" />,
      title: "Geverifieerde Profielen",
      description: "Alle huurders en verhuurders worden geverifieerd voor veiligheid en betrouwbaarheid."
    },
    {
      icon: <Clock className="h-8 w-8 text-dutch-orange" />,
      title: "Snelle Matches",
      description: "Ons algoritme vindt de perfecte match tussen huurders en verhuurders in recordtijd."
    },
    {
      icon: <Shield className="h-8 w-8 text-dutch-orange" />,
      title: "Veilige Transacties",
      description: "Beveiligde documentverificatie voor zorgeloze verhuur."
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Waarom kiezen voor Huurly?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Wij maken huren en verhuren makkelijker, sneller en veiliger voor iedereen.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
