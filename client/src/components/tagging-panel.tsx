import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/multi-select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { exportToCSV } from "@/lib/csv-export";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";
import type { Category, Player, Tag } from "@shared/schema";

const tagFormSchema = z.object({
  categoryId: z.string().min(1, "Please select a category"),
  description: z.string().min(1, "Please enter a description"),
  playerIds: z.array(z.string()).default([]),
});

type TagFormData = z.infer<typeof tagFormSchema>;

interface TaggingPanelProps {
  currentTime: number;
  videoUrl: string;
  isTagging: boolean;
  onCancelTagging: () => void;
  onTagCreated: () => void;
}

export function TaggingPanel({
  currentTime,
  videoUrl,
  isTagging,
  onCancelTagging,
  onTagCreated
}: TaggingPanelProps) {
  const { toast } = useToast();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
  });

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      categoryId: "",
      description: "",
      playerIds: [],
    },
  });

  const createTagMutation = useMutation({
    mutationFn: async (data: TagFormData) => {
      const tagData = {
        ...data,
        timestamp: Math.floor(currentTime),
        videoUrl: videoUrl || undefined,
      };
      
      const response = await apiRequest("POST", "/api/tags", tagData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
      form.reset();
      onTagCreated();
      toast({
        title: "Success",
        description: "Tag created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: TagFormData) => {
    createTagMutation.mutate(data);
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch("/api/export/csv");
      const csvData = await response.json();
      exportToCSV(csvData, `frisbee-analysis-${new Date().toISOString().split('T')[0]}.csv`);
      toast({
        title: "Success",
        description: "Data exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playerOptions = players.map(player => ({
    value: player.id,
    label: `${player.name} (#${player.number})`,
  }));

  return (
    <div className="space-y-6">
      {/* Create Tag Section */}
      <Card>
        <CardHeader>
          <CardTitle>Create Tag</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Category Selection */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the play or action..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Player Selection */}
              <FormField
                control={form.control}
                name="playerIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Players Involved</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={playerOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select players..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Current Timestamp Display */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Timestamp:</span>
                  <span className="font-mono text-field-green font-medium">
                    {formatTime(currentTime)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  disabled={createTagMutation.isPending || !isTagging}
                  className="flex-1 btn-action-green hover:btn-action-green"
                >
                  {createTagMutation.isPending ? "Saving..." : "Save Tag"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancelTagging}
                  disabled={createTagMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleExportCSV}
            className="w-full btn-sky-blue hover:btn-sky-blue"
          >
            <Download className="w-4 h-4 mr-2" />
            Export as CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
