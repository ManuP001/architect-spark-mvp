-- Fix critical security issue: Update RLS policies to restrict access to profile owners only
-- This prevents hackers from accessing sensitive rider personal information

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view rider profiles" ON public.rider_profiles;
DROP POLICY IF EXISTS "Anyone can create rider profiles" ON public.rider_profiles;  
DROP POLICY IF EXISTS "Anyone can update rider profiles" ON public.rider_profiles;

DROP POLICY IF EXISTS "Anyone can view daily activities" ON public.daily_activities;
DROP POLICY IF EXISTS "Anyone can create daily activities" ON public.daily_activities;
DROP POLICY IF EXISTS "Anyone can update daily activities" ON public.daily_activities;

DROP POLICY IF EXISTS "Anyone can manage rider platforms" ON public.rider_platforms;
DROP POLICY IF EXISTS "Anyone can manage rider service areas" ON public.rider_service_areas;

-- Create secure policies that require authentication and restrict access to profile owners
-- Rider profiles: users can only see and manage their own profiles
CREATE POLICY "Users can view own rider profile" 
ON public.rider_profiles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own rider profile" 
ON public.rider_profiles 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own rider profile" 
ON public.rider_profiles 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Daily activities: users can only see and manage activities for their profiles
CREATE POLICY "Users can view own daily activities" 
ON public.daily_activities 
FOR SELECT 
TO authenticated
USING (rider_profile_id IN (
  SELECT id FROM public.rider_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create own daily activities" 
ON public.daily_activities 
FOR INSERT 
TO authenticated
WITH CHECK (rider_profile_id IN (
  SELECT id FROM public.rider_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update own daily activities" 
ON public.daily_activities 
FOR UPDATE 
TO authenticated
USING (rider_profile_id IN (
  SELECT id FROM public.rider_profiles WHERE user_id = auth.uid()
))
WITH CHECK (rider_profile_id IN (
  SELECT id FROM public.rider_profiles WHERE user_id = auth.uid()
));

-- Rider platforms: users can only manage platforms for their own profiles
CREATE POLICY "Users can manage own rider platforms" 
ON public.rider_platforms 
FOR ALL 
TO authenticated
USING (rider_profile_id IN (
  SELECT id FROM public.rider_profiles WHERE user_id = auth.uid()
))
WITH CHECK (rider_profile_id IN (
  SELECT id FROM public.rider_profiles WHERE user_id = auth.uid()
));

-- Rider service areas: users can only manage service areas for their own profiles  
CREATE POLICY "Users can manage own rider service areas" 
ON public.rider_service_areas 
FOR ALL 
TO authenticated
USING (rider_profile_id IN (
  SELECT id FROM public.rider_profiles WHERE user_id = auth.uid()
))
WITH CHECK (rider_profile_id IN (
  SELECT id FROM public.rider_profiles WHERE user_id = auth.uid()
));

-- Update rider_profiles table to make user_id NOT NULL and set a proper foreign key
-- This ensures every profile is linked to a user session
ALTER TABLE public.rider_profiles ALTER COLUMN user_id SET NOT NULL;