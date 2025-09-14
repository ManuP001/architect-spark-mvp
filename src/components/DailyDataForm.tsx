import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Calendar, Clock, IndianRupee, Star, Smartphone } from "lucide-react";

interface DailyData {
  earnings: string;
  hours: string;
  primaryPlatform: string;
  rating: number;
  date: string;
}

const PLATFORMS = [
  { category: "Food Delivery", items: ["Zomato", "Swiggy", "Swish"] },
  { category: "Quick Commerce", items: ["Blinkit", "Instamart", "Zepto", "FirstClub", "Slikk"] }
];

interface DailyDataFormProps {
  onSubmit: (data: DailyData) => void;
  onBack: () => void;
}

export default function DailyDataForm({ onSubmit, onBack }: DailyDataFormProps) {
  const [formData, setFormData] = useState<DailyData>({
    earnings: "",
    hours: "",
    primaryPlatform: "",
    rating: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.earnings || !formData.hours || !formData.primaryPlatform || !formData.rating) {
      toast({
        title: "Please fill all fields",
        description: "All fields are required to submit your daily data.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);
    toast({
      title: "Daily data submitted!",
      description: "Your earnings data has been recorded successfully.",
    });
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="gradient-secondary w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center shadow-glow">
            <IndianRupee className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Daily Earnings</h1>
          <p className="text-muted-foreground">How did your day go?</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="stat-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Today's Performance
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-IN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Earnings Input */}
              <div className="space-y-2">
                <Label htmlFor="earnings" className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-earnings" />
                  Total Earnings Today
                </Label>
                <div className="relative">
                  <span className="currency-symbol absolute left-3 top-1/2 transform -translate-y-1/2">₹</span>
                  <Input
                    id="earnings"
                    type="number"
                    placeholder="1500"
                    className="pl-8 text-lg"
                    value={formData.earnings}
                    onChange={(e) => setFormData(prev => ({ ...prev, earnings: e.target.value }))}
                  />
                </div>
              </div>

              {/* Hours Input */}
              <div className="space-y-2">
                <Label htmlFor="hours" className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-info" />
                  Hours Worked
                </Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.5"
                  placeholder="8.5"
                  value={formData.hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                />
              </div>

              {/* Platform Selection */}
              <div className="space-y-2">
                <Label htmlFor="platform" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-secondary" />
                  Primary Platform Used
                </Label>
                <Select 
                  value={formData.primaryPlatform} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, primaryPlatform: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((category) => (
                      <div key={category.category}>
                        <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                          {category.category}
                        </div>
                        {category.items.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {platform}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rating */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-warning" />
                  How satisfied are you with today's earnings?
                </Label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      className="transition-smooth"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= formData.rating
                            ? 'fill-warning text-warning'
                            : 'text-muted-foreground hover:text-warning'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  {formData.rating === 1 && "Very Unsatisfied"}
                  {formData.rating === 2 && "Unsatisfied"}
                  {formData.rating === 3 && "Neutral"}
                  {formData.rating === 4 && "Satisfied"}
                  {formData.rating === 5 && "Very Satisfied"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              Back to Dashboard
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-primary hover:opacity-90 transition-smooth"
            >
              Submit Data
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}