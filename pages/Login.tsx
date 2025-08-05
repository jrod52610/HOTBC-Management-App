import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Login = () => {
  const { loginWithPhoneAndPassword, getCurrentUser, setCurrentUser } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if user is already logged in
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      navigate(from);
    }
  }, [getCurrentUser, navigate, from]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log("Attempting login with phone:", phoneNumber, "password:", password);
    
    // SPECIAL CASE: Hardcoded admin login as a fallback
    if (phoneNumber === '1234567890' && password === 'admin123') {
      console.log("Using special admin login bypass");
      const adminUser = {
        id: 'admin-user-id',
        name: 'Admin User',
        permissions: ['admin'],
        phoneNumber: '1234567890',
        profileCompleted: true,
        invitationStatus: 'accepted'
      };
      
      // Store admin user in localStorage directly
      localStorage.setItem('campshare-current-user', JSON.stringify(adminUser));
      
      // Use the setCurrentUser function from props, not from hook inside handler
      setCurrentUser(adminUser);
      
      toast.success('Logged in successfully!');
      console.log("Navigating to:", from);
      
      // Force navigation with window.location
      window.location.href = '/';
      
      return;
    }
    
    // Standard login
    const user = loginWithPhoneAndPassword(phoneNumber, password);
    
    if (user) {
      toast.success('Logged in successfully!');
      
      // If the user has a temporary password, redirect to set password page
      if (user.tempPassword) {
        navigate('/set-password');
      } else {
        navigate(from);
      }
    } else {
      toast.error('Login failed - no user found');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">HOTBC Management</CardTitle>
          <CardDescription>Login to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input 
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Sign In'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;