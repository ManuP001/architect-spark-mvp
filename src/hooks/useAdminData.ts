import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type RiderProfile = Database['public']['Tables']['rider_profiles']['Row'];
type DailyActivity = Database['public']['Tables']['daily_activities']['Row'];

interface RiderWithStats extends RiderProfile {
  currentEarnings: number;
  avgDailyHours: number;
  lastActive: string;
  satisfactionRating: number;
  dailyActivities: DailyActivity[];
}

export const useAdminData = () => {
  const [riders, setRiders] = useState<RiderWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      
      // Fetch all rider profiles
      const { data: profiles, error: profileError } = await supabase
        .from('rider_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileError) throw profileError;

      if (!profiles || profiles.length === 0) {
        setRiders([]);
        return;
      }

      // Fetch all daily activities
      const { data: activities, error: activitiesError } = await supabase
        .from('daily_activities')
        .select('*')
        .order('activity_date', { ascending: false });

      if (activitiesError) throw activitiesError;

      // Process rider data with stats
      const ridersWithStats: RiderWithStats[] = profiles.map(profile => {
        const riderActivities = activities?.filter(
          activity => activity.rider_profile_id === profile.id
        ) || [];

        // Calculate weekly stats (last 7 days)
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        weekStart.setHours(0, 0, 0, 0);

        const weeklyActivities = riderActivities.filter(activity =>
          new Date(activity.activity_date) >= weekStart
        );

        const currentEarnings = weeklyActivities.reduce((sum, activity) => 
          sum + Number(activity.earnings), 0
        );

        const totalHours = riderActivities.reduce((sum, activity) => 
          sum + Number(activity.hours_worked), 0
        );

        const avgDailyHours = riderActivities.length > 0 
          ? totalHours / riderActivities.length 
          : 0;

        const avgRating = riderActivities.length > 0
          ? riderActivities.reduce((sum, activity) => sum + activity.satisfaction_rating, 0) / riderActivities.length
          : 0;

        const lastActivity = riderActivities[0];
        const lastActive = lastActivity 
          ? lastActivity.activity_date 
          : profile.created_at.split('T')[0];

        return {
          ...profile,
          currentEarnings,
          avgDailyHours,
          lastActive,
          satisfactionRating: avgRating,
          dailyActivities: riderActivities,
        };
      });

      setRiders(ridersWithStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch riders');
    } finally {
      setLoading(false);
    }
  };

  const getRiderStats = () => {
    const totalEarnings = riders.reduce((sum, rider) => sum + rider.currentEarnings, 0);
    const avgSatisfaction = riders.length > 0
      ? riders.reduce((sum, rider) => sum + rider.satisfactionRating, 0) / riders.length
      : 0;

    // Active riders (those with activity in last 3 days)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const activeRiders = riders.filter(rider => {
      const lastActive = new Date(rider.lastActive);
      return lastActive > threeDaysAgo;
    }).length;

    return {
      totalRiders: riders.length,
      activeRiders,
      totalEarnings,
      avgSatisfaction,
    };
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  return {
    riders,
    loading,
    error,
    refreshData: fetchRiders,
    getRiderStats,
  };
};