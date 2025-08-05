import { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Mail, RefreshCcw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Permission, InvitationStatus, User } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function UsersPage() {
  const { users, addUser, updateUserPermissions, inviteUserBySMS, resendInvitation, updateUserProfile } = useAppContext();
  
  const [newUser, setNewUser] = useState({
    name: '',
    permissions: [] as Permission[]
  });

  const [inviteUser, setInviteUser] = useState({
    name: '',
    phoneNumber: '',
    permissions: [] as Permission[]
  });
  
  const [editingUser, setEditingUser] = useState<{
    id: string;
    name: string;
    permissions: Permission[];
  } | null>(null);

  const permissionOptions: { label: string; value: Permission }[] = [
    { label: 'Admin', value: 'admin' },
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'Cleaning', value: 'cleaning' },
    { label: 'Calendar', value: 'calendar' },
    { label: 'Read Only', value: 'read-only' }
  ];

  // Get appropriate badge color based on invitation status
  const getStatusBadgeColor = (status?: InvitationStatus) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'; // pending or undefined
    }
  };

  // Format the time since invitation was sent
  const formatTimeSince = (date?: Date) => {
    if (!date) return '';
    
    const now = new Date();
    const inviteDate = new Date(date);
    const diffMs = now.getTime() - inviteDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHrs > 0) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const handleAddUser = () => {
    if (newUser.name) {
      // Make sure there's at least read-only permission if none selected
      const permissions = newUser.permissions.length > 0 
        ? newUser.permissions 
        : ['read-only'];
        
      addUser({
        name: newUser.name,
        permissions
      });
      
      setNewUser({
        name: '',
        permissions: []
      });
    }
  };
  
  const handleSendInvitation = async () => {
    if (inviteUser.name && inviteUser.phoneNumber) {
      // Format phone number (remove non-numeric characters)
      const phoneNumber = inviteUser.phoneNumber.replace(/\D/g, '');
      
      // Make sure there's at least read-only permission if none selected
      const permissions = inviteUser.permissions.length > 0 
        ? inviteUser.permissions 
        : ['read-only'];
        
      // Send invitation without SID token
      const success = await inviteUserBySMS(
        phoneNumber, 
        inviteUser.name, 
        permissions
      );
      
      // Show success/failure toast
      if (success) {
        toast({
          title: "Invitation Sent",
          description: `Successfully sent invitation to ${inviteUser.name} at ${phoneNumber}`,
        });
      } else {
        toast({
          title: "Failed to Send Invitation",
          description: "There was an error sending the invitation SMS",
          variant: "destructive"
        });
      }
      
      // Reset the form
      setInviteUser({
        name: '',
        phoneNumber: '',
        permissions: []
      });
    }
  };
  
  const handleUpdatePermissions = () => {
    if (editingUser) {
      // Make sure there's at least read-only permission if none selected
      const permissions = editingUser.permissions.length > 0 
        ? editingUser.permissions 
        : ['read-only'];
        
      updateUserPermissions(editingUser.id, permissions);
      setEditingUser(null);
    }
  };
  
  // Add state for the resend dialog
  const [resendDialogOpen, setResendDialogOpen] = useState(false);
  const [resendUserId, setResendUserId] = useState<string | null>(null);
  const [resendSid, setResendSid] = useState('');
  
  const handleOpenResendDialog = (userId: string) => {
    setResendUserId(userId);
    setResendSid('');
    setResendDialogOpen(true);
  };
  
  const handleResendInvitation = async () => {
    if (!resendUserId) return;
    
    const success = await resendInvitation(resendUserId);
    
    // Show success/failure toast
    if (success) {
      toast({
        title: "Invitation Resent",
        description: "Successfully resent invitation with temporary password",
      });
    } else {
      toast({
        title: "Failed to Resend Invitation",
        description: "There was an error resending the invitation SMS",
        variant: "destructive"
      });
    }
    
    // Close dialog and reset state
    setResendDialogOpen(false);
    setResendUserId(null);
    setResendSid('');
  };
  
  const togglePermission = (permission: Permission, target: 'new' | 'edit' | 'invite') => {
    if (target === 'new') {
      setNewUser(prev => {
        const hasPermission = prev.permissions.includes(permission);
        
        if (hasPermission) {
          return {
            ...prev,
            permissions: prev.permissions.filter(p => p !== permission)
          };
        } else {
          return {
            ...prev,
            permissions: [...prev.permissions, permission]
          };
        }
      });
    } else if (target === 'invite') {
      setInviteUser(prev => {
        const hasPermission = prev.permissions.includes(permission);
        
        if (hasPermission) {
          return {
            ...prev,
            permissions: prev.permissions.filter(p => p !== permission)
          };
        } else {
          return {
            ...prev,
            permissions: [...prev.permissions, permission]
          };
        }
      });
    } else {
      setEditingUser(prev => {
        if (!prev) return prev;
        
        const hasPermission = prev.permissions.includes(permission);
        
        if (hasPermission) {
          return {
            ...prev,
            permissions: prev.permissions.filter(p => p !== permission)
          };
        } else {
          return {
            ...prev,
            permissions: [...prev.permissions, permission]
          };
        }
      });
    }
  };

  // Filter users by invitation status
  const pendingUsers = users.filter(user => 
    user.invitationStatus === 'pending' || user.invitationStatus === 'sent'
  );
  const activeUsers = users.filter(user => 
    user.invitationStatus === 'accepted' || !user.invitationStatus
  );

  return (
    <MobileLayout title="Users">
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Users</TabsTrigger>
          <TabsTrigger value="pending">Pending Invitations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">User Name</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter user name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Permissions</Label>
                    <div className="space-y-2">
                      {permissionOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`permission-${option.value}`}
                            checked={newUser.permissions.includes(option.value)}
                            onCheckedChange={() => togglePermission(option.value, 'new')}
                          />
                          <Label htmlFor={`permission-${option.value}`}>{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={handleAddUser}>Add User</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1 ml-2" variant="outline">
                  <Mail className="h-4 w-4" />
                  SMS Invite
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite User via SMS</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="invite-name">User Name</Label>
                    <Input
                      id="invite-name"
                      value={inviteUser.name}
                      onChange={(e) => setInviteUser(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter user name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={inviteUser.phoneNumber}
                      onChange={(e) => setInviteUser(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Permissions</Label>
                    <div className="space-y-2">
                      {permissionOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`invite-permission-${option.value}`}
                            checked={inviteUser.permissions.includes(option.value)}
                            onCheckedChange={() => togglePermission(option.value, 'invite')}
                          />
                          <Label htmlFor={`invite-permission-${option.value}`}>{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={handleSendInvitation}>Send Invitation</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {activeUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active users found
            </div>
          ) : (
            <div className="space-y-3">
              {activeUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{user.name}</h3>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">Edit Permissions</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Permissions for {user.name}</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              {permissionOptions.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`edit-permission-${option.value}`}
                                    checked={editingUser?.permissions.includes(option.value) || 
                                            (!editingUser && user.permissions.includes(option.value))}
                                    onCheckedChange={() => {
                                      // Initialize editingUser if not yet set
                                      if (!editingUser) {
                                        setEditingUser({
                                          id: user.id,
                                          name: user.name,
                                          permissions: [...user.permissions]
                                        });
                                        setTimeout(() => togglePermission(option.value, 'edit'), 0);
                                      } else {
                                        togglePermission(option.value, 'edit');
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`edit-permission-${option.value}`}>{option.label}</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline" onClick={() => setEditingUser(null)}>
                                Cancel
                              </Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button onClick={handleUpdatePermissions}>Save Changes</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {user.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>

                    {user.phoneNumber && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        Phone: {user.phoneNumber}
                      </div>
                    )}
                    
                    {user.lastLogin && (
                      <div className="mt-1 text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Last login: {formatTimeSince(user.lastLogin)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4 mt-4">
          {pendingUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending invitations
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{user.name}</h3>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleOpenResendDialog(user.id)}
                        disabled={!user.phoneNumber}
                      >
                        <RefreshCcw className="h-3 w-3 mr-1" />
                        Resend
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge className={`text-xs ${getStatusBadgeColor(user.invitationStatus)}`}>
                        {user.invitationStatus === 'sent' ? (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Sent
                          </>
                        ) : user.invitationStatus === 'accepted' ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Accepted
                          </>
                        ) : user.invitationStatus === 'expired' ? (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Expired
                          </>
                        ) : (
                          'Pending'
                        )}
                      </Badge>
                      {user.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                    
                    {user.phoneNumber && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        Phone: {user.phoneNumber}
                      </div>
                    )}
                    
                    {user.invitationSentAt && (
                      <div className="mt-1 text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Sent {formatTimeSince(user.invitationSentAt)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Resend Invitation Dialog */}
      <Dialog open={resendDialogOpen} onOpenChange={setResendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resend Invitation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Resend invitation with a new temporary password.
            </p>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResendDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResendInvitation}>
              Resend Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}