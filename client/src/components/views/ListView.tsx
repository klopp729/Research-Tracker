import { useMilestones } from "@/hooks/useMilestones";
import { Milestone } from "@shared/schema";
import MilestoneItem from "@/components/milestones/MilestoneItem";

interface ListViewProps {
  projectId: number;
  milestones?: Milestone[];
  onTaskClick: (taskId: number) => void;
}

export default function ListView({ projectId, milestones, onTaskClick }: ListViewProps) {
  // If milestones are not provided, fetch them
  const { milestones: fetchedMilestones, isLoading, error } = useMilestones(
    projectId,
    { enabled: !milestones }
  );
  
  const displayMilestones = milestones || fetchedMilestones;
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-40 bg-gray-100 rounded-lg mb-6"></div>
          <div className="h-40 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-md text-red-500">
        マイルストーンの読み込み中にエラーが発生しました。
      </div>
    );
  }
  
  if (displayMilestones.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">マイルストーンがありません。「マイルストーンを追加」ボタンをクリックして作成してください。</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {displayMilestones.map((milestone) => (
        <MilestoneItem 
          key={milestone.id} 
          milestone={milestone} 
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  );
}
