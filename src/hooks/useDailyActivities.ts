import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DeviceSession } from '@/utils/deviceSession';
import type { Database } from '@/integrations/supabase/types';

type DailyActivity = Database['public']['Tables']['daily_activities']['Row'];

export const useDailyActivities = (riderProfileId?: string) => {
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    if (!riderProfileId) return;

    try {
      setLoading(true);
      setError(null);
      console.log('📊 Fetching daily activities for profile:', riderProfileId);
      
      const { data, error } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('rider_profile_id', riderProfileId)
        .order('activity_date', { ascending: false });

      if (error) throw error;
      
      console.log('✅ Activities fetched:', data?.length || 0);
      setActivities(data || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch activities';
      console.error('❌ Fetch activities failed:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async (activityData: {
    earnings: number;
    hours: number;
    primaryPlatform: string;
    rating: number;
    date?: string;
  }) => {
    if (!riderProfileId) {
      console.error('❌ No rider profile ID for activity');
      throw new Error('No rider profile ID available');
    }

    try {
      console.log('📝 Adding daily activity...', activityData);
      
      // Validate inputs
      if (activityData.earnings < 0) {
        throw new Error('Earnings cannot be negative');
      }
      
      if (activityData.hours <= 0 || activityData.hours > 24) {
        throw new Error('Hours worked must be between 0.1 and 24');
      }
      
      if (activityData.rating < 1 || activityData.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const { data, error } = await supabase
        .from('daily_activities')
        .insert({
          rider_profile_id: riderProfileId,
          earnings: activityData.earnings,
          hours_worked: activityData.hours,
          primary_platform: activityData.primaryPlatform,
          satisfaction_rating: activityData.rating,
          activity_date: activityData.date || new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Activity creation error:', error);
        throw error;
      }
      
      console.log('✅ Activity created successfully:', data);
      
      // Add to local state
      setActivities(prev => [data, ...prev]);
      
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add activity';
      console.error('❌ Add activity failed:', errorMsg);
      throw err instanceof Error ? err : new Error(errorMsg);
    }
  };

  const getWeeklyStats = () => {
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weeklyActivities = activities.filter(activity => 
      new Date(activity.activity_date) >= weekStart
    );

    const totalEarnings = weeklyActivities.reduce((sum, activity) => 
      sum + Number(activity.earnings), 0
    );

    const totalHours = weeklyActivities.reduce((sum, activity) => 
      sum + Number(activity.hours_worked), 0
    );

    const avgRating = weeklyActivities.length > 0 
      ? weeklyActivities.reduce((sum, activity) => sum + activity.satisfaction_rating, 0) / weeklyActivities.length
      : 0;

    return {
      totalEarnings,
      totalHours,
      avgRating,
      daysWorked: weeklyActivities.length,
      activities: weeklyActivities,
    };
  };

  useEffect(() => {
    if (riderProfileId) {
      fetchActivities();
    }
  }, [riderProfileId]);

  return {
    activities,
    loading,
    error,
    addActivity,
    getWeeklyStats,
    refreshActivities: fetchActivities,
  };
};