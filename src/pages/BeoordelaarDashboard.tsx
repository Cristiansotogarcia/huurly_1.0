
import React from 'react';
import { DashboardHeader, DashboardContent } from '@/components/dashboard';
import { useBeoordelaarDashboard } from '@/hooks/useBeoordelaarDashboard';
import { useBeoordelaarActions } from '@/hooks/useBeoordelaarActions';
import DocumentQueue from '@/components/standard/DocumentQueue';
import DocumentReviewModal from '@/components/modals/DocumentReviewModal';
import { withAuth } from '@/hocs/withAuth';
import { User, Document } from '@/types';
import { LoadingState } from '@/components/states';

interface BeoordelaarDashboardProps {
  user: User;
}

const BeoordelaarDashboard: React.FC<BeoordelaarDashboardProps> = ({ user }) => {
  const { documents, loading: dataLoading, refresh } = useBeoordelaarDashboard();
  const actions = useBeoordelaarActions();
  const [selectedDocument, setSelectedDocument] = React.useState<Document | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  if (dataLoading) {
    return <LoadingState />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DashboardHeader user={user} onLogout={actions.handleLogout} />
      <DashboardContent>
        <h1 className="text-3xl font-bold text-gray-800">Beoordelaar Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome, {user.name}. Here you can review submitted documents.</p>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-700">Document Queue</h2>
          <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
            <DocumentQueue documents={documents} onReview={(doc) => {
              setSelectedDocument(doc);
              setIsModalOpen(true);
            }} />
          </div>
        </div>
      </DashboardContent>
      {selectedDocument && (
        <DocumentReviewModal
          document={selectedDocument}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onApprove={async (docId, notes) => {
            await actions.handleReviewDocument(docId, 'approved', notes);
            refresh();
          }}
          onReject={async (docId, reason) => {
            await actions.handleReviewDocument(docId, 'rejected', reason);
            refresh();
          }}
        />
      )}
    </div>
  );
};

export default withAuth(BeoordelaarDashboard, 'beoordelaar');
