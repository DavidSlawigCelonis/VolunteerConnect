import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { HandHeart, LogIn } from "lucide-react";
import { MünchenLogo } from '@/assets/logo';

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/status", {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to check authentication status");
      }

      const data = await response.json();
      console.log("Auth status check result:", data);
      return data.isAuthenticated;
    } catch (error) {
      console.error("Auth status check failed:", error);
      return false;
    }
  };

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      console.log("Attempting login with username:", data.username);
      
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      console.log("Login response status:", response.status);
      console.log("Login response headers:", Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const error = await response.json();
        console.error("Login failed:", error);
        throw new Error(error.message || "Failed to login");
      }

      const responseData = await response.json();
      console.log("Login successful, response data:", responseData);
      
      // Show success message
      toast({
        title: "Success",
        description: "Login successful!",
      });

      // Wait for session to be set and verify authentication
      let isAuthenticated = false;
      let retries = 0;
      const maxRetries = 5;

      while (!isAuthenticated && retries < maxRetries) {
        console.log(`Checking authentication status (attempt ${retries + 1}/${maxRetries})...`);
        isAuthenticated = await checkAuthStatus();
        
        if (!isAuthenticated) {
          await new Promise(resolve => setTimeout(resolve, 500));
          retries++;
        }
      }

      if (isAuthenticated) {
        console.log("Authentication confirmed, redirecting to /admin...");
        setLocation("/admin");
      } else {
        console.error("Authentication check failed after successful login");
        throw new Error("Authentication failed after login");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <img src={MünchenLogo} alt="München Logo" className="h-12" />
            <h1 className="text-2xl font-bold">VolunteerHub</h1>
          </div>
          <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 