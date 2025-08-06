import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Edit, Trash2, Plus } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Category, Player } from "@shared/schema";

const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

const playerFormSchema = z.object({
  name: z.string().min(1, "Player name is required"),
  number: z.number().min(1, "Player number is required"),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;
type PlayerFormData = z.infer<typeof playerFormSchema>;

export function AdminPanel() {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "" },
  });

  const playerForm = useForm<PlayerFormData>({
    resolver: zodResolver(playerFormSchema),
    defaultValues: { name: "", number: 0 },
  });

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await apiRequest("POST", "/api/categories", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      categoryForm.reset();
      toast({ title: "Success", description: "Category created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create category", variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryFormData }) => {
      const response = await apiRequest("PUT", `/api/categories/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setEditingCategory(null);
      toast({ title: "Success", description: "Category updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update category", variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Success", description: "Category deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete category", variant: "destructive" });
    },
  });

  // Player mutations
  const createPlayerMutation = useMutation({
    mutationFn: async (data: PlayerFormData) => {
      const response = await apiRequest("POST", "/api/players", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      playerForm.reset();
      toast({ title: "Success", description: "Player created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create player", variant: "destructive" });
    },
  });

  const updatePlayerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PlayerFormData }) => {
      const response = await apiRequest("PUT", `/api/players/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      setEditingPlayer(null);
      toast({ title: "Success", description: "Player updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update player", variant: "destructive" });
    },
  });

  const deletePlayerMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/players/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({ title: "Success", description: "Player deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete player", variant: "destructive" });
    },
  });

  const handleCreateCategory = (data: CategoryFormData) => {
    createCategoryMutation.mutate(data);
  };

  const handleCreatePlayer = (data: PlayerFormData) => {
    createPlayerMutation.mutate(data);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category.id);
    // For simplicity, using a prompt. In a real app, you'd use a proper form
    const newName = prompt("Enter new category name:", category.name);
    if (newName && newName !== category.name) {
      updateCategoryMutation.mutate({ id: category.id, data: { name: newName } });
    } else {
      setEditingCategory(null);
    }
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player.id);
    // For simplicity, using prompts. In a real app, you'd use a proper form
    const newName = prompt("Enter new player name:", player.name);
    const newNumber = prompt("Enter new player number:", player.number.toString());
    
    if (newName && newNumber) {
      const numberValue = parseInt(newNumber);
      if (!isNaN(numberValue) && (newName !== player.name || numberValue !== player.number)) {
        updatePlayerMutation.mutate({ 
          id: player.id, 
          data: { name: newName, number: numberValue } 
        });
      } else {
        setEditingPlayer(null);
      }
    } else {
      setEditingPlayer(null);
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const handleDeletePlayer = (id: string) => {
    if (confirm("Are you sure you want to delete this player? This action cannot be undone.")) {
      deletePlayerMutation.mutate(id);
    }
  };

  return (
    <Card>
      <CardHeader className="bg-field-green bg-opacity-10">
        <CardTitle>Admin: Manage Tag Categories</CardTitle>
        <p className="text-sm text-gray-600">Add, edit, or remove tag categories and player roster</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Management */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Tag Categories</h4>
            <div className="space-y-3 mb-4">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <span className="text-sm font-medium">{category.name}</span>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                      className="text-sky-blue hover:text-blue-700"
                      disabled={editingCategory === category.id}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-700"
                      disabled={deleteCategoryMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Form {...categoryForm}>
              <form onSubmit={categoryForm.handleSubmit(handleCreateCategory)} className="flex space-x-2">
                <FormField
                  control={categoryForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="New category name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={createCategoryMutation.isPending}
                  className="btn-field-green hover:btn-field-green"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </form>
            </Form>
          </div>

          {/* Player Management */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Player Roster</h4>
            <div className="space-y-3 mb-4">
              {players.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <span className="text-sm font-medium">
                    {player.name} (#{player.number})
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPlayer(player)}
                      className="text-sky-blue hover:text-blue-700"
                      disabled={editingPlayer === player.id}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePlayer(player.id)}
                      className="text-red-600 hover:text-red-700"
                      disabled={deletePlayerMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Form {...playerForm}>
              <form onSubmit={playerForm.handleSubmit(handleCreatePlayer)} className="space-y-2">
                <div className="flex space-x-2">
                  <FormField
                    control={playerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Player name..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={playerForm.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="#"
                            className="w-16"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={createPlayerMutation.isPending}
                  className="w-full btn-field-green hover:btn-field-green"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Player
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
