import { type Project } from "@shared/schema";

interface ProjectHeaderProps {
  project: Project;
  activeView: "list" | "calendar" | "gantt";
  onViewChange: (view: "list" | "calendar" | "gantt") => void;
}

export default function ProjectHeader({ project, activeView, onViewChange }: ProjectHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{project.title}</h2>
          <p className="text-gray-600 mt-1">{project.goal}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center">
          <span className="text-sm text-gray-500 mr-2">ビュー:</span>
          <div className="flex bg-gray-100 rounded-md p-1">
            <button 
              className={`py-1 px-3 rounded ${
                activeView === "list" 
                  ? "bg-white shadow-sm font-medium" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => onViewChange("list")}
            >
              リスト
            </button>
            <button 
              className={`py-1 px-3 rounded ${
                activeView === "calendar" 
                  ? "bg-white shadow-sm font-medium" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => onViewChange("calendar")}
            >
              カレンダー
            </button>
            <button 
              className={`py-1 px-3 rounded ${
                activeView === "gantt" 
                  ? "bg-white shadow-sm font-medium" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => onViewChange("gantt")}
            >
              ガントチャート
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
