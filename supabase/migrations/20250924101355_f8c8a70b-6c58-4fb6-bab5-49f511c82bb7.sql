-- Revert security changes and create device-based session system
-- This allows data flow without traditional authentication while maintaining some security

-- Drop the restrictive policies that require authentication
DROP POLICY IF EXISTS "Users can view own rider profile" ON public.rider_profiles;
DROP POLICY IF EXISTS "Users can create own rider profile" ON public.rider_profiles;
DROP POLICY IF EXISTS "Users can update own rider profile" ON public.rider_profiles;

DROP POLICY IF EXISTS "Users can view own daily activities" ON public.daily_activities;
DROP POLICY IF EXISTS "Users can create own daily activities" ON public.daily_activities;
DROP POLICY IF EXISTS "Users can update own daily activities" ON public.daily_activities;

DROP POLICY IF EXISTS "Users can manage own rider platforms" ON public.rider_platforms;
DROP POLICY IF EXISTS "Users can manage own rider service areas" ON public.rider_service_areas;

-- Make user_id nullable again and add device_id for session tracking
ALTER TABLE public.rider_profiles ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.rider_profiles ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Create simple policies that allow device-based access
CREATE POLICY "Device can view own rider profile" 
ON public.rider_profiles 
FOR SELECT 
USING (device_id = current_setting('request.headers', true)::json->>'x-device-id' OR device_id IS NULL);

CREATE POLICY "Device can create rider profile" 
ON public.rider_profiles 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Device can update own rider profile" 
ON public.rider_profiles 
FOR UPDATE 
USING (device_id = current_setting('request.headers', true)::json->>'x-device-id' OR device_id IS NULL);

-- Daily activities policies
CREATE POLICY "Device can view own daily activities" 
ON public.daily_activities 
FOR SELECT 
USING (rider_profile_id IN (
  SELECT id FROM public.rider_profiles 
  WHERE device_id = current_setting('request.headers', true)::json->>'x-device-id' OR device_id IS NULL
));

CREATE POLICY "Device can create daily activities" 
ON public.daily_activities 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Device can update daily activities" 
ON public.daily_activities 
FOR UPDATE 
USING (rider_profile_id IN (
  SELECT id FROM public.rider_profiles 
  WHERE device_id = current_setting('request.headers', true)::json->>'x-device-id' OR device_id IS NULL
));

-- Platform and service area policies
CREATE POLICY "Device can manage rider platforms" 
ON public.rider_platforms 
FOR ALL 
USING (true);

CREATE POLICY "Device can manage rider service areas" 
ON public.rider_service_areas 
FOR ALL 
USING (true);