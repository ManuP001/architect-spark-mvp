import { useState, useEffect } from "react";
import { useRiderProfile } from "@/hooks/useRiderProfile";
import { useDailyActivities } from "@/hooks/useDailyActivities";
import RiderOnboarding from "@/components/RiderOnboarding";
import RiderDashboard from "@/components/RiderDashboard";
import AdminPanel from "@/components/AdminPanel";
import DailyDataForm from "@/components/DailyDataForm";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Bike, Settings } from "lucide-react";

export default function Index() {
  const [currentView, setCurrentView] = useState<'onboarding' | 'dashboard' | 'admin' | 'add-data'>('onboarding');
  const [isAdmin, setIsAdmin] = useState(false);
  
  const { riderProfile, loading, error, refreshProfile } = useRiderProfile();
  const { activities, getWeeklyStats } = useDailyActivities(riderProfile?.id);
  
  // Check if user has a profile and determine initial view
  useEffect(() => {
    if (!loading) {
      if (riderProfile) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('onboarding');
      }
    }
  }, [loading, riderProfile]);

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    refreshProfile();
    setCurrentView('dashboard');
  };

  // Create mock dashboard data from real activities
  const createDashboardData = () => {
    if (!riderProfile || !activities) return null;
    
    const weeklyStats = getWeeklyStats();
    
    return {
      name: riderProfile.name,
      weeklyGoal: Number(riderProfile.weekly_goal),
      currentEarnings: weeklyStats.totalEarnings,
      dailyData: activities.map(activity => ({
        date: activity.activity_date,
        earnings: Number(activity.earnings),
        hours: Number(activity.hours_worked),
        platform: activity.primary_platform,
        rating: activity.satisfaction_rating,
      })),
      recommendations: [
        {
          id: '1',
          message: `You're ${weeklyStats.totalEarnings >= Number(riderProfile.weekly_goal) ? 'ahead of' : 'behind'} your weekly target. ${weeklyStats.totalEarnings < Number(riderProfile.weekly_goal) ? 'Consider working during peak hours to boost earnings.' : 'Great work! Keep up the momentum.'}`,
          urgency: (weeklyStats.totalEarnings >= Number(riderProfile.weekly_goal) ? 'low' : 'medium') as 'low' | 'medium' | 'high',
          delivered: false,
          followed: false,
        },
        {
          id: '2', 
          message: weeklyStats.totalHours > 0 ? `Your average rating is ${weeklyStats.avgRating.toFixed(1)}/5. ${weeklyStats.avgRating < 4 ? 'Focus on customer service to improve ratings.' : 'Excellent customer satisfaction!'}` : 'Add your first activity to get personalized recommendations.',
          urgency: (weeklyStats.avgRating < 4 ? 'high' : 'low') as 'low' | 'medium' | 'high',
          delivered: false,
          followed: false,
        }
      ]
    };
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-destructive text-lg mb-4">⚠️ Error loading app</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refreshProfile}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="gradient-hero w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center shadow-glow animate-pulse">
            <Bike className="h-8 w-8 text-white" />
          </div>
          <p className="text-muted-foreground">Loading Rider Co-pilot...</p>
        </div>
      </div>
    );
  }

  // Render current view
  if (currentView === 'onboarding') {
    return <RiderOnboarding onComplete={handleOnboardingComplete} />;
  }

  if (currentView === 'add-data' && riderProfile) {
    return (
      <DailyDataForm
        onSubmit={() => setCurrentView('dashboard')}
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'admin') {
    return (
      <AdminPanel onBack={() => setCurrentView('dashboard')} />
    );
  }

  // Dashboard view
  const dashboardData = createDashboardData();
  
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Unable to load dashboard data</p>
          <Button onClick={refreshProfile}>Refresh</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Admin Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdmin(!isAdmin)}
          className="shadow-lg"
        >
          <Settings className="h-4 w-4 mr-2" />
          {isAdmin ? 'User' : 'Admin'}
        </Button>
      </div>

      {isAdmin ? (
        <AdminPanel onBack={() => setIsAdmin(false)} />
      ) : (
        <RiderDashboard
          riderData={dashboardData}
          onAddDailyData={() => setCurrentView('add-data')}
          onViewRecommendations={() => toast({
            title: "Recommendations",
            description: "View all your personalized earning recommendations.",
          })}
        />
      )}
    </div>
  );
}