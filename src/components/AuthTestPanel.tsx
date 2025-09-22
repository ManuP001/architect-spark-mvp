import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Database, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function AuthTestPanel() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runDatabaseTests = async () => {
    setIsLoading(true);
    const results: any[] = [];

    try {
      // Test 1: Check authentication status
      console.log('🧪 Test 1: Authentication Status');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      results.push({
        test: 'Authentication Status',
        success: !authError && user !== null,
        message: user ? `Authenticated as: ${user.id}` : authError?.message || 'No authenticated user',
        details: { user, authError }
      });

      // Test 2: Try to read service areas (should work - public read access)
      console.log('🧪 Test 2: Service Areas Read');
      const { data: areas, error: areasError } = await supabase
        .from('service_areas')
        .select('*')
        .limit(3);
      
      results.push({
        test: 'Service Areas Read',
        success: !areasError,
        message: areasError?.message || `Found ${areas?.length || 0} service areas`,
        details: { areas, areasError }
      });

      // Test 3: Try to read platforms (should work - public read access)
      console.log('🧪 Test 3: Delivery Platforms Read');
      const { data: platforms, error: platformsError } = await supabase
        .from('delivery_platforms')
        .select('*')
        .limit(3);
      
      results.push({
        test: 'Delivery Platforms Read',
        success: !platformsError,
        message: platformsError?.message || `Found ${platforms?.length || 0} platforms`,
        details: { platforms, platformsError }
      });

      // Test 4: Try to create a test rider profile (will likely fail due to RLS)
      console.log('🧪 Test 4: Rider Profile Creation');
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('rider_profiles')
          .insert({
            user_id: user.id,
            name: 'Test User',
            age: 25,
            phone: '1234567890',
            weekly_goal: 5000,
            hours_per_day: 8,
          })
          .select()
          .single();

        results.push({
          test: 'Rider Profile Creation',
          success: !profileError,
          message: profileError?.message || 'Profile created successfully',
          details: { profileData, profileError }
        });
      } else {
        results.push({
          test: 'Rider Profile Creation',
          success: false,
          message: 'Skipped - No authenticated user',
          details: null
        });
      }

      // Test 5: Check existing profiles count
      console.log('🧪 Test 5: Existing Profiles Count');
      const { count, error: countError } = await supabase
        .from('rider_profiles')
        .select('*', { count: 'exact', head: true });
      
      results.push({
        test: 'Existing Profiles Count',
        success: !countError,
        message: countError?.message || `Found ${count || 0} existing profiles`,
        details: { count, countError }
      });

    } catch (error) {
      results.push({
        test: 'General Error',
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      });
    }

    setTestResults(results);
    setIsLoading(false);

    // Show summary toast
    const failedTests = results.filter(r => !r.success).length;
    toast({
      title: `Database Tests Complete`,
      description: `${results.length - failedTests}/${results.length} tests passed`,
      variant: failedTests > 0 ? "destructive" : "default"
    });
  };

  const createTestUser = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123'
      });

      if (error) throw error;

      toast({
        title: "Test user created",
        description: "You can now test database operations with authentication"
      });
    } catch (error) {
      toast({
        title: "Failed to create test user",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Supabase Integration Test Panel
        </CardTitle>
        <CardDescription>
          Test database connectivity, authentication, and RLS policies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runDatabaseTests} disabled={isLoading}>
            {isLoading ? "Running Tests..." : "Run Database Tests"}
          </Button>
          <Button variant="outline" onClick={createTestUser}>
            Create Test User
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results:</h3>
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{result.test}</span>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {result.success ? "PASS" : "FAIL"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{result.message}</p>
                {result.details && (
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer">View Details</summary>
                    <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}