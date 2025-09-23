import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type RiderProfile = Database['public']['Tables']['rider_profiles']['Row'];
type ServiceArea = Database['public']['Tables']['service_areas']['Row'];
type DeliveryPlatform = Database['public']['Tables']['delivery_platforms']['Row'];

export const useRiderProfile = () => {
  const [riderProfile, setRiderProfile] = useState<RiderProfile | null>(null);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [platforms, setPlatforms] = useState<DeliveryPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching rider profile...');
      
      // Get the first rider profile (anonymous access)
      const { data: profile, error: profileError } = await supabase
        .from('rider_profiles')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
        throw profileError;
      }
      
      console.log('📊 Profile fetched:', profile ? 'Found' : 'Not found');
      setRiderProfile(profile);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch profile';
      console.error('❌ Profile fetch failed:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('service_areas')
        .select('*')
        .order('name');

      if (error) throw error;
      setServiceAreas(data || []);
    } catch (err) {
      console.error('Error fetching service areas:', err);
    }
  };

  const fetchPlatforms = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_platforms')
        .select('*')
        .order('category, name');

      if (error) throw error;
      setPlatforms(data || []);
    } catch (err) {
      console.error('Error fetching platforms:', err);
    }
  };

  const createProfile = async (profileData: {
    name: string;
    age: number;
    phone: string;
    weekly_goal: number;
    hours_per_day: number;
    areas: string[];
    platforms: string[];
  }) => {
    try {
      console.log('🚀 Creating rider profile...');
      
      // Create rider profile without user authentication
      const { data: profile, error: profileError } = await supabase
        .from('rider_profiles')
        .insert({
          user_id: null, // No authentication required
          name: profileData.name,
          age: profileData.age,
          phone: profileData.phone,
          weekly_goal: profileData.weekly_goal,
          hours_per_day: profileData.hours_per_day,
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        throw profileError;
      }

      // Link service areas
      if (profileData.areas.length > 0) {
        const { data: areaData } = await supabase
          .from('service_areas')
          .select('id, name')
          .in('name', profileData.areas);

        if (areaData) {
          const areaLinks = areaData.map(area => ({
            rider_profile_id: profile.id,
            service_area_id: area.id,
          }));

          const { error: areaError } = await supabase
            .from('rider_service_areas')
            .insert(areaLinks);

          if (areaError) throw areaError;
        }
      }

      // Link platforms
      if (profileData.platforms.length > 0) {
        const { data: platformData } = await supabase
          .from('delivery_platforms')
          .select('id, name')
          .in('name', profileData.platforms);

        if (platformData) {
          const platformLinks = platformData.map(platform => ({
            rider_profile_id: profile.id,
            platform_id: platform.id,
          }));

          const { error: platformError } = await supabase
            .from('rider_platforms')
            .insert(platformLinks);

          if (platformError) throw platformError;
        }
      }

      setRiderProfile(profile);
      return profile;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create profile');
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchServiceAreas();
    fetchPlatforms();
  }, []);

  return {
    riderProfile,
    serviceAreas,
    platforms,
    loading,
    error,
    createProfile,
    refreshProfile: fetchProfile,
  };
};