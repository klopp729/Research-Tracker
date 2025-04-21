import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useProject } from "@/hooks/useProjects";
import { useMilestones } from "@/hooks/useMilestones";
import ProjectHeader from "@/components/projects/ProjectHeader";
import ListView from "@/components/views/ListView";
import CalendarView from "@/components/views/CalendarView";
import GanttView from "@/components/views/GanttView";
import TaskDetail from "@/components/tasks/TaskDetail";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MilestoneForm from "@/components/milestones/MilestoneForm";
import { PlusIcon } from "@/components/ui/icons";

type ViewType = "list" | "calendar" | "gantt";

export default function ProjectView() {
  const [, params] = useRoute<{ id: string }>("/projects/:id");
  const projectId = params ? parseInt(params.id, 10) : 0;
  
  const [activeView, setActiveView] = useState<ViewType>("list");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  
  const { project, isLoading: projectLoading } = useProject(projectId);
  const { milestones, isLoading: milestonesLoading } = useMilestones(projectId);
  
  const isLoading = projectLoading || milestonesLoading;

  useEffect(() => {
    if (project) {
      document.title = `${project.title} | 研究計画管理`;
    }
  }, [project]);
  
  if (isLoading) {
    return <div className="flex-grow p-4">読み込み中...</div>;
  }
  
  if (!project) {
    return <div className="flex-grow p-4">プロジェクトが見つかりません。</div>;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case "list":
        return (
          <ListView 
            projectId={projectId} 
            milestones={milestones}
            onTaskClick={(taskId) => setSelectedTaskId(taskId)}
          />
        );
      case "calendar":
        return (
          <CalendarView 
            projectId={projectId}
            milestones={milestones}
            onTaskClick={(taskId) => setSelectedTaskId(taskId)} 
          />
        );
      case "gantt":
        return (
          <GanttView 
            projectId={projectId}
            milestones={milestones}
            onTaskClick={(taskId) => setSelectedTaskId(taskId)}
          />
        );
      default:
        return <div>無効なビュータイプです。</div>;
    }
  };

  return (
    <div className="flex-grow flex flex-col overflow-hidden">
      {/* Project Header */}
      <ProjectHeader 
        project={project} 
        activeView={activeView} 
        onViewChange={setActiveView}
      />
      
      {/* Main Content Area */}
      <div className="flex-grow overflow-auto p-4">
        {renderActiveView()}
        
        {/* Add Milestone Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              className="flex items-center justify-center text-primary hover:bg-blue-50 py-3 rounded-md transition-colors w-full mt-4"
              variant="ghost"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              マイルストーンを追加
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <MilestoneForm projectId={projectId} />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Task Detail Sidebar */}
      {selectedTaskId && (
        <TaskDetail 
          taskId={selectedTaskId} 
          onClose={() => setSelectedTaskId(null)} 
        />
      )}
    </div>
  );
}
