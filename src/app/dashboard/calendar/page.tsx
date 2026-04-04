'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  eachDayOfInterval,
  isToday,
  addDays,
  startOfWeek,
  endOfWeek,
  isWeekend,
  isBefore,
  isAfter
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MoreVertical, 
  X, 
  CalendarDays,
  Clock,
  User,
  FileText,
  DollarSign,
  RefreshCw,
  Bell,
  Search,
  Filter,
  Download,
  Eye
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time?: string;
  type: 'meeting' | 'reminder' | 'payment' | 'renewal' | 'claim' | 'appointment';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  client?: string;
  policy?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'overdue';
  location?: string;
  duration?: number; // in minutes
}

const EVENT_TYPES = {
  meeting: { icon: User, color: 'blue', label: 'Meeting' },
  reminder: { icon: Bell, color: 'yellow', label: 'Reminder' },
  payment: { icon: DollarSign, color: 'green', label: 'Payment' },
  renewal: { icon: RefreshCw, color: 'purple', label: 'Renewal' },
  claim: { icon: FileText, color: 'red', label: 'Claim' },
  appointment: { icon: Clock, color: 'indigo', label: 'Appointment' }
};

const PRIORITY_COLORS = {
  low: 'border-l-gray-400',
  medium: 'border-l-blue-400',
  high: 'border-l-orange-400',
  urgent: 'border-l-red-500'
};

const STATUS_COLORS = {
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-gray-50 text-gray-700 border-gray-200',
  overdue: 'bg-red-50 text-red-700 border-red-200'
};

export default function EnhancedCalendar() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Client Consultation - John Smith',
      description: 'Annual policy review and coverage assessment',
      date: addDays(new Date(), 2),
      time: '10:00 AM',
      type: 'meeting',
      priority: 'high',
      client: 'John Smith',
      status: 'scheduled',
      location: 'Conference Room A',
      duration: 60
    },
    {
      id: '2',
      title: 'Auto Policy Renewal Deadline',
      description: 'AUTO-2023-456 renewal documentation due',
      date: addDays(new Date(), 5),
      time: '11:59 PM',
      type: 'renewal',
      priority: 'urgent',
      policy: 'AUTO-2023-456',
      status: 'scheduled',
      duration: 30
    },
    {
      id: '3',
      title: 'Premium Payment Processing',
      description: 'Monthly premium collection for Sarah Johnson',
      date: addDays(new Date(), 10),
      time: '2:00 PM',
      type: 'payment',
      priority: 'medium',
      client: 'Sarah Johnson',
      status: 'scheduled',
      duration: 15
    },
    {
      id: '4',
      title: 'Claim Investigation Meeting',
      description: 'Property damage claim review',
      date: addDays(new Date(), -2),
      time: '9:00 AM',
      type: 'claim',
      priority: 'high',
      client: 'Mike Davis',
      status: 'completed',
      duration: 90
    },
    {
      id: '5',
      title: 'Follow-up Call Reminder',
      description: 'Check on claim status with Jennifer Wilson',
      date: addDays(new Date(), 1),
      time: '3:30 PM',
      type: 'reminder',
      priority: 'low',
      client: 'Jennifer Wilson',
      status: 'scheduled',
      duration: 15
    }
  ]);

  // Memoized calculations
  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth]);
  const calendarStart = useMemo(() => startOfWeek(monthStart), [monthStart]);
  const calendarEnd = useMemo(() => endOfWeek(monthEnd), [monthEnd]);
  const calendarDays = useMemo(() => 
    eachDayOfInterval({ start: calendarStart, end: calendarEnd }), 
    [calendarStart, calendarEnd]
  );

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.policy?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || event.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [events, searchTerm, filterType]);

  const getEventsForDay = useCallback((day: Date) => {
    return filteredEvents.filter(event => isSameDay(event.date, day));
  }, [filteredEvents]);

  const getEventStats = useMemo(() => {
    const total = events.length;
    const upcoming = events.filter(e => isAfter(e.date, new Date()) && e.status === 'scheduled').length;
    const overdue = events.filter(e => isBefore(e.date, new Date()) && e.status === 'scheduled').length;
    const completed = events.filter(e => e.status === 'completed').length;
    return { total, upcoming, overdue, completed };
  }, [events]);

  const navigateToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  }, []);

  const nextMonth = useCallback(() => setCurrentMonth(addMonths(currentMonth, 1)), [currentMonth]);
  const prevMonth = useCallback(() => setCurrentMonth(subMonths(currentMonth, 1)), [currentMonth]);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  }, []);

  const handleDeleteEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
    setShowEventModal(false);
  }, []);

  const handleEventStatusUpdate = useCallback((eventId: string, status: CalendarEvent['status']) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, status } : event
    ));
  }, []);

  const EventModal = ({ event, onClose }: { event: CalendarEvent; onClose: () => void }) => {
    const EventIcon = EVENT_TYPES[event.type].icon;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6 border-b dark:border-gray-800">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-${EVENT_TYPES[event.type].color}-100 dark:bg-${EVENT_TYPES[event.type].color}-900/30`}>
                  <EventIcon className={`w-5 h-5 text-${EVENT_TYPES[event.type].color}-600 dark:text-${EVENT_TYPES[event.type].color}-400`} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${STATUS_COLORS[event.status]}`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {event.description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Date:</span>
                <p className="text-gray-600 dark:text-gray-400">{format(event.date, 'EEEE, MMM d, yyyy')}</p>
              </div>
              {event.time && (
                <div>
                  <span className="font-medium">Time:</span>
                  <p className="text-gray-600 dark:text-gray-400">{event.time}</p>
                </div>
              )}
              <div>
                <span className="font-medium">Type:</span>
                <p className="text-gray-600 dark:text-gray-400">{EVENT_TYPES[event.type].label}</p>
              </div>
              <div>
                <span className="font-medium">Priority:</span>
                <p className={`capitalize ${
                  event.priority === 'urgent' ? 'text-red-600' :
                  event.priority === 'high' ? 'text-orange-600' :
                  event.priority === 'medium' ? 'text-blue-600' : 'text-gray-600'
                }`}>{event.priority}</p>
              </div>
              {event.client && (
                <div>
                  <span className="font-medium">Client:</span>
                  <p className="text-gray-600 dark:text-gray-400">{event.client}</p>
                </div>
              )}
              {event.policy && (
                <div>
                  <span className="font-medium">Policy:</span>
                  <p className="text-gray-600 dark:text-gray-400">{event.policy}</p>
                </div>
              )}
              {event.location && (
                <div>
                  <span className="font-medium">Location:</span>
                  <p className="text-gray-600 dark:text-gray-400">{event.location}</p>
                </div>
              )}
              {event.duration && (
                <div>
                  <span className="font-medium">Duration:</span>
                  <p className="text-gray-600 dark:text-gray-400">{event.duration} minutes</p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 pt-4">
              {event.status === 'scheduled' && (
                <button 
                  onClick={() => handleEventStatusUpdate(event.id, 'completed')}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                >
                  Mark Complete
                </button>
              )}
              <button 
                onClick={() => handleDeleteEvent(event.id)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Insurance Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage appointments, renewals, and reminders</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-800 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
              <p className="text-xl font-semibold">{getEventStats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-800 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
              <p className="text-xl font-semibold">{getEventStats.upcoming}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-800 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="text-xl font-semibold text-red-600">{getEventStats.overdue}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-800 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-xl font-semibold">{getEventStats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800 shadow-sm mb-6">
        <div className="p-4 border-b dark:border-gray-800">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <button 
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold min-w-[200px]">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <button 
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button 
                onClick={navigateToToday}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Today
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm w-64"
                />
              </div>
              
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm"
                >
                  <option value="all">All Types</option>
                  {Object.entries(EVENT_TYPES).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </select>
                <Filter className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
          {/* Day headers */}
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
            <div
              key={day}
              className="bg-gray-50 dark:bg-gray-800 p-3 text-center font-medium text-sm text-gray-700 dark:text-gray-300"
            >
              <span className="hidden lg:inline">{day}</span>
              <span className="lg:hidden">{day.slice(0, 3)}</span>
            </div>
          ))}

          {/* Calendar cells */}
          {calendarDays.map((day: Date) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            const isWeekendDay = isWeekend(day);

            return (
              <div
                key={day.toString()}
                className={`bg-white dark:bg-gray-900 min-h-32 p-2 transition-colors cursor-pointer border-r border-b border-gray-200 dark:border-gray-700 ${
                  !isCurrentMonth ? 'opacity-50 bg-gray-50 dark:bg-gray-800' : ''
                } ${
                  isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-inset' : ''
                } ${
                  isWeekendDay && isCurrentMonth ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                } hover:bg-gray-50 dark:hover:bg-gray-800`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`text-sm w-7 h-7 flex items-center justify-center rounded-full font-medium ${
                      isTodayDate 
                        ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-sm' 
                        : isWeekendDay && isCurrentMonth
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-medium">
                      {dayEvents.length}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {dayEvents.slice(0, 3).map((event) => {
                    const EventIcon = EVENT_TYPES[event.type].icon;
                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                        className={`text-xs p-1.5 rounded border-l-2 cursor-pointer hover:shadow-sm transition-shadow bg-white dark:bg-gray-800 ${PRIORITY_COLORS[event.priority]} ${
                          event.status === 'overdue' ? 'bg-red-50 dark:bg-red-900/20' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          <EventIcon className={`w-3 h-3 text-${EVENT_TYPES[event.type].color}-600`} />
                          <span className="truncate font-medium">{event.title}</span>
                        </div>
                        {event.time && (
                          <div className="text-gray-500 dark:text-gray-400 mt-0.5">{event.time}</div>
                        )}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Events */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800 shadow-sm">
        <div className="p-4 border-b dark:border-gray-800">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {getEventsForDay(selectedDate).length} event{getEventsForDay(selectedDate).length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {getEventsForDay(selectedDate).length > 0 ? (
            <div className="divide-y dark:divide-gray-800">
              {getEventsForDay(selectedDate).map((event) => {
                const EventIcon = EVENT_TYPES[event.type].icon;
                return (
                  <div 
                    key={event.id} 
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-l-4 ${PRIORITY_COLORS[event.priority]}`}
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`p-2 rounded-lg bg-${EVENT_TYPES[event.type].color}-100 dark:bg-${EVENT_TYPES[event.type].color}-900/30 mt-1`}>
                          <EventIcon className={`w-4 h-4 text-${EVENT_TYPES[event.type].color}-600 dark:text-${EVENT_TYPES[event.type].color}-400`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[event.status]}`}>
                              {event.status}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{event.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            {event.time && (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {event.time}
                              </span>
                            )}
                            {event.client && (
                              <span className="flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                {event.client}
                              </span>
                            )}
                            {event.duration && (
                              <span>{event.duration}min</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <CalendarDays className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-3">No events scheduled for this day</p>
              <button className="inline-flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Event
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && selectedEvent && (
        <EventModal 
          event={selectedEvent} 
          onClose={() => setShowEventModal(false)} 
        />
      )}
    </div>
  );
}