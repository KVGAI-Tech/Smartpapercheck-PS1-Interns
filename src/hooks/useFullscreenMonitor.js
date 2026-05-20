import { useCallback, useEffect, useState } from 'react';

export const useFullscreenMonitor = ({ enabled = true, active = false, onExit } = {}) => {
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [fullscreenError, setFullscreenError] = useState('');

  const requestFullscreen = useCallback(async () => {
    if (!enabled) return true;
    const element = document.documentElement;
    if (!element?.requestFullscreen) {
      setFullscreenError('Fullscreen mode is not supported in this browser.');
      return false;
    }
    try {
      await element.requestFullscreen();
      setFullscreenError('');
      setIsFullscreen(true);
      return true;
    } catch (error) {
      setFullscreenError(error?.message || 'Fullscreen mode could not be started.');
      return false;
    }
  }, [enabled]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const nextIsFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(nextIsFullscreen);
      if (enabled && active && !nextIsFullscreen) {
        onExit?.();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [active, enabled, onExit]);

  return {
    isFullscreen,
    fullscreenError,
    requestFullscreen,
    fullscreenSupported: Boolean(document.documentElement?.requestFullscreen),
  };
};
