CREATE OR REPLACE FUNCTION public.update_bijgewerkt_op_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.bijgewerkt_op = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_abonnementen_bijgewerkt_op
  BEFORE UPDATE ON public.abonnementen
  FOR EACH ROW
  EXECUTE FUNCTION public.update_bijgewerkt_op_column();