import { useEffect } from "react";
import { useLocation } from "wouter";
import { useProjects } from "@/hooks/useProjects";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectForm from "@/components/projects/ProjectForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { PlusIcon } from "@/components/ui/icons";

export default function Home() {
  const [, setLocation] = useLocation();
  const { projects, isLoading, error } = useProjects();

  useEffect(() => {
    document.title = "研究計画管理";
  }, []);

  if (isLoading) {
    return (
      <div className="flex-grow p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">プロジェクト一覧</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="w-full h-40 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">プロジェクト一覧</h1>
          <Card className="w-full bg-red-50 border-red-200">
            <CardContent className="p-6">
              <p className="text-red-500">エラーが発生しました。再読み込みしてください。</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow p-4 md:p-8 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">プロジェクト一覧</h1>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-blue-600">
                <PlusIcon className="mr-2 h-4 w-4" /> 新しいプロジェクト
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <ProjectForm />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.length > 0 ? (
            projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => setLocation(`/projects/${project.id}`)}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center text-center p-8">
              <div className="text-gray-400 text-5xl mb-4">
                <i className="ri-folder-open-line"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-700">プロジェクトがありません</h3>
              <p className="text-gray-500 mb-4">新しいプロジェクトを作成して研究計画を始めましょう</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
