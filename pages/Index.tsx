import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import MobileLayout from '@/components/layout/MobileLayout';
import { InvitationNotification } from '@/components/user/InvitationNotification';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function WelcomePage() {
  const { inviteUserBySMS } = useAppContext();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  const handleDemoInvitation = () => {
    if (phoneNumber) {
      // For demo purposes, create a simulated invitation
      inviteUserBySMS(phoneNumber, 'Demo User', ['read-only']);
      setShowDemo(true);
    }
  };

  return (
    <MobileLayout title="HOTBC Management">
      <div className="space-y-6">
        {/* Demo notification for SMS invitation */}
        {showDemo && (
          <InvitationNotification phoneNumber={phoneNumber} invitationCode="123456" />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Welcome to HOTBC Management</CardTitle>
            <CardDescription>
              Efficiently manage your camp operations, events, and staff
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This platform helps you coordinate maintenance tasks, cleaning schedules, 
              and calendar events for your camp management needs.
            </p>
            
            <div className="mt-6">
              <h3 className="font-medium mb-2">SMS Invitation Demo</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter a phone number to see how the SMS invitation system works.
              </p>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <Button onClick={handleDemoInvitation} disabled={!phoneNumber}>
                  Send Demo Invitation
                </Button>
                
                {showDemo && (
                  <div className="mt-2 text-sm">
                    <p className="text-muted-foreground">
                      For this demo, the verification code is: <strong>123456</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/calendar'}>
                Calendar
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/maintenance'}>
                Maintenance Tasks
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/cleaning'}>
                Cleaning Schedule
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/users'}>
                User Management
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
}