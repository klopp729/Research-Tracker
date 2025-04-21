import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { insertTaskSchema, taskStatusEnum } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

// Extend the schema to add validation rules
const formSchema = insertTaskSchema.extend({
  title: z.string().min(1, "タイトルは必須です").max(100, "タイトルは100文字以内にしてください"),
  description: z.string().optional(),
  status: taskStatusEnum,
  dueDate: z.date({
    required_error: "締切日を選択してください",
  }),
  notes: z.string().optional(),
  attachments: z.array(z.any()).optional().default([]),
});

interface TaskFormProps {
  milestoneId: number;
  onSuccess?: () => void;
}

export default function TaskForm({ milestoneId, onSuccess }: TaskFormProps) {
  const { toast } = useToast();
  const { createTask, isCreating } = useTasks(milestoneId);
  const [isOpen, setIsOpen] = useState(true);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "NOT_STARTED",
      dueDate: new Date(),
      notes: "",
      attachments: [],
      milestoneId: milestoneId,
    },
  });
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createTask(values);
      toast({
        title: "タスクが作成されました",
        description: `タスク「${values.title}」を作成しました`,
      });
      form.reset();
      if (onSuccess) onSuccess();
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        description: "タスクの作成に失敗しました",
        variant: "destructive",
      });
    }
  }
  
  return (
    <>
      <DialogHeader>
        <DialogTitle>新しいタスク</DialogTitle>
        <DialogDescription>
          マイルストーンのタスクを作成してください。
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>タイトル</FormLabel>
                <FormControl>
                  <Input placeholder="タスクのタイトル" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>説明</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="タスクの詳細" 
                    rows={2}
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ステータス</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="ステータスを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NOT_STARTED">未着手</SelectItem>
                      <SelectItem value="IN_PROGRESS">進行中</SelectItem>
                      <SelectItem value="COMPLETED">完了</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>締切日</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                        >
                          {field.value ? (
                            format(field.value, "yyyy/MM/dd", { locale: ja })
                          ) : (
                            <span>日付を選択</span>
                          )}
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>メモ</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="タスクに関するメモ" 
                    rows={3}
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <DialogFooter>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "作成中..." : "作成"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
