
import { type Project } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { deleteProject } = useProjects();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteProject(project.id);
      toast({
        title: "プロジェクトを削除しました",
        description: `「${project.title}」を削除しました`,
      });
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        description: "プロジェクトの削除に失敗しました",
        variant: "destructive",
      });
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // クリックイベントの伝播を防ぐ（削除ボタンのクリックがカード全体のクリックとして処理されるのを防ぐ）
    if ((e.target as HTMLElement).closest('button')) {
      e.stopPropagation();
      return;
    }
    onClick?.();
  };

  return (
    <>
      <Card 
        className="w-full cursor-pointer hover:shadow-md transition-shadow relative"
        onClick={handleCardClick}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <i className="ri-delete-bin-line"></i>
        </Button>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-2">{project.title}</h3>
          <p className="text-gray-600 text-sm">{project.goal}</p>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>プロジェクトの削除</AlertDialogTitle>
            <AlertDialogDescription>
              「{project.title}」を削除してもよろしいですか？
              この操作は取り消すことができません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
