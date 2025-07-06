-- Drop existing triggers on betalingen table
DROP TRIGGER IF EXISTS on_betalingen_update ON public.betalingen;

-- Create the function to update the bijgewerkt_op column
CREATE OR REPLACE FUNCTION public.update_bijgewerkt_op_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.bijgewerkt_op = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger to update the bijgewerkt_op column before any update
CREATE TRIGGER on_betalingen_update
  BEFORE UPDATE ON public.betalingen
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_bijgewerkt_op_column();