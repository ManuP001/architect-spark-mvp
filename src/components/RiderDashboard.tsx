import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  TrendingUp, 
  Clock, 
  IndianRupee, 
  Plus,
  Bell,
  BarChart3,
  Calendar,
  Award
} from "lucide-react";

interface RiderData {
  name: string;
  weeklyGoal: number;
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
    message: string;
    urgency: 'low' | 'medium' | 'high';
    delivered: boolean;
    followed: boolean;
  }>;
}

interface RiderDashboardProps {
  riderData: RiderData;
  onAddDailyData: () => void;
  onViewRecommendations: () => void;
}

export default function RiderDashboard({ riderData, onAddDailyData, onViewRecommendations }: RiderDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const progressPercentage = Math.min((riderData.currentEarnings / riderData.weeklyGoal) * 100, 100);
  const remainingAmount = Math.max(riderData.weeklyGoal - riderData.currentEarnings, 0);
  
  const thisWeekData = riderData.dailyData.slice(-7);
  const todayData = riderData.dailyData[riderData.dailyData.length - 1];
  const averageDailyEarnings = thisWeekData.length > 0 
    ? thisWeekData.reduce((sum, day) => sum + day.earnings, 0) / thisWeekData.length 
    : 0;

  const platformStats = riderData.dailyData.reduce((acc, day) => {
    acc[day.platform] = (acc[day.platform] || 0) + day.earnings;
    return acc;
  }, {} as Record<string, number>);

  const topPlatform = Object.entries(platformStats).sort(([,a], [,b]) => b - a)[0];

  const unreadRecommendations = riderData.recommendations.filter(rec => !rec.delivered).length;

  const getUrgencyColor = (urgency: string) => {
    switch(urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Hi, {riderData.name}! 👋</h1>
            <p className="text-muted-foreground">
              {currentTime.toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadRecommendations > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewRecommendations}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {unreadRecommendations}
                </Badge>
              </Button>
            )}
            <Button
              onClick={onAddDailyData}
              className="gradient-primary hover:opacity-90 transition-smooth"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Today's Data
            </Button>
          </div>
        </div>

        {/* Weekly Progress */}
        <Card className="stat-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Weekly Progress
            </CardTitle>
            <CardDescription>
              Your journey towards ₹{riderData.weeklyGoal.toLocaleString('en-IN')} this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="earnings-text">₹{riderData.currentEarnings.toLocaleString('en-IN')}</span>
                <span className="text-sm text-muted-foreground">
                  ₹{remainingAmount.toLocaleString('en-IN')} remaining
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {progressPercentage.toFixed(1)}% completed
                </span>
                <span className="text-primary font-medium">
                  Goal: ₹{riderData.weeklyGoal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Today's Performance */}
          <Card className="stat-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-info" />
                Today's Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-earnings">
                ₹{todayData?.earnings.toLocaleString('en-IN') || '0'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {todayData?.hours || 0} hours worked
              </p>
            </CardContent>
          </Card>

          {/* Average Daily */}
          <Card className="stat-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Daily Average
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{averageDailyEarnings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Last 7 days
              </p>
            </CardContent>
          </Card>

          {/* Top Platform */}
          <Card className="stat-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-secondary" />
                Top Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {topPlatform?.[0] || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ₹{topPlatform?.[1]?.toLocaleString('en-IN') || '0'} earned
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="stat-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your last 5 days of work</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {thisWeekData.slice(-5).reverse().map((day, index) => (
                <div key={day.date} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                      <IndianRupee className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {new Date(day.date).toLocaleDateString('en-IN', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {day.hours}h • {day.platform}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold earnings-text">
                      ₹{day.earnings.toLocaleString('en-IN')}
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: day.rating }).map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-warning"></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Recommendations */}
        {riderData.recommendations.length > 0 && (
          <Card className="stat-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-secondary" />
                Latest Recommendations
              </CardTitle>
              <CardDescription>Personalized insights to boost your earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {riderData.recommendations.slice(-3).map((rec) => (
                  <div key={rec.id} className="p-3 rounded-lg border">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm flex-1">{rec.message}</p>
                      <Badge variant={getUrgencyColor(rec.urgency)} className="text-xs">
                        {rec.urgency}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              {riderData.recommendations.length > 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewRecommendations}
                  className="w-full mt-3"
                >
                  View All Recommendations
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}