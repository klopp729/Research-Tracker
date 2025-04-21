import { type Project } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <Card 
      className="w-full cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-primary mb-2">{project.title}</h3>
        <p className="text-gray-600 text-sm">{project.goal}</p>
      </CardContent>
    </Card>
  );
}
