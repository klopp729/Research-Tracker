import { useState } from "react";
import { Milestone } from "@shared/schema";
import MilestoneForm from "./MilestoneForm";
import { useTasks } from "@/hooks/useTasks";
import TaskItem from "@/components/tasks/TaskItem";
import TaskForm from "@/components/tasks/TaskForm";
import { formatDate, getDaysUntil, formatDaysDifference, isPastDue } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useMilestones } from "@/hooks/useMilestones"; // Import useMilestones hook

interface MilestoneItemProps {
  milestone: Milestone;
  onTaskClick: (taskId: number) => void;
}

export default function MilestoneItem({ milestone, onTaskClick }: MilestoneItemProps) {
  const { tasks, isLoading } = useTasks(milestone.id);
  const { deleteMilestone } = useMilestones(milestone.projectId); // Add deleteMilestone
  const [showAddTask, setShowAddTask] = useState(false);
  const { toast } = useToast(); // Add useToast

  const daysUntil = getDaysUntil(milestone.deadline);
  const isPast = isPastDue(milestone.deadline);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6" data-milestone-id={milestone.id}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-foreground">{milestone.title}</h3>
            <span className="ml-2 text-xs font-medium px-2 py-1 rounded-full bg-secondary text-white">マイルストーン</span>
          </div>
          <div className="flex items-center mt-1 text-sm">
            <i className="ri-calendar-line text-gray-500 mr-1"></i>
            <span className={`font-medium ${isPast ? "text-warning" : "text-gray-600"}`}>
              期限: {formatDate(milestone.deadline)}
            </span>
            <span className="ml-2 text-gray-500">
              {formatDaysDifference(daysUntil)}
            </span>
          </div>
        </div>
        <div className="flex items-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary">
                <Pencil className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <MilestoneForm projectId={milestone.projectId} milestone={milestone} />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary ml-1">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <TaskForm milestoneId={milestone.id} onSuccess={() => setShowAddTask(false)} />
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 ml-1">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={async () => {
                  const ok = window.confirm("マイルストーンを削除してもよろしいですか？");
                  if (ok) {
                    await deleteMilestone(milestone.id); // Use deleteMilestone here
                    toast({ // Use toast here
                      title: "マイルストーンが削除されました",
                      description: `マイルストーン「${milestone.title}」を削除しました`,
                    });
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-20 bg-gray-100 rounded-md"></div>
            <div className="h-20 bg-gray-100 rounded-md"></div>
          </div>
        ) : (
          <>
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onClick={() => onTaskClick(task.id)}
                />
              ))
            ) : (
              <div className="py-4 text-center text-gray-500">
                このマイルストーンにはまだタスクがありません
              </div>
            )}
          </>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-md border border-dashed border-gray-300 mt-2"
            >
              <i className="ri-add-line mr-1"></i> タスクを追加
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <TaskForm milestoneId={milestone.id} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}