-- Add profile views counter to huurders table
ALTER TABLE public.huurders 
ADD COLUMN IF NOT EXISTS profiel_weergaven integer DEFAULT 0;

-- Create function to track profile views
CREATE OR REPLACE FUNCTION public.track_profile_view(
  p_huurder_id uuid,
  p_viewer_id uuid,
  p_viewer_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Increment the profile views counter
  UPDATE public.huurders
  SET profiel_weergaven = COALESCE(profiel_weergaven, 0) + 1
  WHERE id = p_huurder_id;
  
  -- Create notification for the tenant
  INSERT INTO public.notificaties (
    gebruiker_id,
    type,
    titel,
    inhoud,
    actie_url,
    gelezen
  ) VALUES (
    p_huurder_id,
    'profiel_bekeken',
    'Profiel Bekeken',
    p_viewer_name || ' heeft je profiel bekeken',
    '/dashboard',
    false
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.track_profile_view(uuid, uuid, text) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.track_profile_view IS 'Track when a verhuurder views a huurder profile';
