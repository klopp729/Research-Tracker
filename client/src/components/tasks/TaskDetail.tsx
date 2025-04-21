import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { Attachment, taskStatusEnum } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { getFileIcon } from "@/lib/utils";

// Form schema for task details
const formSchema = z.object({
  status: taskStatusEnum,
  dueDate: z.date(),
  notes: z.string().optional(),
});

interface TaskDetailProps {
  taskId: number;
  onClose: () => void;
}

export default function TaskDetail({ taskId, onClose }: TaskDetailProps) {
  const { toast } = useToast();
  const { task, updateTask, isUpdating } = useTasks(0, taskId);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: task?.status || "NOT_STARTED",
      dueDate: task?.dueDate ? new Date(task.dueDate) : new Date(),
      notes: task?.notes || "",
    },
  });
  
  // Update form when task data is loaded
  useState(() => {
    if (task) {
      form.reset({
        status: task.status as z.infer<typeof taskStatusEnum>,
        dueDate: new Date(task.dueDate),
        notes: task.notes || "",
      });
    }
  });
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!task) return;
    
    try {
      await updateTask({
        ...values,
        id: task.id,
      });
      toast({
        title: "タスクが更新されました",
        description: `タスク「${task.title}」を更新しました`,
      });
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        description: "タスクの更新に失敗しました",
        variant: "destructive",
      });
    }
  }
  
  if (!task) {
    return (
      <div id="task-detail" className="md:w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-medium">タスク詳細</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 flex-grow overflow-y-auto">
          <p>タスクが見つかりません。</p>
        </div>
      </div>
    );
  }
  
  return (
    <div id="task-detail" className="md:w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium">タスク詳細</h3>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="p-4 flex-grow overflow-y-auto">
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">{task.title}</h2>
          {task.description && (
            <p className="text-sm text-gray-600">{task.description}</p>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Task Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">ステータス</FormLabel>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={field.value === "NOT_STARTED" ? "default" : "outline"}
                        onClick={() => field.onChange("NOT_STARTED")}
                        className="px-3 py-1 text-sm rounded-md"
                      >
                        未着手
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "IN_PROGRESS" ? "default" : "outline"}
                        onClick={() => field.onChange("IN_PROGRESS")}
                        className="px-3 py-1 text-sm rounded-md"
                      >
                        進行中
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "COMPLETED" ? "default" : "outline"}
                        onClick={() => field.onChange("COMPLETED")}
                        className="px-3 py-1 text-sm rounded-md"
                      >
                        完了
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
              
              {/* Due Date */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">期限</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm"
                          >
                            {format(field.value, "yyyy/MM/dd", { locale: ja })}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={ja}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
              
              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">メモ</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm h-32" 
                        placeholder="メモを入力してください"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">添付ファイル</label>
                <div className="space-y-2">
                  {task.attachments && task.attachments.length > 0 ? (
                    (task.attachments as unknown as Attachment[]).map((attachment) => (
                      <div key={attachment.id} className="flex items-center p-2 border border-gray-200 rounded-md">
                        <i className={`${getFileIcon(attachment.type)} text-lg mr-2`}></i>
                        <span className="text-sm truncate flex-grow">{attachment.name}</span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <i className="ri-download-line"></i>
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">添付ファイルはありません</p>
                  )}
                </div>
                <button className="mt-2 w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <i className="ri-upload-line mr-1"></i> ファイルを追加
                </button>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  className="flex-grow px-3 py-2 bg-primary hover:bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium"
                  disabled={isUpdating}
                >
                  {isUpdating ? "保存中..." : "保存"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50"
                  onClick={onClose}
                >
                  キャンセル
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
