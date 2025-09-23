-- Update RLS policies to allow anonymous access to rider data tables

-- Drop existing restrictive policies for rider_profiles
DROP POLICY IF EXISTS "Users can create their own profile" ON public.rider_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.rider_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.rider_profiles;

-- Create new permissive policies for rider_profiles
CREATE POLICY "Anyone can create rider profiles" 
ON public.rider_profiles 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view rider profiles" 
ON public.rider_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update rider profiles" 
ON public.rider_profiles 
FOR UPDATE 
USING (true);

-- Drop existing restrictive policies for daily_activities
DROP POLICY IF EXISTS "Users can create their own daily activities" ON public.daily_activities;
DROP POLICY IF EXISTS "Users can update their own daily activities" ON public.daily_activities;
DROP POLICY IF EXISTS "Users can view their own daily activities" ON public.daily_activities;

-- Create new permissive policies for daily_activities
CREATE POLICY "Anyone can create daily activities" 
ON public.daily_activities 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view daily activities" 
ON public.daily_activities 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update daily activities" 
ON public.daily_activities 
FOR UPDATE 
USING (true);

-- Drop existing restrictive policies for rider_platforms
DROP POLICY IF EXISTS "Users can manage their own platforms" ON public.rider_platforms;
DROP POLICY IF EXISTS "Users can view their own platforms" ON public.rider_platforms;

-- Create new permissive policies for rider_platforms
CREATE POLICY "Anyone can manage rider platforms" 
ON public.rider_platforms 
FOR ALL 
USING (true);

-- Drop existing restrictive policies for rider_service_areas
DROP POLICY IF EXISTS "Users can manage their own service areas" ON public.rider_service_areas;
DROP POLICY IF EXISTS "Users can view their own service areas" ON public.rider_service_areas;

-- Create new permissive policies for rider_service_areas
CREATE POLICY "Anyone can manage rider service areas" 
ON public.rider_service_areas 
FOR ALL 
USING (true);

-- Make user_id nullable in rider_profiles since we won't have authenticated users
ALTER TABLE public.rider_profiles ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.rider_profiles ALTER COLUMN user_id SET DEFAULT NULL;