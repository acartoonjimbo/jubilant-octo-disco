import { useRef, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, RotateCw, Plus, AlertCircle, Volume2, VolumeX } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onPlayPause: (playing: boolean) => void;
  onSeekTo: (time: number) => void;
  onStartTagging: () => void;
  isTagging: boolean;
}

export function VideoPlayer({
  url,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onPlayPause,
  onSeekTo,
  onStartTagging,
  isTagging
}: VideoPlayerProps) {
  const playerRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (playerRef.current && isReady) {
      const currentPlayerTime = playerRef.current.currentTime || 0;
      if (Math.abs(currentPlayerTime - currentTime) > 1) {
        playerRef.current.currentTime = currentTime;
      }
    }
  }, [currentTime, isReady]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (url) {
      setHasError(false);
      setIsReady(false);
    }
  }, [url]);

  const handleProgress = (progress: any) => {
    if (progress && typeof progress.playedSeconds === 'number') {
      onTimeUpdate(progress.playedSeconds);
    }
  };

  const handleReady = () => {
    console.log('ReactPlayer ready');
    setIsReady(true);
    setHasError(false);
  };

  const handleError = (error: any) => {
    console.error('ReactPlayer error:', error);
    setHasError(true);
    setIsReady(false);
  };

  

  const handlePlayPause = () => {
    onPlayPause(!isPlaying);
  };

  const handleRewind = () => {
    const newTime = Math.max(0, currentTime - 10);
    onSeekTo(newTime);
  };

  const handleForward = () => {
    const duration = playerRef.current?.duration || 0;
    const newTime = Math.min(duration, currentTime + 10);
    onSeekTo(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !playerRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const duration = playerRef.current?.duration || 0;
    const newTime = duration * percentage;
    
    onSeekTo(newTime);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  if (!url) {
    return (
      <Card className="overflow-hidden">
        <div className="video-container aspect-video relative bg-black flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 mx-auto mb-4 opacity-50 flex items-center justify-center">
              <Play className="w-16 h-16" />
            </div>
            <p className="text-lg opacity-75">Load a video to begin analysis</p>
            <p className="text-sm opacity-50">Supports YouTube, Vimeo, and direct video links</p>
          </div>
        </div>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card className="overflow-hidden">
        <div className="video-container aspect-video relative bg-black flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 mx-auto mb-4 opacity-50 flex items-center justify-center">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <p className="text-lg opacity-75">Error loading video</p>
            <p className="text-sm opacity-50">Please check the URL and try again</p>
          </div>
        </div>
      </Card>
    );
  }

  const duration = playerRef.current?.duration || 0;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="overflow-hidden">
      <div className="video-container aspect-video relative">
        <ReactPlayer
          ref={playerRef}
          src={url}
          width="100%"
          height="100%"
          playing={isPlaying && !isTagging}
          onProgress={handleProgress}
          onReady={handleReady}
          onError={handleError}
          controls={false}
        />
        
        {/* Loading overlay */}
        {!isReady && !hasError && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p>Loading video...</p>
            </div>
          </div>
        )}
        
        {/* Video Controls Overlay */}
        <div className="video-controls absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center space-x-4 text-white">
            {/* Play/Pause Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              className="p-2 hover:bg-white hover:bg-opacity-20 text-white hover:text-white"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
            
            {/* Rewind 10s */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRewind}
              className="p-2 hover:bg-white hover:bg-opacity-20 text-white hover:text-white flex items-center"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="text-xs ml-1">10s</span>
            </Button>
            
            {/* Forward 10s */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleForward}
              className="p-2 hover:bg-white hover:bg-opacity-20 text-white hover:text-white flex items-center"
            >
              <RotateCw className="w-5 h-5" />
              <span className="text-xs ml-1">10s</span>
            </Button>
            
            {/* Current Time */}
            <span className="text-sm font-mono">{formatTime(currentTime)}</span>
            
            {/* Progress Bar */}
            <div className="flex-1 mx-4">
              <div 
                ref={progressRef}
                className="bg-white bg-opacity-30 rounded-full h-1 cursor-pointer"
                onClick={handleProgressClick}
              >
                <div 
                  className="bg-field-green h-1 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            {/* Duration */}
            <span className="text-sm font-mono">{formatTime(duration)}</span>
            
            {/* Volume Controls */}
            <div className="flex items-center space-x-2 mx-4">
              {/* Mute Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMuteToggle}
                className="p-2 hover:bg-white hover:bg-opacity-20 text-white hover:text-white"
                data-testid="button-mute"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
              
              {/* Volume Slider */}
              <div className="w-20">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-white bg-opacity-30 rounded-lg appearance-none cursor-pointer slider"
                  data-testid="input-volume"
                />
              </div>
            </div>
            
            {/* Add Tag Button */}
            <Button
              size="sm"
              onClick={onStartTagging}
              className={`btn-highlight-orange hover:btn-highlight-orange text-white font-medium ${
                isTagging ? 'bg-red-600 hover:bg-red-600' : ''
              }`}
            >
              <Plus className="w-4 h-4 mr-1" />
              {isTagging ? 'Tagging...' : 'Tag'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
