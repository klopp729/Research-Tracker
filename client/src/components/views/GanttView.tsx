import { useState, useEffect } from "react";
import { Milestone, Task } from "@shared/schema";
import { useMilestones } from "@/hooks/useMilestones";
import { useTasks } from "@/hooks/useTasks";
import { format, eachDayOfInterval, addDays, differenceInDays, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { ja } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { TaskStatusMap, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";

interface GanttViewProps {
  projectId: number;
  milestones?: Milestone[];
  onTaskClick: (taskId: number) => void;
}

export default function GanttView({ projectId, milestones: propMilestones, onTaskClick }: GanttViewProps) {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = normal, > 1 = zoomed in, < 1 = zoomed out
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addDays(new Date(), 60));
  
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
      
      // Determine start and end dates for the Gantt chart
      if (milestones.length > 0 || filteredTasks.length > 0) {
        const allDates = [
          ...milestones.map(m => new Date(m.deadline)),
          ...filteredTasks.map(t => new Date(t.dueDate))
        ];
        
        const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
        
        // Add some padding
        const paddedStart = new Date(minDate);
        paddedStart.setDate(paddedStart.getDate() - 7);
        
        const paddedEnd = new Date(maxDate);
        paddedEnd.setDate(paddedEnd.getDate() + 7);
        
        setStartDate(startOfMonth(paddedStart));
        setEndDate(endOfMonth(paddedEnd));
      }
    }
  }, [fetchedTasks, milestoneIds, milestones]);
  
  const isLoading = milestonesLoading || tasksLoading;
  
  // Generate dates for the Gantt chart
  const dayWidth = 10 * zoomLevel; // Width of each day column
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Find the tasks associated with a milestone
  const getTasksForMilestone = (milestoneId: number) => {
    return allTasks.filter(task => task.milestoneId === milestoneId);
  };
  
  // Calculate position for a task bar
  const getTaskBarStyle = (task: Task) => {
    const taskDate = new Date(task.dueDate);
    const dayPosition = differenceInDays(taskDate, startDate);
    const position = dayPosition * dayWidth;
    
    // For simplicity, we'll make all task bars a fixed width
    const width = dayWidth * 5;
    
    // Determine color based on status
    let backgroundColor;
    switch (task.status) {
      case "COMPLETED":
        backgroundColor = "#10B981"; // green
        break;
      case "IN_PROGRESS":
        backgroundColor = "#3B82F6"; // blue
        break;
      default:
        backgroundColor = "#9CA3AF"; // gray
    }
    
    return {
      left: `${Math.max(0, position - 2)}px`,
      width: `${width}px`,
      backgroundColor,
    };
  };
  
  // Calculate position for a milestone marker
  const getMilestoneStyle = (milestone: Milestone) => {
    const milestoneDate = new Date(milestone.deadline);
    const dayPosition = differenceInDays(milestoneDate, startDate);
    const position = dayPosition * dayWidth;
    
    return {
      left: `${Math.max(0, position)}px`,
    };
  };
  
  // Zoom controls
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };
  
  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };
  
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
    <div id="gantt-view" className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">ガントチャート</h3>
          </div>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={zoomOut}
              className="p-1 text-gray-500 hover:text-gray-800"
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={zoomIn}
              className="p-1 text-gray-500 hover:text-gray-800 ml-2"
              disabled={zoomLevel >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="gantt-chart-container p-4 overflow-auto">
        <div className="flex">
          <div className="w-64 flex-shrink-0">
            <div className="h-10 font-medium">タスク名</div>
          </div>
          <div className="relative flex-grow">
            {/* Dates Header */}
            <div className="flex border-b border-gray-200">
              {days.map((day, index) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 text-xs text-center"
                  style={{ width: `${dayWidth}px` }}
                >
                  {format(day, "d")}
                </div>
              ))}
            </div>
            
            {/* Month Header */}
            <div className="flex border-b border-gray-200 py-1">
              {Array.from(new Set(days.map(day => format(day, "yyyy年MM月", { locale: ja })))).map((month, index) => {
                const monthStart = days.findIndex(day => 
                  format(day, "yyyy年MM月", { locale: ja }) === month
                );
                const monthEnd = days.findLastIndex(day => 
                  format(day, "yyyy年MM月", { locale: ja }) === month
                );
                const width = (monthEnd - monthStart + 1) * dayWidth;
                
                return (
                  <div 
                    key={index} 
                    className="text-xs font-medium"
                    style={{ width: `${width}px` }}
                  >
                    {month}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Gantt Chart Rows */}
        <div>
          {milestones.map((milestone) => {
            const tasksForMilestone = getTasksForMilestone(milestone.id);
            
            return (
              <div key={milestone.id}>
                {/* Milestone Row */}
                <div className="flex items-center py-2 border-b border-gray-200 bg-gray-50">
                  <div className="w-64 flex-shrink-0">
                    <span className="font-medium text-sm">{milestone.title}</span>
                    <span className="ml-2 text-xs text-warning">{formatDate(milestone.deadline)}</span>
                  </div>
                  <div className="relative flex-grow h-6">
                    {/* Milestone marker */}
                    <div 
                      className="gantt-milestone" 
                      style={getMilestoneStyle(milestone)}
                    ></div>
                  </div>
                </div>
                
                {/* Task Rows */}
                {tasksForMilestone.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex py-2 border-b border-gray-200"
                    onClick={() => onTaskClick(task.id)}
                  >
                    <div className={`w-64 flex-shrink-0 text-sm ${task.status === "COMPLETED" ? "line-through text-gray-500" : ""}`}>
                      {task.title}
                    </div>
                    <div className="relative flex-grow h-6">
                      {/* Task bar */}
                      <div 
                        className="gantt-task cursor-pointer" 
                        style={getTaskBarStyle(task)}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      
      <style jsx>{`
        .gantt-chart-container {
          overflow-x: auto;
        }
        
        .gantt-milestone {
          position: absolute;
          width: 2px;
          background-color: #8B5CF6;
          height: 20px;
          z-index: 5;
        }
        
        .gantt-task {
          position: absolute;
          height: 24px;
          border-radius: 4px;
          z-index: 10;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}
