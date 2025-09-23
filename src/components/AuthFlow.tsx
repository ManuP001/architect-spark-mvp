import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthFlowProps {
  onSuccess: () => void;
}

export default function AuthFlow({ onSuccess }: AuthFlowProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Format phone number (add +91 for India if not present)
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;

      setIsOtpSent(true);
      toast({
        title: "OTP Sent!",
        description: `Verification code sent to ${formattedPhone}`,
      });
    } catch (error) {
      toast({
        title: "Failed to send OTP",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Phone verified!",
          description: "Successfully signed in with your phone number.",
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Please check your OTP and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {!isOtpSent ? 'Enter Mobile Number' : 'Verify OTP'}
          </CardTitle>
          <CardDescription className="text-center">
            {!isOtpSent 
              ? 'We\'ll send you a verification code to sign in' 
              : `Enter the 6-digit code sent to ${phone}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isOtpSent ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  required
                  maxLength={10}
                  minLength={10}
                  pattern="[0-9]{10}"
                />
                <p className="text-xs text-muted-foreground">
                  Enter your 10-digit mobile number (without +91)
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || phone.length !== 10}>
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  maxLength={6}
                  minLength={6}
                  pattern="[0-9]{6}"
                  className="text-center text-lg tracking-wider"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                {isLoading ? 'Verifying...' : 'Verify & Sign In'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setIsOtpSent(false);
                  setOtp('');
                }}
                disabled={isLoading}
              >
                Change Number
              </Button>
            </form>
          )}
          
          {!isOtpSent && (
            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to receive SMS messages for verification
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}