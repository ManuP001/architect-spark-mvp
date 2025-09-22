import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type DailyActivity = Database['public']['Tables']['daily_activities']['Row'];
type DailyActivityInsert = Database['public']['Tables']['daily_activities']['Insert'];

export const useDailyActivities = (riderProfileId?: string) => {
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    if (!riderProfileId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('rider_profile_id', riderProfileId)
        .order('activity_date', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
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
    if (!riderProfileId) throw new Error('No rider profile ID');

    try {
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

      if (error) throw error;
      
      // Add to local state
      setActivities(prev => [data, ...prev]);
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add activity');
    }
  };

  const getWeeklyStats = () => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
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
    fetchActivities();
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