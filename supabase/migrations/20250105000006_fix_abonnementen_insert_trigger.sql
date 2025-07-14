CREATE OR REPLACE FUNCTION public.set_initial_timestamps()
RETURNS TRIGGER AS $$
BEGIN
   NEW.aangemaakt_op = now();
   NEW.bijgewerkt_op = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_abonnementen_timestamps
  BEFORE INSERT ON public.abonnementen
  FOR EACH ROW
  EXECUTE FUNCTION public.set_initial_timestamps();