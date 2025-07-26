import React, { useState } from 'react';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TestModal: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProfileSuccess = () => {
    console.log('Profile updated successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test Profile Modal</CardTitle>
            <CardDescription>
              This page is for testing the new Profile Modal functionality.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Click the button below to open the Profile Modal and test the form.
              </p>
              
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Open Profile Modal
              </Button>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Test Instructions:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Fill in all required fields marked with *</li>
                  <li>• Add at least one location preference</li>
                  <li>• Test the guarantor section by checking the box</li>
                  <li>• Submit the form to update your profile</li>
                  <li>• Check the console for success/error messages</li>
                </ul>
              </div>

              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Expected Behavior:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Modal opens with all form fields</li>
                  <li>• Form validation works for required fields</li>
                  <li>• Location preferences can be added/removed</li>
                  <li>• Guarantor section appears when checkbox is checked</li>
                  <li>• Form submits and updates the database</li>
                  <li>• Success toast appears on successful submission</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <ProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleProfileSuccess}
        />
      </div>
    </div>
  );
};

export default TestModal;
