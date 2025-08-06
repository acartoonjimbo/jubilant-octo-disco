import { useState } from "react";
import { VideoPlayer } from "@/components/video-player";
import { TaggingPanel } from "@/components/tagging-panel";
import { TagsList } from "@/components/tags-list";
import { PatternAnalysis } from "@/components/pattern-analysis";
import { AdminPanel } from "@/components/admin-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VideoAnalysis() {
  const [videoUrl, setVideoUrl] = useState("");
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const { toast } = useToast();

  const handleLoadVideo = () => {
    if (!videoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid video URL",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(videoUrl);
      setCurrentVideoUrl(videoUrl);
      toast({
        title: "Success",
        description: "Video loaded successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
    }
  };

  const handleSeekTo = (timestamp: number) => {
    setCurrentTime(timestamp);
  };

  const handleStartTagging = () => {
    setIsTagging(true);
    setIsPlaying(false);
  };

  const handleCancelTagging = () => {
    setIsTagging(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-field-green rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Ultimate Frisbee Analysis</h1>
                <p className="text-sm text-gray-600">Video annotation and strategy review</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdmin(!showAdmin)}
                className="text-gray-600 hover:text-field-green"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <span className="text-sm text-gray-500">Coach Mode</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Video Loader */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Load Video</h2>
            <div className="flex space-x-4">
              <Input
                type="url"
                placeholder="Enter video URL (YouTube, Vimeo, or direct link)"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="flex-1"
                data-testid="input-video-url"
              />
              <Button 
                onClick={handleLoadVideo}
                className="btn-field-green hover:btn-field-green"
                data-testid="button-load-video"
              >
                Load Video
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <VideoPlayer
              url={currentVideoUrl}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onTimeUpdate={setCurrentTime}
              onPlayPause={setIsPlaying}
              onSeekTo={handleSeekTo}
              onStartTagging={handleStartTagging}
              isTagging={isTagging}
            />
          </div>

          {/* Tagging Panel */}
          <div>
            <TaggingPanel
              currentTime={currentTime}
              videoUrl={currentVideoUrl}
              isTagging={isTagging}
              onCancelTagging={handleCancelTagging}
              onTagCreated={() => setIsTagging(false)}
            />
          </div>
        </div>

        {/* Tags List */}
        <div className="mt-8">
          <TagsList onSeekTo={handleSeekTo} />
        </div>

        {/* Pattern Analysis */}
        <div className="mt-8">
          <PatternAnalysis onSeekTo={handleSeekTo} />
        </div>

        {/* Admin Panel */}
        {showAdmin && (
          <div className="mt-8">
            <AdminPanel />
          </div>
        )}
      </div>
    </div>
  );
}
