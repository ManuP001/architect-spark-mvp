import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import RiderOnboarding from "@/components/RiderOnboarding";
import RiderDashboard from "@/components/RiderDashboard";
import DailyDataForm from "@/components/DailyDataForm";
import AdminPanel from "@/components/AdminPanel";
import AuthTestPanel from "@/components/AuthTestPanel";
import AuthFlow from "@/components/AuthFlow";
import { useRiderProfile } from "@/hooks/useRiderProfile";
import { useDailyActivities } from "@/hooks/useDailyActivities";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const [currentView, setCurrentView] = useState<'auth' | 'onboarding' | 'dashboard' | 'daily-input' | 'admin' | 'test'>('auth');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { riderProfile, loading, refreshProfile } = useRiderProfile();
  const { getWeeklyStats, refreshActivities } = useDailyActivities(riderProfile?.id);

  const handleOnboardingComplete = () => {
    setCurrentView('dashboard');
  };

  const handleDailyDataSubmit = () => {
    setCurrentView('dashboard');
  };

  // Check authentication status and manage flow
  useEffect(() => {
    const checkAuthAndProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log('✅ User authenticated:', user.id);
          setIsAuthenticated(true);
          
          // If authenticated but no profile, show onboarding
          if (!riderProfile && !loading) {
            setCurrentView('onboarding');
          } 
          // If authenticated and has profile, show dashboard
          else if (riderProfile && currentView !== 'admin' && currentView !== 'test') {
            setCurrentView('dashboard');
          }
        } else {
          console.log('🔍 No authenticated user');
          setIsAuthenticated(false);
          if (currentView !== 'admin' && currentView !== 'test') {
            setCurrentView('auth');
          }
        }
      } catch (error) {
        console.error('❌ Auth check error:', error);
        setIsAuthenticated(false);
        setCurrentView('auth');
      }
    };

    checkAuthAndProfile();
  }, [riderProfile, loading, currentView]);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        setCurrentView('onboarding');
        refreshProfile();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setCurrentView('auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [refreshProfile]);

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

  // Handle authentication success
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setCurrentView('onboarding');
  };

  // Show auth flow if not authenticated
  if (currentView === 'auth') {
    return <AuthFlow onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen">
      {currentView === 'onboarding' && isAuthenticated && (
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
              onClick={async () => {
                await supabase.auth.signOut();
                setCurrentView('auth');
              }}
            >
              Sign Out
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
          onBack={() => setCurrentView(isAuthenticated && riderProfile ? 'dashboard' : 'auth')}
        />
      )}
      
      {currentView === 'test' && (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
          <div className="max-w-4xl mx-auto pt-8">
            <div className="mb-4">
              <Button 
                variant="outline" 
                onClick={() => setCurrentView(isAuthenticated && riderProfile ? 'dashboard' : 'auth')}
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