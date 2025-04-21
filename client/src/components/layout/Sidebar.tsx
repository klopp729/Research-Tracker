import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useProjects } from "@/hooks/useProjects";

interface SidebarProps {
  onItemClick?: () => void;
}

export default function Sidebar({ onItemClick }: SidebarProps) {
  const [location] = useLocation();
  const { projects, isLoading } = useProjects();

  const handleClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <div className="flex flex-col md:w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-4 border-b border-gray-200">
        <Link href="/" onClick={handleClick}>
          <h1 className="text-xl font-semibold text-primary cursor-pointer">研究計画管理</h1>
        </Link>
      </div>
      
      <div className="p-4">
        <Link href="/" onClick={handleClick}>
          <button className="w-full bg-primary hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center justify-center">
            <i className="ri-add-line mr-2"></i> 新しいプロジェクト
          </button>
        </Link>
      </div>
      
      <div className="overflow-y-auto flex-grow">
        <div className="p-4">
          <h2 className="text-sm font-medium text-gray-500 mb-2">プロジェクト一覧</h2>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded-md mb-1"></div>
              <div className="h-10 bg-gray-200 rounded-md mb-1"></div>
              <div className="h-10 bg-gray-200 rounded-md mb-1"></div>
            </div>
          ) : (
            <ul>
              {projects.map((project) => (
                <li key={project.id} className="mb-1">
                  <Link href={`/projects/${project.id}`} onClick={handleClick}>
                    <a className={`block py-2 px-3 rounded-md ${
                      location === `/projects/${project.id}` 
                        ? "bg-blue-50 text-primary font-medium" 
                        : "hover:bg-gray-100 transition-colors"
                    }`}>
                      {project.title}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <i className="ri-user-line text-gray-600"></i>
          </div>
          <span className="ml-2 text-sm font-medium">山田 太郎</span>
        </div>
      </div>
    </div>
  );
}
