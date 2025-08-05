import { useState } from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export default function MaintenancePage() {
  const { maintenanceTasks, addMaintenanceTask, updateMaintenanceTask, deleteMaintenanceTask, users } = useAppContext();
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'pending' as 'pending' | 'in-progress' | 'completed',
    assignedTo: '',
    dueDate: ''
  });
  
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  
  const filteredTasks = maintenanceTasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  }).sort((a, b) => {
    // Sort by priority first (high to low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then by status
    const statusOrder = { pending: 0, 'in-progress': 1, completed: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });
  
  const handleAddTask = () => {
    if (newTask.title) {
      addMaintenanceTask({
        title: newTask.title,
        description: newTask.description || undefined,
        priority: newTask.priority,
        status: newTask.status,
        assignedTo: newTask.assignedTo || undefined,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined
      });
      
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        assignedTo: '',
        dueDate: ''
      });
    }
  };
  
  const updateTaskStatus = (taskId: string, status: 'pending' | 'in-progress' | 'completed') => {
    const task = maintenanceTasks.find(t => t.id === taskId);
    if (task) {
      updateMaintenanceTask({ ...task, status });
    }
  };
  
  const assignTask = (taskId: string, userId: string) => {
    const task = maintenanceTasks.find(t => t.id === taskId);
    if (task) {
      updateMaintenanceTask({ ...task, assignedTo: userId });
    }
  };
  
  return (
    <MobileLayout title="Maintenance Tasks">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-x-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Pending
            </Button>
            <Button
              variant={filter === 'in-progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('in-progress')}
            >
              In Progress
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Completed
            </Button>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Maintenance Task</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter task details"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Priority</Label>
                  <RadioGroup 
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as 'low' | 'medium' | 'high' }))}
                    className="flex space-x-2"
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="low" id="priority-low" />
                      <Label htmlFor="priority-low">Low</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="medium" id="priority-medium" />
                      <Label htmlFor="priority-medium">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="high" id="priority-high" />
                      <Label htmlFor="priority-high">High</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="assignTo">Assign To (Optional)</Label>
                  <Select 
                    value={newTask.assignedTo || 'unassigned'} 
                    onValueChange={(value) => setNewTask(prev => ({ ...prev, assignedTo: value === 'unassigned' ? '' : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={handleAddTask}>Add Task</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No maintenance tasks found
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {filteredTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={
                      task.priority === 'high' ? 'destructive' : 
                      task.priority === 'medium' ? 'default' : 
                      'outline'
                    }>
                      {task.priority}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    {task.assignedTo ? (
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded-md">
                        Assigned to: {users.find(u => u.id === task.assignedTo)?.name || 'Unknown'}
                      </span>
                    ) : (
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded-md">
                        Unassigned
                      </span>
                    )}
                    
                    {task.dueDate && (
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded-md">
                        Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </span>
                    )}
                    
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded-md">
                      Created: {format(new Date(task.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 pt-2 border-t">
                    <div className="space-x-2">
                      <Select 
                        value={task.status} 
                        onValueChange={(value) => updateTaskStatus(task.id, value as 'pending' | 'in-progress' | 'completed')}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select 
                        value={task.assignedTo || "unassigned"} 
                        onValueChange={(value) => assignTask(task.id, value === "unassigned" ? "" : value)}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs ml-2">
                          <SelectValue placeholder="Assign to" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {users.map(user => (
                            <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteMaintenanceTask(task.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}