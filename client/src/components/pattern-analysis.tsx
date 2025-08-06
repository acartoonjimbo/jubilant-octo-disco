import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Tag, Category, Player } from "@shared/schema";

interface PatternAnalysisProps {
  onSeekTo: (timestamp: number) => void;
}

export function PatternAnalysis({ onSeekTo }: PatternAnalysisProps) {
  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  // Create lookup maps
  const categoryMap = new Map(categories.map(c => [c.id, c]));
  const playerMap = new Map(players.map(p => [p.id, p]));

  // Calculate category statistics
  const categoryStats = categories.map(category => {
    const count = tags.filter(tag => tag.categoryId === category.id).length;
    return { category, count };
  });

  // Calculate player statistics
  const playerStats = players.map(player => {
    const playerTags = tags.filter(tag => tag.playerIds.includes(player.id));
    const goals = playerTags.filter(tag => {
      const category = categoryMap.get(tag.categoryId);
      return category?.name === 'Goal';
    }).length;
    const turnovers = playerTags.filter(tag => {
      const category = categoryMap.get(tag.categoryId);
      return category?.name === 'Turnover';
    }).length;
    
    return {
      player,
      totalTags: playerTags.length,
      goals,
      turnovers,
      timestamps: playerTags.map(tag => tag.timestamp).sort((a, b) => a - b)
    };
  }).filter(stat => stat.totalTags > 0).sort((a, b) => b.totalTags - a.totalTags);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (categoryName: string) => {
    switch (categoryName?.toLowerCase()) {
      case 'offensive play': return 'text-field-green';
      case 'defensive play': return 'text-sky-blue';
      case 'turnover': return 'text-highlight-orange';
      case 'goal': return 'text-action-green';
      case 'penalty': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pattern Analysis</CardTitle>
        <p className="text-sm text-gray-600">View tag frequency and player involvement patterns</p>
      </CardHeader>
      <CardContent>
        {/* Category Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {categoryStats.map(({ category, count }) => (
            <div key={category.id} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${getCategoryColor(category.name)}`}>
                {count}
              </div>
              <div className="text-sm text-gray-600">{category.name}</div>
            </div>
          ))}
        </div>

        {/* Player Performance Summary */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Goals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turnovers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamps
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {playerStats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No player data available. Tag some plays first!
                  </td>
                </tr>
              ) : (
                playerStats.map(({ player, totalTags, goals, turnovers, timestamps }) => (
                  <tr key={player.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {player.name} (#{player.number})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {totalTags}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-action-green">
                      {goals}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-highlight-orange">
                      {turnovers}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {timestamps.map(timestamp => (
                          <Button
                            key={timestamp}
                            variant="link"
                            className="timestamp-link text-field-green hover:text-green-700 font-mono text-xs p-0 h-auto"
                            onClick={() => onSeekTo(timestamp)}
                          >
                            {formatTime(timestamp)}
                          </Button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
