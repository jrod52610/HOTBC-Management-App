import { useState } from 'react';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, 
  addMonths, subMonths, parseISO, isWithinInterval, addDays, isBefore,
  set
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Edit, Trash2 } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EventCategory, Event as EventType } from '@/types';

// Category definitions with colors
const categories = [
  { value: 'retreat', label: 'Retreat', color: '#8B5CF6' },  // Purple
  { value: 'camp', label: 'Camp', color: '#10B981' },        // Green
  { value: 'appointment', label: 'Appointment', color: '#3B82F6' }, // Blue
  { value: 'day-off', label: 'Day Off', color: '#EC4899' },  // Pink
  { value: 'special-event', label: 'Special Event', color: '#F59E0B' }, // Amber
  { value: 'other', label: 'Other', color: '#6B7280' }       // Gray
];

// Time options for event start/end times
const timeOptions = Array.from({ length: 24 * 4 }).map((_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  const ampm = hour < 12 ? 'AM' : 'PM';
  const hourDisplay = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const minuteDisplay = minute.toString().padStart(2, '0');
  return {
    value: `${hour.toString().padStart(2, '0')}:${minuteDisplay}`,
    label: `${hourDisplay}:${minuteDisplay} ${ampm}`
  };
});

export default function CalendarPage() {
  const { events, addEvent, updateEvent, deleteEvent } = useAppContext();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  
  // State for the event being created or edited
  const [eventData, setEventData] = useState<{
    id?: string;
    title: string;
    date: Date;
    endDate?: Date;
    startTime: string;
    endTime: string;
    description: string;
    category: EventCategory;
    createdBy: string;
    color?: string;
  }>({
    title: '',
    date: new Date(),
    startTime: '09:00',
    endTime: '17:00',
    description: '',
    category: 'other',
    createdBy: 'User 1',
    color: categories.find(c => c.value === 'other')?.color
  });

  // Generate days for the current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Find events for the selected date (including multi-day events)
  const selectedDateEvents = selectedDate 
    ? events.filter(event => {
        if (event.endDate) {
          return isWithinInterval(selectedDate, { 
            start: new Date(event.date), 
            end: new Date(event.endDate)
          });
        }
        return isSameDay(selectedDate, new Date(event.date));
      })
    : [];

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setEventData(prev => ({ 
      ...prev, 
      date,
      endDate: isMultiDay ? prev.endDate || addDays(date, 1) : undefined
    }));
  };

  // Get events that occur on a specific day (for calendar indicators)
  const getEventsOnDay = (day: Date) => {
    return events.filter(event => {
      if (event.endDate) {
        // Check if the day is within the event's date range
        return isWithinInterval(day, { 
          start: new Date(event.date), 
          end: new Date(event.endDate) 
        });
      }
      return isSameDay(day, new Date(event.date));
    });
  };

  // Handle multi-day toggle
  const handleMultiDayToggle = (checked: boolean) => {
    setIsMultiDay(checked);
    if (checked) {
      setEventData(prev => ({
        ...prev,
        endDate: addDays(prev.date, 1)
      }));
    } else {
      setEventData(prev => ({
        ...prev,
        endDate: undefined
      }));
    }
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    const category = value as EventCategory;
    const categoryColor = categories.find(c => c.value === category)?.color;
    setEventData(prev => ({
      ...prev,
      category,
      color: categoryColor
    }));
  };

  // Create a new event or save changes to an existing one
  const handleSaveEvent = () => {
    if (!eventData.title || !eventData.date) return;
    
    const eventToSave = {
      ...eventData,
      endDate: isMultiDay ? eventData.endDate : undefined,
    };

    if (editingEvent) {
      // Editing existing event
      updateEvent({
        ...eventToSave,
        id: editingEvent
      } as EventType);
      setEditingEvent(null);
    } else {
      // Creating new event
      addEvent(eventToSave);
    }
    
    // Reset form and close dialog
    resetEventForm();
    setIsDialogOpen(false);
  };

  // Reset the event form to defaults
  const resetEventForm = () => {
    setEventData({
      title: '',
      date: selectedDate || new Date(),
      startTime: '09:00',
      endTime: '17:00',
      endDate: isMultiDay ? addDays(selectedDate || new Date(), 1) : undefined,
      description: '',
      category: 'other',
      createdBy: 'User 1',
      color: categories.find(c => c.value === 'other')?.color
    });
    setIsMultiDay(false);
  };

  // Open dialog for adding a new event
  const handleOpenAddDialog = () => {
    resetEventForm();
    setEditingEvent(null);
    setIsDialogOpen(true);
  };

  // Open dialog for editing an existing event
  const handleEditEvent = (event: EventType) => {
    setEditingEvent(event.id);
    setIsMultiDay(!!event.endDate);
    setEventData({
      id: event.id,
      title: event.title,
      date: new Date(event.date),
      endDate: event.endDate ? new Date(event.endDate) : undefined,
      startTime: event.startTime || '09:00',
      endTime: event.endTime || '17:00',
      description: event.description || '',
      category: event.category || 'other',
      createdBy: event.createdBy,
      color: event.color
    });
    setIsDialogOpen(true);
  };

  // Function to get category label from value
  const getCategoryLabel = (value?: EventCategory) => {
    return categories.find(c => c.value === value)?.label || 'Other';
  };

  // Function to format time display (12-hour format with AM/PM)
  const formatTimeDisplay = (timeString: string) => {
    const option = timeOptions.find(opt => opt.value === timeString);
    return option?.label || timeString;
  };

  // Determine if an event starts on a specific day (for visual display)
  const eventStartsOnDay = (event: EventType, day: Date) => {
    return isSameDay(new Date(event.date), day);
  };

  // Determine if an event ends on a specific day (for visual display)
  const eventEndsOnDay = (event: EventType, day: Date) => {
    return event.endDate && isSameDay(new Date(event.endDate), day);
  };

  // Calculate width of event on multi-day span (for visual display)
  const isFirstDayOfMonth = (day: Date) => {
    return day.getDate() === 1;
  };
  
  return (
    <MobileLayout title="Calendar">
      <div className="space-y-4 pb-4">
        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Day labels */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-xs font-medium text-muted-foreground py-1 text-center">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {monthDays.map((day, i) => {
            // Get events for this day
            const dayEvents = getEventsOnDay(day);
            
            return (
              <div
                key={day.toString()}
                className={cn(
                  "min-h-[80px] p-1 border border-muted relative cursor-pointer",
                  isSameDay(day, new Date()) && "bg-muted/20",
                  selectedDate && isSameDay(day, selectedDate) && "ring-2 ring-primary",
                  isFirstDayOfMonth(day) && "rounded-tl-md"
                )}
                onClick={() => handleDateSelect(day)}
              >
                {/* Date number */}
                <div className="text-xs font-medium mb-1">
                  {format(day, 'd')}
                </div>
                
                {/* Event bars */}
                <div className="space-y-1 overflow-hidden max-h-[60px]">
                  {dayEvents.slice(0, 3).map((event, idx) => {
                    const categoryColor = event.color || 
                      categories.find(c => c.value === event.category)?.color || 
                      '#6B7280';
                    
                    // Different styling for event start, middle, and end
                    const isStart = eventStartsOnDay(event, day);
                    const isEnd = eventEndsOnDay(event, day);
                    
                    return (
                      <div 
                        key={event.id + idx}
                        className={cn(
                          "text-[9px] px-1 py-0.5 truncate text-white rounded-sm cursor-pointer",
                          isStart && !isEnd ? "rounded-r-none" : "",
                          !isStart && isEnd ? "rounded-l-none" : "",
                          !isStart && !isEnd ? "rounded-none" : ""
                        )}
                        style={{ backgroundColor: categoryColor }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEvent(event);
                        }}
                      >
                        {event.title}
                      </div>
                    );
                  })}
                  {/* Show +X more indicator if there are more than 3 events */}
                  {dayEvents.length > 3 && (
                    <div 
                      className="text-[9px] text-muted-foreground px-1 py-0.5 bg-muted/30 rounded-sm cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDateSelect(day);
                      }}
                    >
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Events for Selected Date */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
            </h3>
            
            {selectedDate && (
              <Button 
                size="sm" 
                className="flex items-center gap-1"
                onClick={handleOpenAddDialog}
              >
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            )}
          </div>
          
          {selectedDate ? (
            selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map(event => (
                  <Card key={event.id} className="overflow-hidden">
                    <div 
                      className="h-1"
                      style={{ backgroundColor: event.color || categories.find(c => c.value === event.category)?.color || '#6B7280' }}
                    ></div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex flex-wrap gap-2 items-center mb-1">
                            <h4 className="font-medium">{event.title}</h4>
                            <Badge 
                              variant="outline"
                              style={{ 
                                color: event.color || categories.find(c => c.value === event.category)?.color, 
                                borderColor: event.color || categories.find(c => c.value === event.category)?.color
                              }}
                            >
                              {getCategoryLabel(event.category)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              <span>
                                {format(new Date(event.date), 'MMM d')}
                                {event.endDate && ` - ${format(new Date(event.endDate), 'MMM d, yyyy')}`}
                              </span>
                            </div>
                            
                            {event.startTime && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {formatTimeDisplay(event.startTime)}
                                  {event.endTime && ` - ${formatTimeDisplay(event.endTime)}`}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Added by: {event.createdBy}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-7 w-7 text-muted-foreground"
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-destructive"
                            onClick={() => deleteEvent(event.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No events for this date
              </div>
            )
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Select a date to view or add events
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Add Event'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={eventData.title}
                onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter event title"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Event Category</Label>
              <Select 
                value={eventData.category} 
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: cat.color }}
                        ></div>
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="multi-day" 
                checked={isMultiDay}
                onCheckedChange={handleMultiDayToggle}
              />
              <Label htmlFor="multi-day">Multi-day event</Label>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date">{isMultiDay ? 'Start Date' : 'Date'}</Label>
              <Input
                id="date"
                type="date"
                value={format(eventData.date, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const selectedDate = e.target.value ? parseISO(e.target.value) : new Date();
                  setEventData(prev => ({ 
                    ...prev, 
                    date: selectedDate,
                    // If multi-day and end date exists, ensure end date is after start date
                    endDate: prev.endDate && isBefore(prev.endDate, selectedDate) 
                      ? addDays(selectedDate, 1) 
                      : prev.endDate
                  }));
                }}
              />
            </div>
            
            {isMultiDay && (
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={eventData.endDate ? format(eventData.endDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const selectedEndDate = e.target.value ? parseISO(e.target.value) : undefined;
                    if (selectedEndDate && isBefore(selectedEndDate, eventData.date)) {
                      // If end date is before start date, set it to start date + 1
                      setEventData(prev => ({
                        ...prev,
                        endDate: addDays(prev.date, 1)
                      }));
                    } else {
                      setEventData(prev => ({
                        ...prev,
                        endDate: selectedEndDate
                      }));
                    }
                  }}
                  min={format(eventData.date, 'yyyy-MM-dd')}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Select
                  value={eventData.startTime}
                  onValueChange={(value) => {
                    setEventData(prev => ({
                      ...prev,
                      startTime: value,
                      // Ensure end time is after start time
                      endTime: timeOptions.findIndex(t => t.value === value) >= 
                               timeOptions.findIndex(t => t.value === prev.endTime) 
                        ? timeOptions[Math.min(
                            timeOptions.findIndex(t => t.value === value) + 4, 
                            timeOptions.length - 1
                          )].value 
                        : prev.endTime
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Select
                  value={eventData.endTime}
                  onValueChange={(value) => {
                    setEventData(prev => ({
                      ...prev,
                      endTime: value
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions
                      .filter(time => {
                        // Only show times after the start time
                        return timeOptions.findIndex(t => t.value === time.value) >
                               timeOptions.findIndex(t => t.value === eventData.startTime);
                      })
                      .map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={eventData.description || ''}
                onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add details about the event"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDialogOpen(false);
              resetEventForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveEvent}>
              {editingEvent ? 'Save Changes' : 'Add Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}