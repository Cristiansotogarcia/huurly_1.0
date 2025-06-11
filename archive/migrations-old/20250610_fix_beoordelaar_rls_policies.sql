-- Fix RLS policies to allow beoordelaars to see all pending documents
-- This migration updates the user_documents table policies

-- Drop existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view own documents" ON user_documents;

-- Create new SELECT policy that allows beoordelaars to see all documents
CREATE POLICY "Users can view own documents and beoordelaars can view all" 
ON user_documents FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('Beoordelaar', 'Beheerder')
  )
);

-- Drop existing UPDATE policy if it exists
DROP POLICY IF EXISTS "Users can update own documents" ON user_documents;

-- Create UPDATE policy for beoordelaars to approve/reject documents
CREATE POLICY "Users can update own documents and beoordelaars can update all" 
ON user_documents FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('Beoordelaar', 'Beheerder')
  )
);

-- Ensure RLS is enabled on user_documents table
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

-- Add comment for documentation
COMMENT ON POLICY "Users can view own documents and beoordelaars can view all" ON user_documents IS 
'Allows users to view their own documents and beoordelaars/beheerders to view all documents for review purposes';

COMMENT ON POLICY "Users can update own documents and beoordelaars can update all" ON user_documents IS 
'Allows users to update their own documents and beoordelaars/beheerders to update document status (approve/reject)';
