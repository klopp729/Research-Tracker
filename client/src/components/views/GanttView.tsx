import { useState, useEffect } from "react";
import { Milestone, Task } from "@shared/schema";
import { useMilestones } from "@/hooks/useMilestones";
import { useTasks } from "@/hooks/useTasks";
import { format, eachDayOfInterval, addDays, differenceInDays, startOfMonth, endOfMonth } from "date-fns";
import { ja } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";

interface GanttViewProps {
  projectId: number;
  milestones?: Milestone[];
  onTaskClick: (taskId: number) => void;
}

export default function GanttView({ projectId, milestones: propMilestones, onTaskClick }: GanttViewProps) {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addDays(new Date(), 150));

  const { milestones: fetchedMilestones, isLoading: milestonesLoading } = useMilestones(
    projectId,
    { enabled: !propMilestones }
  );

  const milestones = propMilestones || fetchedMilestones;
  const milestoneIds = milestones.map(m => m.id);

  const { tasks: fetchedTasks, isLoading: tasksLoading } = useTasks(0, undefined, {
    enabled: milestoneIds.length > 0,
  });

  useEffect(() => {
    if (fetchedTasks.length > 0 && milestoneIds.length > 0) {
      const filteredTasks = fetchedTasks.filter(task => 
        milestoneIds.includes(task.milestoneId)
      );
      setAllTasks(filteredTasks);

      if (milestones.length > 0 || filteredTasks.length > 0) {
        const allDates = [
          ...milestones.map(m => new Date(m.deadline)),
          ...filteredTasks.map(t => new Date(t.dueDate))
        ];

        const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

        setStartDate(startOfMonth(minDate));
        setEndDate(endOfMonth(maxDate));
      }
    }
  }, [fetchedTasks, milestoneIds, milestones]);

  const isLoading = milestonesLoading || tasksLoading;
  const dayWidth = 20 * zoomLevel;
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getTasksForMilestone = (milestoneId: number) => {
    return allTasks.filter(task => task.milestoneId === milestoneId);
  };

  const getTaskBarStyle = (task: Task) => {
    const taskDate = new Date(task.dueDate);
    const dayPosition = differenceInDays(taskDate, startDate);
    const position = dayPosition * dayWidth;
    const width = dayWidth * 5;

    let backgroundColor = "#9CA3AF"; // default gray
    switch (task.status) {
      case "COMPLETED":
        backgroundColor = "#10B981"; // green
        break;
      case "IN_PROGRESS":
        backgroundColor = "#3B82F6"; // blue
        break;
    }

    return {
      left: `${Math.max(0, position)}px`,
      width: `${width}px`,
      backgroundColor,
    };
  };

  const getMilestoneStyle = (milestone: Milestone) => {
    const milestoneDate = new Date(milestone.deadline);
    const dayPosition = differenceInDays(milestoneDate, startDate);
    const position = dayPosition * dayWidth;

    return {
      left: `${Math.max(0, position)}px`,
    };
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">研究進捗</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.5))}
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.5))}
              disabled={zoomLevel >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="gantt-chart-container p-4 overflow-auto">
        <div className="flex">
          <div className="w-40 flex-shrink-0">
            <div className="h-10"></div>
          </div>
          <div className="relative flex-grow">
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

            <div className="flex border-b border-gray-200 py-1">
              {Array.from(new Set(days.map(day => format(day, "M月", { locale: ja })))).map((month, index) => {
                const monthStart = days.findIndex(day => 
                  format(day, "M月", { locale: ja }) === month
                );
                const monthEnd = days.findLastIndex(day => 
                  format(day, "M月", { locale: ja }) === month
                );
                const width = (monthEnd - monthStart + 1) * dayWidth;

                return (
                  <div 
                    key={index} 
                    className="text-sm font-medium"
                    style={{ width: `${width}px` }}
                  >
                    {month}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          {milestones.map((milestone) => {
            const tasksForMilestone = getTasksForMilestone(milestone.id);

            return (
              <div key={milestone.id}>
                <div className="flex items-center py-2 border-b border-gray-200 bg-gray-50">
                  <div className="w-40 flex-shrink-0 pl-2">
                    <span className="font-medium text-sm">{milestone.title}</span>
                  </div>
                  <div className="relative flex-grow h-6">
                    <div 
                      className={`absolute w-1.5 h-full shadow-md ${
                        isPastDue(milestone.deadline) ? 'bg-red-600' : 'bg-purple-700'
                      }`}
                      style={getMilestoneStyle(milestone)}
                    ></div>
                  </div>
                </div>

                {tasksForMilestone.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex py-2 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                    onClick={() => onTaskClick(task.id)}
                  >
                    <div className="w-40 flex-shrink-0 pl-4">
                      <span className="text-sm text-gray-600">{task.title}</span>
                    </div>
                    <div className="relative flex-grow h-6">
                      <div 
                        className="absolute h-4 rounded-sm cursor-pointer hover:opacity-80"
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
    </div>
  );
}