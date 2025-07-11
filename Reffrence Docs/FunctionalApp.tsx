import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";

// Import functional pages
import FunctionalHuurderDashboard from './pages/FunctionalHuurderDashboard';
import WoningenZoeken from './pages/WoningenZoeken';
import MijnAanvragen from './pages/MijnAanvragen';
import Abonnement from './pages/Abonnement';

// Simple login component
const LoginPage = () => {
  const [email, setEmail] = React.useState('sotocrioyo@gmail.com');
  const [password, setPassword] = React.useState('Admin1290@@');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'sotocrioyo@gmail.com' && password === 'Admin1290@@') {
      setIsLoggedIn(true);
      // Redirect to dashboard
      window.location.href = '/huurder-dashboard';
    } else {
      alert('Ongeldige inloggegevens');
    }
  };

  if (isLoggedIn) {
    return <Navigate to="/huurder-dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Huurly Inloggen
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welkom terug bij Huurly
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email adres
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email adres"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Wachtwoord
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Wachtwoord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Inloggen
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            <p>Test account:</p>
            <p>Email: sotocrioyo@gmail.com</p>
            <p>Wachtwoord: Admin1290@@</p>
          </div>
        </form>
      </div>
    </div>
  );
};

// Simple placeholder pages for missing routes
const BerichtenPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Berichten</h1>
      <p className="text-gray-600 mb-4">Berichten functionaliteit komt binnenkort...</p>
      <button 
        onClick={() => window.history.back()}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Terug
      </button>
    </div>
  </div>
);

const FavorietenPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Favorieten</h1>
      <p className="text-gray-600 mb-4">Favorieten functionaliteit komt binnenkort...</p>
      <button 
        onClick={() => window.history.back()}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Terug
      </button>
    </div>
  </div>
);

const InstellingenPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Instellingen</h1>
      <p className="text-gray-600 mb-4">Instellingen functionaliteit komt binnenkort...</p>
      <button 
        onClick={() => window.history.back()}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Terug
      </button>
    </div>
  </div>
);

const SupportPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Support</h1>
      <p className="text-gray-600 mb-4">Support functionaliteit komt binnenkort...</p>
      <button 
        onClick={() => window.history.back()}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Terug
      </button>
    </div>
  </div>
);

const HelpPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Help & Support</h1>
      <p className="text-gray-600 mb-4">Help functionaliteit komt binnenkort...</p>
      <button 
        onClick={() => window.history.back()}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Terug
      </button>
    </div>
  </div>
);

const FunctionalApp: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Login/Home Route */}
          <Route path="/" element={<LoginPage />} />
          
          {/* Main Dashboard Routes */}
          <Route path="/huurder-dashboard" element={<FunctionalHuurderDashboard />} />
          <Route path="/woningen-zoeken" element={<WoningenZoeken />} />
          <Route path="/mijn-aanvragen" element={<MijnAanvragen />} />
          <Route path="/abonnement" element={<Abonnement />} />
          
          {/* Additional Routes */}
          <Route path="/berichten" element={<BerichtenPage />} />
          <Route path="/favorieten" element={<FavorietenPage />} />
          <Route path="/instellingen" element={<InstellingenPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/help" element={<HelpPage />} />
          
          {/* Redirect any unknown routes to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Toast notifications */}
        <Toaster />
      </div>
    </Router>
  );
};

export default FunctionalApp;

