-- Allow anonymous access to service areas and delivery platforms for onboarding
DROP POLICY IF EXISTS "Service areas are viewable by authenticated users" ON public.service_areas;
CREATE POLICY "Service areas are viewable by everyone" 
ON public.service_areas 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Delivery platforms are viewable by authenticated users" ON public.delivery_platforms;
CREATE POLICY "Delivery platforms are viewable by everyone" 
ON public.delivery_platforms 
FOR SELECT 
USING (true);