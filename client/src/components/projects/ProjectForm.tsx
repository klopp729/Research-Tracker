import { useState } from "react";
import { useLocation } from "wouter";
import { useProjects } from "@/hooks/useProjects";
import { insertProjectSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Extend the schema to add validation rules
const formSchema = insertProjectSchema.extend({
  title: z.string().min(1, "タイトルは必須です").max(100, "タイトルは100文字以内にしてください"),
  goal: z.string().min(1, "目標は必須です").max(500, "目標は500文字以内にしてください"),
});

export default function ProjectForm() {
  const { toast } = useToast();
  const { createProject, isCreating } = useProjects();
  const [isOpen, setIsOpen] = useState(true);
  const [, setLocation] = useLocation();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      goal: "",
      userId: 1, // Default user ID
    },
  });
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const newProject = await createProject(values);
      toast({
        title: "プロジェクトが作成されました",
        description: `プロジェクト「${values.title}」を作成しました`,
      });
      form.reset();
      setIsOpen(false);
      setLocation(`/projects/${newProject.id}`);
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        description: "プロジェクトの作成に失敗しました",
        variant: "destructive",
      });
    }
  }
  
  return (
    <>
      <DialogHeader>
        <DialogTitle>新しいプロジェクト</DialogTitle>
        <DialogDescription>
          研究プロジェクトの基本情報を入力してください。
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
                  <Input placeholder="研究プロジェクトのタイトル" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="goal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>目標</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="このプロジェクトの目標と概要" 
                    rows={4}
                    {...field} 
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
