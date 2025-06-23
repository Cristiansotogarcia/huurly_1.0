
import React from 'react';
import { Document } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface DocumentQueueProps {
  documents: Document[];
  onReview: (document: Document) => void;
}

const DocumentQueue: React.FC<DocumentQueueProps> = ({ documents, onReview }) => {
  if (documents.length === 0) {
    return <p>There are no documents to review.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Document Type</TableHead>
          <TableHead>Uploaded At</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell>
              <div className="font-medium">{doc.user?.name}</div>
              <div className="text-sm text-muted-foreground">{doc.user?.email}</div>
            </TableCell>
            <TableCell>{doc.document_type || doc.type}</TableCell>
            <TableCell>{new Date(doc.upload_datum || doc.uploadedAt || doc.created_at).toLocaleDateString()}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm" onClick={() => onReview(doc)}>Review</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DocumentQueue;
