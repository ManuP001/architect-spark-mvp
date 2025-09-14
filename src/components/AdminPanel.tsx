import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  AlertTriangle,
  IndianRupee,
  Clock,
  Target,
  Send,
  Eye
} from "lucide-react";

interface RiderSummary {
  id: string;
  name: string;
  phone: string;
  weeklyGoal: number;
  currentEarnings: number;
  avgDailyHours: number;
  lastActive: string;
  satisfactionRating: number;
}

interface MarketInsight {
  area: string;
  demandLevel: 'low' | 'medium' | 'high';
  peakHours: string;
  topPlatform: string;
  notes: string;
}

interface Recommendation {
  id: string;
  riderId: string;
  message: string;
  urgency: 'low' | 'medium' | 'high';
  delivered: boolean;
  followed: boolean;
  createdAt: string;
}

interface AdminPanelProps {
  riders: RiderSummary[];
  recommendations: Recommendation[];
  onCreateRecommendation: (rec: Omit<Recommendation, 'id' | 'createdAt' | 'delivered' | 'followed'>) => void;
  onBack: () => void;
}

export default function AdminPanel({ riders, recommendations, onCreateRecommendation, onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'recommendations'>('overview');
  const [newRecommendation, setNewRecommendation] = useState({
    riderId: '',
    message: '',
    urgency: 'medium' as 'low' | 'medium' | 'high'
  });

  const totalEarnings = riders.reduce((sum, rider) => sum + rider.currentEarnings, 0);
  const avgSatisfaction = riders.length > 0 
    ? riders.reduce((sum, rider) => sum + rider.satisfactionRating, 0) / riders.length 
    : 0;
  const activeRiders = riders.filter(rider => {
    const lastActive = new Date(rider.lastActive);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return lastActive > threeDaysAgo;
  }).length;

  const handleCreateRecommendation = () => {
    if (!newRecommendation.riderId || !newRecommendation.message) {
      toast({
        title: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    onCreateRecommendation({
      riderId: newRecommendation.riderId,
      message: newRecommendation.message,
      urgency: newRecommendation.urgency
    });

    setNewRecommendation({
      riderId: '',
      message: '',
      urgency: 'medium'
    });

    toast({
      title: "Recommendation sent!",
      description: "The recommendation has been delivered to the rider.",
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch(urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getProgressColor = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    if (percentage >= 80) return 'text-earnings';
    if (percentage >= 50) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Rider Co-pilot Management</p>
          </div>
          <Button variant="outline" onClick={onBack}>
            Back to App
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: Users },
            { id: 'insights', label: 'Market Insights', icon: TrendingUp },
            { id: 'recommendations', label: 'Recommendations', icon: MessageSquare }
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeTab === id ? 'default' : 'outline'}
              onClick={() => setActiveTab(id as any)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="stat-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Total Riders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{riders.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeRiders} active this week
                  </p>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-earnings" />
                    Total Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold earnings-text">
                    ₹{totalEarnings.toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-muted-foreground">This week</p>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-info" />
                    Avg Satisfaction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgSatisfaction.toFixed(1)}/5</div>
                  <p className="text-xs text-muted-foreground">Rider rating</p>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-secondary" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recommendations.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {recommendations.filter(r => r.followed).length} followed
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Riders List */}
            <Card className="stat-card">
              <CardHeader>
                <CardTitle>Registered Riders</CardTitle>
                <CardDescription>Overview of all riders and their performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riders.map((rider) => (
                    <div key={rider.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                          <span className="text-white font-bold">
                            {rider.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{rider.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {rider.phone} • {rider.avgDailyHours}h/day avg
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Last active: {new Date(rider.lastActive).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-lg ${getProgressColor(rider.currentEarnings, rider.weeklyGoal)}`}>
                          ₹{rider.currentEarnings.toLocaleString('en-IN')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          of ₹{rider.weeklyGoal.toLocaleString('en-IN')} goal
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: Math.round(rider.satisfactionRating) }).map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-warning"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Market Insights Tab */}
        {activeTab === 'insights' && (
          <Card className="stat-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Market Insights Input
              </CardTitle>
              <CardDescription>Record daily observations about demand patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-info-light border border-info/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-info" />
                    <span className="font-medium">Current Market Conditions</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Peak hours observed: 12-2 PM, 7-9 PM • High demand in Sector 2 & 3 • 
                    Zomato showing 15% higher orders today • Rain expected tomorrow, prepare riders
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Peak Hours Today</Label>
                    <Input placeholder="e.g., 12-2 PM, 7-9 PM" />
                  </div>
                  <div className="space-y-2">
                    <Label>Demand Level</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select demand level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Market Notes</Label>
                  <Textarea 
                    placeholder="Observations about today's market conditions, platform performance, weather impact, etc."
                    rows={3}
                  />
                </div>
                
                <Button className="gradient-primary hover:opacity-90">
                  Save Market Insights
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Recommendation */}
            <Card className="stat-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-secondary" />
                  Create Recommendation
                </CardTitle>
                <CardDescription>Send personalized insights to riders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Rider</Label>
                  <Select 
                    value={newRecommendation.riderId} 
                    onValueChange={(value) => setNewRecommendation(prev => ({ ...prev, riderId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a rider" />
                    </SelectTrigger>
                    <SelectContent>
                      {riders.map((rider) => (
                        <SelectItem key={rider.id} value={rider.id}>
                          {rider.name} - ₹{rider.currentEarnings}/₹{rider.weeklyGoal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Urgency Level</Label>
                  <Select 
                    value={newRecommendation.urgency} 
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setNewRecommendation(prev => ({ ...prev, urgency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - General Tip</SelectItem>
                      <SelectItem value="medium">Medium - Important Insight</SelectItem>
                      <SelectItem value="high">High - Urgent Action Needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Recommendation Message</Label>
                  <Textarea 
                    placeholder="e.g., Try focusing on Sector 3 during 7-9 PM today. High demand expected for Zomato orders due to ongoing promotion."
                    value={newRecommendation.message}
                    onChange={(e) => setNewRecommendation(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleCreateRecommendation}
                  className="w-full gradient-secondary hover:opacity-90"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Recommendation
                </Button>
              </CardContent>
            </Card>

            {/* Recent Recommendations */}
            <Card className="stat-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-info" />
                  Recent Recommendations
                </CardTitle>
                <CardDescription>Track recommendation delivery and effectiveness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recommendations.slice(-10).reverse().map((rec) => {
                    const rider = riders.find(r => r.id === rec.riderId);
                    return (
                      <div key={rec.id} className="p-3 rounded-lg border">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              To: {rider?.name || 'Unknown Rider'}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {rec.message}
                            </p>
                          </div>
                          <Badge variant={getUrgencyColor(rec.urgency)} className="text-xs">
                            {rec.urgency}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{new Date(rec.createdAt).toLocaleDateString('en-IN')}</span>
                          <div className="flex gap-2">
                            {rec.delivered && <Badge variant="outline" className="text-xs">Delivered</Badge>}
                            {rec.followed && <Badge variant="secondary" className="text-xs">Followed</Badge>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}