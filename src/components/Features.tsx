
import { CheckCircle, Shield, Clock } from 'lucide-react';

export const Features = () => {
  const features = [
    {
      icon: <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-dutch-orange" />,
      title: "Geverifieerde Profielen",
      description: "Alle huurders en verhuurders worden geverifieerd voor veiligheid en betrouwbaarheid."
    },
    {
      icon: <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-dutch-orange" />,
      title: "Snelle Matches",
      description: "Ons algoritme vindt de perfecte match tussen huurders en verhuurders in recordtijd."
    },
    {
      icon: <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-dutch-orange" />,
      title: "Veilige Transacties",
      description: "Beveiligde documentverificatie voor zorgeloze verhuur."
    }
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            Waarom kiezen voor Huurly?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Wij maken huren en verhuren makkelijker, sneller en veiliger voor iedereen.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="text-center bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex justify-center mb-4 sm:mb-6">
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
