-- Create rider profiles table for main onboarding data
CREATE TABLE public.rider_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  phone TEXT NOT NULL,
  weekly_goal DECIMAL(10,2) NOT NULL,
  hours_per_day DECIMAL(4,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create service areas reference table
CREATE TABLE public.service_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create delivery platforms reference table
CREATE TABLE public.delivery_platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category, name)
);

-- Create junction table for rider service areas
CREATE TABLE public.rider_service_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rider_profile_id UUID NOT NULL REFERENCES public.rider_profiles(id) ON DELETE CASCADE,
  service_area_id UUID NOT NULL REFERENCES public.service_areas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(rider_profile_id, service_area_id)
);

-- Create junction table for rider platforms
CREATE TABLE public.rider_platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rider_profile_id UUID NOT NULL REFERENCES public.rider_profiles(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES public.delivery_platforms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(rider_profile_id, platform_id)
);

-- Enable Row Level Security
ALTER TABLE public.rider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rider_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rider_platforms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for rider_profiles
CREATE POLICY "Users can view their own profile" 
ON public.rider_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.rider_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.rider_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for service areas (readable by all authenticated users)
CREATE POLICY "Service areas are viewable by authenticated users" 
ON public.service_areas 
FOR SELECT 
TO authenticated
USING (true);

-- Create RLS policies for delivery platforms (readable by all authenticated users)
CREATE POLICY "Delivery platforms are viewable by authenticated users" 
ON public.delivery_platforms 
FOR SELECT 
TO authenticated
USING (true);

-- Create RLS policies for rider_service_areas
CREATE POLICY "Users can view their own service areas" 
ON public.rider_service_areas 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.rider_profiles 
  WHERE id = rider_profile_id AND user_id = auth.uid()
));

CREATE POLICY "Users can manage their own service areas" 
ON public.rider_service_areas 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.rider_profiles 
  WHERE id = rider_profile_id AND user_id = auth.uid()
));

-- Create RLS policies for rider_platforms
CREATE POLICY "Users can view their own platforms" 
ON public.rider_platforms 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.rider_profiles 
  WHERE id = rider_profile_id AND user_id = auth.uid()
));

CREATE POLICY "Users can manage their own platforms" 
ON public.rider_platforms 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.rider_profiles 
  WHERE id = rider_profile_id AND user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_rider_profiles_updated_at
  BEFORE UPDATE ON public.rider_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert HSR Layout service areas
INSERT INTO public.service_areas (name) VALUES 
  ('HSR Layout Sector 1'),
  ('HSR Layout Sector 2'),
  ('HSR Layout Sector 3'),
  ('HSR Layout Sector 4'),
  ('HSR Layout Sector 5'),
  ('HSR Layout Sector 6'),
  ('HSR Layout Sector 7'),
  ('Koramangala'),
  ('BTM Layout'),
  ('Jayanagar');

-- Insert delivery platforms
INSERT INTO public.delivery_platforms (category, name) VALUES 
  ('Food Delivery', 'Swiggy'),
  ('Food Delivery', 'Zomato'),
  ('Food Delivery', 'Uber Eats'),
  ('Grocery & Essentials', 'BigBasket'),
  ('Grocery & Essentials', 'Grofers'),
  ('Grocery & Essentials', 'Amazon Fresh'),
  ('Logistics & Courier', 'Dunzo'),
  ('Logistics & Courier', 'Porter'),
  ('Logistics & Courier', 'Shadowfax');