-- Add enhanced profile fields to huurders table
-- This migration adds support for detailed children information, partner income, and extra income

ALTER TABLE public.huurders 
ADD COLUMN IF NOT EXISTS has_children boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS number_of_children integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS children_ages integer[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS partner_income numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS extra_income numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS extra_income_description text DEFAULT '';

-- Add comments for documentation
COMMENT ON COLUMN public.huurders.has_children IS 'Whether the user has children';
COMMENT ON COLUMN public.huurders.number_of_children IS 'Number of children (0-10)';
COMMENT ON COLUMN public.huurders.children_ages IS 'Array of children ages (0-25 years)';
COMMENT ON COLUMN public.huurders.partner_income IS 'Partner monthly income in euros';
COMMENT ON COLUMN public.huurders.extra_income IS 'Additional monthly income in euros';
COMMENT ON COLUMN public.huurders.extra_income_description IS 'Description of extra income source';

-- Add constraints for data validation
ALTER TABLE public.huurders 
ADD CONSTRAINT check_number_of_children CHECK (number_of_children >= 0 AND number_of_children <= 10),
ADD CONSTRAINT check_partner_income CHECK (partner_income >= 0),
ADD CONSTRAINT check_extra_income CHECK (extra_income >= 0),
ADD CONSTRAINT check_extra_income_description_length CHECK (char_length(extra_income_description) <= 200);

-- Create function to validate children ages array
CREATE OR REPLACE FUNCTION public.validate_children_ages(ages integer[])
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Return true if array is null or empty
  IF ages IS NULL OR array_length(ages, 1) IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check array length (max 10 children)
  IF array_length(ages, 1) > 10 THEN
    RETURN false;
  END IF;
  
  -- Check each age is within valid range (0-25)
  FOR i IN 1..array_length(ages, 1) LOOP
    IF ages[i] < 0 OR ages[i] > 25 THEN
      RETURN false;
    END IF;
  END LOOP;
  
  RETURN true;
END;
$$;

-- Add constraint using the validation function
ALTER TABLE public.huurders 
ADD CONSTRAINT check_children_ages_range CHECK (public.validate_children_ages(children_ages));

-- Add constraint to ensure consistency between has_children and number_of_children
ALTER TABLE public.huurders 
ADD CONSTRAINT check_children_consistency CHECK (
  (has_children = false AND number_of_children = 0 AND array_length(children_ages, 1) IS NULL) OR
  (has_children = true AND number_of_children > 0 AND array_length(children_ages, 1) = number_of_children)
);