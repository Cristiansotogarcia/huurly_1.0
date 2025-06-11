-- Add missing document types to the document_type enum
-- This migration adds 'employment_contract' and 'reference' to the enum

-- First, add the new enum values
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'employment_contract';
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'reference';

-- Add comment for documentation
COMMENT ON TYPE document_type IS 'Document types: identity, payslip, employment_contract, reference';
