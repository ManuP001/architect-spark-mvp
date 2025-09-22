-- Create daily_activities table to track rider earnings and performance
CREATE TABLE public.daily_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rider_profile_id UUID NOT NULL,
  earnings NUMERIC NOT NULL,
  hours_worked NUMERIC NOT NULL,
  primary_platform TEXT NOT NULL,
  satisfaction_rating INTEGER NOT NULL CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for daily activities
CREATE POLICY "Users can view their own daily activities" 
ON public.daily_activities 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM rider_profiles 
  WHERE rider_profiles.id = daily_activities.rider_profile_id 
  AND rider_profiles.user_id = auth.uid()
));

CREATE POLICY "Users can create their own daily activities" 
ON public.daily_activities 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM rider_profiles 
  WHERE rider_profiles.id = daily_activities.rider_profile_id 
  AND rider_profiles.user_id = auth.uid()
));

CREATE POLICY "Users can update their own daily activities" 
ON public.daily_activities 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM rider_profiles 
  WHERE rider_profiles.id = daily_activities.rider_profile_id 
  AND rider_profiles.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_activities_updated_at
BEFORE UPDATE ON public.daily_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create unique constraint to prevent duplicate entries for same rider on same date
ALTER TABLE public.daily_activities 
ADD CONSTRAINT daily_activities_rider_date_unique 
UNIQUE (rider_profile_id, activity_date);