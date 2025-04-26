import { useState } from "react";
import { useMilestones } from "@/hooks/useMilestones";
import { insertMilestoneSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

// Extend the schema to add validation rules
const formSchema = insertMilestoneSchema.extend({
  title: z.string().min(1, "タイトルは必須です").max(100, "タイトルは100文字以内にしてください"),
  deadline: z.date({
    required_error: "締切日を選択してください",
  }),
});

interface MilestoneFormProps {
  projectId: number;
  milestone?: Milestone;
  onSuccess?: () => void;
}

export default function MilestoneForm({ projectId, milestone, onSuccess }: MilestoneFormProps) {
  const { toast } = useToast();
  const { createMilestone, updateMilestone, isCreating, isUpdating } = useMilestones(projectId);
  const [isOpen, setIsOpen] = useState(true);
  const isEditing = !!milestone;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: milestone?.title || "",
      deadline: milestone ? new Date(milestone.deadline) : new Date(),
      projectId: projectId,
    },
  });
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (isEditing && milestone) {
        await updateMilestone({ id: milestone.id, milestone: values });
        toast({
          title: "マイルストーンが更新されました",
          description: `マイルストーン「${values.title}」を更新しました`,
        });
      } else {
        await createMilestone(values);
        toast({
          title: "マイルストーンが作成されました",
          description: `マイルストーン「${values.title}」を作成しました`,
        });
      }
      form.reset();
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        description: isEditing ? "マイルストーンの更新に失敗しました" : "マイルストーンの作成に失敗しました",
        variant: "destructive",
      });
    }
  }
  
  return (
    <>
      <DialogHeader>
        <DialogTitle>新しいマイルストーン</DialogTitle>
        <DialogDescription>
          研究プロジェクトのマイルストーンを設定してください。
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
                  <Input placeholder="マイルストーンのタイトル" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="deadline"
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
