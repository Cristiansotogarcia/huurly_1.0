
import React from 'react';
import { NotificationTester } from '@/components/notifications/NotificationTester';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationTest = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Real-time Notificatie Test
          </h1>
          <p className="text-gray-600">
            Test cross-dashboard notificaties tussen verschillende gebruikersrollen.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Test Instructies</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>1. Open meerdere tabs:</strong> Open verschillende dashboard pagina's in nieuwe tabs
              (HuurderDashboard, VerhuurderDashboard, BeoordelaarDashboard)
            </p>
            <p>
              <strong>2. Test real-time updates:</strong> Verstuur een notificatie en zie deze direct
              verschijnen in andere dashboards zonder pagina refresh
            </p>
            <p>
              <strong>3. Cross-role communicatie:</strong> Test hoe notificaties tussen verschillende
              rollen werken (Huurder → Beoordelaar, Verhuurder → Huurder, etc.)
            </p>
            <p>
              <strong>4. Live functionaliteit:</strong> Alle notificaties worden direct opgeslagen
              in de database en distributed via real-time channels
            </p>
          </div>
        </div>

        {/* Notification Tester */}
        <NotificationTester />

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Real-time Functionaliteit
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li>✓ Database persistence via Supabase</li>
            <li>✓ Real-time updates via WebSocket channels</li>
            <li>✓ Cross-dashboard synchronisatie</li>
            <li>✓ Toast notificaties bij nieuwe berichten</li>
            <li>✓ Automatische badge updates</li>
            <li>✓ Mark as read functionaliteit</li>
            <li>✓ Delete notificatie functionaliteit</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationTest;
