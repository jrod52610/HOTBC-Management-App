import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import { User } from '@/types';

interface InvitationNotificationProps {
  phoneNumber: string;
  invitationCode?: string;
}

export function InvitationNotification({ phoneNumber, invitationCode = '123456' }: InvitationNotificationProps) {
  const { users, updateUserProfile } = useAppContext();
  const [showNotification, setShowNotification] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [matchingUser, setMatchingUser] = useState<User | null>(null);
  
  // Find user with matching phone number
  useEffect(() => {
    // Remove non-numeric characters for comparison
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    const user = users.find(u => u.phoneNumber && u.phoneNumber.replace(/\D/g, '') === formattedPhone);
    
    if (user && user.invitationStatus !== 'accepted') {
      setMatchingUser(user);
      setShowNotification(true);
    } else {
      setShowNotification(false);
    }
  }, [users, phoneNumber]);
  
  const handleVerify = () => {
    // In a real app, we'd validate against an actual code
    // Here we're just checking if the entered code matches our hardcoded one
    if (verificationCode === invitationCode) {
      setVerificationStatus('success');
      
      // Update the user profile to mark invitation as accepted
      if (matchingUser) {
        updateUserProfile(matchingUser.id, {
          invitationStatus: 'accepted',
          lastLogin: new Date()
        });
      }
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        setShowVerificationDialog(false);
        setShowNotification(false);
        // Reset for next time
        setVerificationCode('');
        setVerificationStatus('idle');
      }, 2000);
    } else {
      setVerificationStatus('error');
    }
  };
  
  if (!showNotification) return null;
  
  return (
    <>
      <Alert className="my-4">
        <Mail className="h-4 w-4" />
        <AlertTitle>You have a pending invitation</AlertTitle>
        <AlertDescription className="flex flex-col space-y-2">
          <p>You've been invited to join HOTBC Management App.</p>
          <Button 
            onClick={() => setShowVerificationDialog(true)} 
            size="sm" 
            className="mt-2 w-full sm:w-auto"
          >
            Accept Invitation
          </Button>
        </AlertDescription>
      </Alert>
      
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Invitation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Enter the verification code sent to your phone {phoneNumber}.
            </p>
            <div className="grid gap-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>
            
            {verificationStatus === 'success' && (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-700">Success!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your invitation has been accepted.
                </AlertDescription>
              </Alert>
            )}
            
            {verificationStatus === 'error' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Invalid verification code. Please try again.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleVerify} disabled={verificationCode.length < 6}>
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}