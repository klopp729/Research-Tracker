import { useState, useEffect } from "react";
import { Milestone, Task } from "@shared/schema";
import { useMilestones } from "@/hooks/useMilestones";
import { useTasks } from "@/hooks/useTasks";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarViewProps {
  projectId: number;
  milestones?: Milestone[];
  onTaskClick: (taskId: number) => void;
}

export default function CalendarView({ projectId, milestones: propMilestones, onTaskClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  
  // If milestones are not provided, fetch them
  const { milestones: fetchedMilestones, isLoading: milestonesLoading } = useMilestones(
    projectId,
    { enabled: !propMilestones }
  );
  
  const milestones = propMilestones || fetchedMilestones;
  
  // Collect all milestone IDs
  const milestoneIds = milestones.map(m => m.id);
  
  // Fetch tasks for all milestones
  const { tasks: fetchedTasks, isLoading: tasksLoading } = useTasks(0, undefined, {
    enabled: milestoneIds.length > 0,
  });
  
  // When we have milestones and tasks, filter tasks to only those belonging to our milestones
  useEffect(() => {
    if (fetchedTasks.length > 0 && milestoneIds.length > 0) {
      const filteredTasks = fetchedTasks.filter(task => 
        milestoneIds.includes(task.milestoneId)
      );
      setAllTasks(filteredTasks);
    }
  }, [fetchedTasks, milestoneIds]);
  
  const isLoading = milestonesLoading || tasksLoading;
  
  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };
  
  // Get days in current month view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get tasks and milestones for a specific day
  const getItemsForDay = (day: Date) => {
    const tasksForDay = allTasks.filter(task => 
      isSameDay(new Date(task.dueDate), day)
    );
    
    const milestonesForDay = milestones.filter(milestone => 
      isSameDay(new Date(milestone.deadline), day)
    );
    
    return {
      tasks: tasksForDay,
      milestones: milestonesForDay
    };
  };
  
  // Get day cells with proper offset for first day of month
  const firstDayOfMonth = monthStart.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const daysBefore = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust for week starting on Monday
  
  if (isLoading) {
    return (
      <Card className="w-full animate-pulse">
        <CardContent className="p-6">
          <div className="h-[500px] bg-gray-100 rounded-md"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div id="calendar-view" className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {format(currentDate, "yyyy年MM月", { locale: ja })}
            </h3>
          </div>
          <div className="flex">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={goToPreviousMonth}
              className="p-1 text-gray-500 hover:text-gray-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={goToNextMonth}
              className="p-1 text-gray-500 hover:text-gray-800 ml-2"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto no-scrollbar">
        <div className="min-w-full grid grid-cols-7 border-b border-gray-200">
          <div className="p-2 text-center text-gray-600 text-sm font-medium">月</div>
          <div className="p-2 text-center text-gray-600 text-sm font-medium">火</div>
          <div className="p-2 text-center text-gray-600 text-sm font-medium">水</div>
          <div className="p-2 text-center text-gray-600 text-sm font-medium">木</div>
          <div className="p-2 text-center text-gray-600 text-sm font-medium">金</div>
          <div className="p-2 text-center text-gray-600 text-sm font-medium">土</div>
          <div className="p-2 text-center text-gray-600 text-sm font-medium">日</div>
        </div>
        
        <div className="min-w-full grid grid-cols-7">
          {/* Empty cells for days from previous month */}
          {Array.from({ length: daysBefore }).map((_, index) => (
            <div key={`prev-month-${index}`} className="h-28 border-b border-r border-gray-200 p-1 text-gray-400 bg-gray-50"></div>
          ))}
          
          {/* Cells for current month */}
          {daysInMonth.map((day) => {
            const { tasks: dayTasks, milestones: dayMilestones } = getItemsForDay(day);
            const isToday = isSameDay(day, new Date());
            const hasMilestone = dayMilestones.length > 0;
            
            return (
              <div 
                key={day.toString()} 
                className={`h-28 border-b border-r border-gray-200 p-1 ${
                  isToday ? "bg-blue-50" : hasMilestone ? "bg-red-50" : ""
                }`}
              >
                <div className={`text-xs ml-1 ${isToday ? "font-bold" : ""}`}>
                  {format(day, "d")}
                </div>
                
                {/* Milestones for this day */}
                {dayMilestones.map(milestone => (
                  <div 
                    key={`milestone-${milestone.id}`}
                    className="mt-1 text-xs bg-red-50 text-gray-900 p-1 rounded overflow-hidden text-ellipsis whitespace-nowrap font-medium"
                  >
                    {milestone.title}
                  </div>
                ))}
                
                {/* Tasks for this day */}
                {dayTasks.map(task => (
                  <div 
                    key={`task-${task.id}`}
                    className={`mt-1 text-xs p-1 rounded overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer ${
                      task.status === "COMPLETED" 
                        ? "bg-green-100 text-success" 
                        : task.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-primary"
                          : "bg-gray-100 text-gray-700"
                    }`}
                    onClick={() => onTaskClick(task.id)}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
