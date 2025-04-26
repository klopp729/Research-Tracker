import { Task } from "@shared/schema";
import { formatDate, TaskStatusMap } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onClick: () => void;
}

export default function TaskItem({ task, onClick }: TaskItemProps) {
  const statusInfo = TaskStatusMap[task.status as keyof typeof TaskStatusMap];
  const isCompleted = task.status === "COMPLETED";

  return (
    <div 
      className={`${statusInfo.taskClass} p-4 rounded-lg shadow-md bg-white hover:shadow-lg transition duration-300 ease-in-out`} 
      data-task-id={task.id} 
      draggable="true"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isCompleted ? (
            <button className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
              <i className="ri-check-line text-lg"></i>
            </button>
          ) : (
            <button className={`w-6 h-6 rounded-full border-2 ${statusInfo.borderColor} flex-shrink-0`}></button>
          )}
          <h4 className={`ml-3 font-medium text-gray-800 ${isCompleted ? "line-through text-gray-500" : ""}`}>{task.title}</h4>
        </div>
        <div>
          <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>
      <div className="ml-8 mt-2">
        <p className={`text-sm text-gray-600 ${isCompleted ? "text-gray-500 line-through" : ""}`}>{task.description || "説明なし"}</p>
        <div className="flex items-center mt-2 text-xs text-gray-500">
          <span className="flex items-center"><i className="ri-calendar-line mr-1"></i> {formatDate(task.dueDate)}</span>
          {task.attachments && task.attachments.length > 0 && (
            <span className="flex items-center ml-3">
              <i className="ri-attachment-2 mr-1"></i> {task.attachments.length}
            </span>
          )}
          {task.notes && (
            <span className="flex items-center ml-3"><i className="ri-chat-1-line mr-1"></i> メモあり</span>
          )}
        </div>
      </div>
    </div>
  );
}