import { useState, useEffect } from "react";
import RiderOnboarding from "@/components/RiderOnboarding";
import RiderDashboard from "@/components/RiderDashboard";
import DailyDataForm from "@/components/DailyDataForm";
import AdminPanel from "@/components/AdminPanel";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface RiderData {
  name: string;
  age: string;
  phone: string;
  weeklyGoal: number;
  hoursPerDay: string;
  area: string;
  platforms: string[];
  currentEarnings: number;
  dailyData: Array<{
    date: string;
    earnings: number;
    hours: number;
    platform: string;
    rating: number;
  }>;
  recommendations: Array<{
    id: string;
    riderId: string;
    message: string;
    urgency: 'low' | 'medium' | 'high';
    delivered: boolean;
    followed: boolean;
    createdAt: string;
  }>;
}

const Index = () => {
  const [currentView, setCurrentView] = useState<'onboarding' | 'dashboard' | 'daily-input' | 'admin'>('onboarding');
  const [riderData, setRiderData] = useState<RiderData | null>(null);

  // Sample data for demonstration
  const sampleRiderData: RiderData = {
    name: "Rajesh Kumar",
    age: "28",
    phone: "+91 9876543210",
    weeklyGoal: 5000,
    hoursPerDay: "8",
    area: "HSR Layout Sector 2",
    platforms: ["Zomato", "Swiggy", "Blinkit"],
    currentEarnings: 3200,
    dailyData: [
      { date: "2024-01-08", earnings: 650, hours: 8, platform: "Zomato", rating: 4 },
      { date: "2024-01-09", earnings: 580, hours: 7.5, platform: "Swiggy", rating: 3 },
      { date: "2024-01-10", earnings: 720, hours: 9, platform: "Zomato", rating: 5 },
      { date: "2024-01-11", earnings: 620, hours: 8, platform: "Blinkit", rating: 4 },
      { date: "2024-01-12", earnings: 630, hours: 7, platform: "Swiggy", rating: 4 },
    ],
    recommendations: [
      {
        id: "1",
        riderId: "1",
        message: "High demand expected in Sector 3 during 7-9 PM today. Consider switching to that area for better earnings.",
        urgency: "medium",
        delivered: true,
        followed: false,
        createdAt: "2024-01-12T10:00:00Z"
      },
      {
        id: "2", 
        riderId: "1",
        message: "Zomato is running a promotion today - you might see 15% more orders than usual.",
        urgency: "low",
        delivered: true,
        followed: true,
        createdAt: "2024-01-12T08:00:00Z"
      }
    ]
  };

  const handleOnboardingComplete = (data: any) => {
    const newRiderData: RiderData = {
      ...data,
      weeklyGoal: parseInt(data.weeklyGoal),
      currentEarnings: 0,
      dailyData: [],
      recommendations: []
    };
    setRiderData(newRiderData);
    setCurrentView('dashboard');
  };

  const handleDailyDataSubmit = (data: any) => {
    if (riderData) {
      const updatedData = {
        ...riderData,
        currentEarnings: riderData.currentEarnings + parseInt(data.earnings),
        dailyData: [...riderData.dailyData, {
          date: data.date,
          earnings: parseInt(data.earnings),
          hours: parseFloat(data.hours),
          platform: data.primaryPlatform,
          rating: data.rating
        }]
      };
      setRiderData(updatedData);
    }
    setCurrentView('dashboard');
  };

  const handleCreateRecommendation = (rec: any) => {
    if (riderData) {
      const newRec = {
        ...rec,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        delivered: true,
        followed: false
      };
      setRiderData({
        ...riderData,
        recommendations: [...riderData.recommendations, newRec]
      });
    }
  };

  // Demo mode toggle
  const enableDemo = () => {
    setRiderData(sampleRiderData);
    setCurrentView('dashboard');
  };

  if (currentView === 'onboarding') {
    return (
      <div>
        <RiderOnboarding onComplete={handleOnboardingComplete} />
        {/* Demo button for testing */}
        <div className="fixed bottom-4 right-4">
          <Button onClick={enableDemo} variant="outline" size="sm">
            Try Demo
          </Button>
        </div>
      </div>
    );
  }

  if (currentView === 'daily-input' && riderData) {
    return (
      <DailyDataForm 
        onSubmit={handleDailyDataSubmit}
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'admin') {
    const riders = riderData ? [{
      id: "1",
      name: riderData.name,
      phone: riderData.phone,
      weeklyGoal: riderData.weeklyGoal,
      currentEarnings: riderData.currentEarnings,
      avgDailyHours: parseFloat(riderData.hoursPerDay),
      lastActive: new Date().toISOString(),
      satisfactionRating: riderData.dailyData.length > 0 
        ? riderData.dailyData.reduce((sum, day) => sum + day.rating, 0) / riderData.dailyData.length 
        : 0
    }] : [];

    return (
      <AdminPanel
        riders={riders}
        recommendations={riderData?.recommendations || []}
        onCreateRecommendation={handleCreateRecommendation}
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'dashboard' && riderData) {
    return (
      <div>
        <RiderDashboard
          riderData={riderData}
          onAddDailyData={() => setCurrentView('daily-input')}
          onViewRecommendations={() => {}}
        />
        {/* Admin access button */}
        <div className="fixed bottom-4 right-4">
          <Button 
            onClick={() => setCurrentView('admin')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Admin
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Rider Co-pilot</h1>
        <p className="text-xl text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  );
};

export default Index;
