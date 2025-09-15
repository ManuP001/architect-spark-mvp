import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Bike, Target, MapPin, Smartphone } from "lucide-react";

interface OnboardingData {
  name: string;
  age: string;
  phone: string;
  weeklyGoal: string;
  hoursPerDay: string;
  area: string;
  platforms: string[];
}

const HSR_AREAS = [
  "HSR Layout Sector 1",
  "HSR Layout Sector 2", 
  "HSR Layout Sector 3",
  "HSR Layout Sector 4",
  "HSR Layout Sector 5",
  "HSR Layout Sector 6",
  "HSR Layout Sector 7",
  "27th Main Road",
  "Agara Lake Road",
  "Marathahalli Bridge"
];

const PLATFORMS = {
  "Food Delivery": ["Zomato", "Swiggy", "Swish"],
  "Quick Commerce": ["Blinkit", "Instamart", "Zepto", "FirstClub", "Slikk"]
};

interface RiderOnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export default function RiderOnboarding({ onComplete }: RiderOnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    name: "",
    age: "",
    phone: "",
    weeklyGoal: "",
    hoursPerDay: "",
    area: "",
    platforms: []
  });

  const handleNext = () => {
    if (step < 4) {
      if (validateCurrentStep()) {
        setStep(step + 1);
      }
    } else {
      if (validateForm()) {
        onComplete(formData);
        toast({
          title: "Welcome to Rider Co-pilot!",
          description: "Your profile has been created successfully.",
        });
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const validateCurrentStep = () => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.phone) {
          toast({
            title: "Please fill all fields",
            description: "Name and mobile number are required.",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 2:
        if (!formData.weeklyGoal) {
          toast({
            title: "Please fill all fields",
            description: "Weekly income target is required.",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 3:
        if (!formData.area) {
          toast({
            title: "Please fill all fields",
            description: "Please select your preferred area.",
            variant: "destructive",
          });
          return false;
        }
        break;
    }
    return true;
  };

  const validateForm = () => {
    if (!formData.name || !formData.phone || !formData.weeklyGoal || !formData.area || formData.platforms.length === 0) {
      toast({
        title: "Please fill all required fields",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const getStepIcon = (stepNumber: number) => {
    switch(stepNumber) {
      case 1: return <Bike className="h-5 w-5" />;
      case 2: return <Target className="h-5 w-5" />;
      case 3: return <MapPin className="h-5 w-5" />;
      case 4: return <Smartphone className="h-5 w-5" />;
      default: return <Bike className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="gradient-hero w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center shadow-glow">
            <Bike className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Rider Co-pilot</h1>
          <p className="text-muted-foreground">Let's set up your earnings goals</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-smooth ${
                stepNumber <= step 
                  ? 'gradient-primary text-white shadow-glow' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {stepNumber <= step ? getStepIcon(stepNumber) : stepNumber}
              </div>
              <div className="text-xs mt-2 text-center">
                {stepNumber === 1 && "Profile"}
                {stepNumber === 2 && "Goals"}
                {stepNumber === 3 && "Area"}
                {stepNumber === 4 && "Platforms"}
              </div>
            </div>
          ))}
        </div>

        {/* Form Steps */}
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStepIcon(step)}
              {step === 1 && "Personal Information"}
              {step === 2 && "Weekly Goals"}
              {step === 3 && "Service Area"}
              {step === 4 && "Platforms"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tell us about yourself"}
              {step === 2 && "Set your weekly earnings target"}
              {step === 3 && "Choose your preferred area"}
              {step === 4 && "Select platforms you use"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="weeklyGoal">Weekly Income Target</Label>
                  <div className="relative">
                    <span className="currency-symbol absolute left-3 top-1/2 transform -translate-y-1/2">₹</span>
                    <Input
                      id="weeklyGoal"
                      type="number"
                      placeholder="5000"
                      className="pl-8"
                      value={formData.weeklyGoal}
                      onChange={(e) => setFormData(prev => ({ ...prev, weeklyGoal: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hoursPerDay">Available Hours per Day</Label>
                  <Input
                    id="hoursPerDay"
                    type="number"
                    placeholder="8"
                    value={formData.hoursPerDay}
                    onChange={(e) => setFormData(prev => ({ ...prev, hoursPerDay: e.target.value }))}
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-2">
                <Label htmlFor="area">HSR Layout Area</Label>
                <Select value={formData.area} onValueChange={(value) => setFormData(prev => ({ ...prev, area: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your preferred area" />
                  </SelectTrigger>
                  <SelectContent>
                    {HSR_AREAS.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                {Object.entries(PLATFORMS).map(([category, platforms]) => (
                  <div key={category}>
                    <Label className="text-sm font-medium mb-3 block">{category}</Label>
                    <div className="space-y-2">
                      {platforms.map((platform) => (
                        <div key={platform} className="flex items-center space-x-2">
                          <Checkbox
                            id={platform}
                            checked={formData.platforms.includes(platform)}
                            onCheckedChange={() => togglePlatform(platform)}
                          />
                          <Label htmlFor={platform} className="text-sm">
                            {platform}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="gradient-primary hover:opacity-90 transition-smooth"
          >
            {step === 4 ? "Complete Setup" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}