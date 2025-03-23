
-- This function will be called from the client to generate a unique room code
CREATE OR REPLACE FUNCTION public.generate_room_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  code TEXT := '';
  i INTEGER;
  unique_code BOOLEAN := false;
BEGIN
  WHILE NOT unique_code LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Check if the code already exists
    SELECT NOT EXISTS(SELECT 1 FROM public.call_rooms WHERE room_code = code) INTO unique_code;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql VOLATILE;
