import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import RiderOnboarding from "@/components/RiderOnboarding";
import RiderDashboard from "@/components/RiderDashboard";
import DailyDataForm from "@/components/DailyDataForm";
import AdminPanel from "@/components/AdminPanel";
import AuthTestPanel from "@/components/AuthTestPanel";
import { useRiderProfile } from "@/hooks/useRiderProfile";
import { useDailyActivities } from "@/hooks/useDailyActivities";

export default function Index() {
  const [currentView, setCurrentView] = useState<'onboarding' | 'dashboard' | 'daily-input' | 'admin' | 'test'>('onboarding');
  const { riderProfile, loading, refreshProfile } = useRiderProfile();
  const { getWeeklyStats, refreshActivities } = useDailyActivities(riderProfile?.id);

  // Set initial view based on profile existence
  useEffect(() => {
    if (!loading) {
      if (riderProfile) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('onboarding');
      }
    }
  }, [riderProfile, loading]);

  const weeklyStats = getWeeklyStats();
  
  // Create dashboard data from Supabase data
  const dashboardData = riderProfile ? {
    name: riderProfile.name,
    weeklyGoal: Number(riderProfile.weekly_goal),
    currentEarnings: weeklyStats.totalEarnings,
    dailyData: weeklyStats.activities.map(activity => ({
      date: activity.activity_date,
      earnings: Number(activity.earnings),
      hours: Number(activity.hours_worked),
      platform: activity.primary_platform,
      rating: activity.satisfaction_rating
    })),
    recommendations: [] // Mock for now
  } : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {currentView === 'onboarding' && (
        <RiderOnboarding onComplete={() => {
          refreshProfile();
          setCurrentView('dashboard');
        }} />
      )}
      
      {currentView === 'dashboard' && dashboardData && (
        <div className="relative">
          <RiderDashboard 
            riderData={dashboardData}
            onAddDailyData={() => setCurrentView('daily-input')}
            onViewRecommendations={() => alert('Recommendations feature coming soon!')}
          />
          
          <div className="fixed bottom-4 right-4 flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentView('test')}
            >
              Debug
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentView('admin')}
            >
              Admin
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentView('onboarding')}
            >
              New Profile
            </Button>
          </div>
        </div>
      )}
      
      {currentView === 'daily-input' && (
        <DailyDataForm 
          onSubmit={() => {
            refreshActivities();
            setCurrentView('dashboard');
          }}
          onBack={() => setCurrentView('dashboard')}
        />
      )}
      
      {currentView === 'admin' && (
        <AdminPanel 
          onBack={() => setCurrentView(riderProfile ? 'dashboard' : 'onboarding')}
        />
      )}
      
      {currentView === 'test' && (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
          <div className="max-w-4xl mx-auto pt-8">
            <div className="mb-4">
              <Button 
                variant="outline" 
                onClick={() => setCurrentView(riderProfile ? 'dashboard' : 'onboarding')}
              >
                ← Back
              </Button>
            </div>
            <AuthTestPanel />
          </div>
        </div>
      )}
    </div>
  );
}