import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/context/userContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const loginSchema = z.object({
  phoneNumber: z.string().min(10, { message: "Phone number must have at least 10 digits" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const Login = () => {
  const { login, setCurrentUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phoneNumber: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    
    try {
      const user = login(values.phoneNumber, values.password);
      
      if (!user) {
        toast({
          title: "Login Failed",
          description: "Invalid phone number or password. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      setCurrentUser(user);
      
      // If using temporary password, redirect to reset password page
      if (user.tempPassword) {
        toast({
          title: "First Time Login",
          description: "Please set a new password to complete your account setup.",
        });
        navigate("/reset-password");
      } else {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.name}!`,
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">HOTBC Management App</CardTitle>
          <CardDescription>
            Enter your phone number and password to sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your phone number"
                        {...field}
                        disabled={isLoading}
                      />
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
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            If you've received an invite, use your phone number and the temporary password sent via SMS.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;