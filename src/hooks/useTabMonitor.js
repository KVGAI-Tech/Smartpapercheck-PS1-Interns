import { useEffect } from 'react';

export const useTabMonitor = ({ enabled = true, active = false, onTabSwitch } = {}) => {
  useEffect(() => {
    if (!enabled || !active) return undefined;

    let lastEventAt = 0;
    const notify = (source) => {
      const now = Date.now();
      if (now - lastEventAt < 1200) return;
      lastEventAt = now;
      onTabSwitch?.(source);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        notify('visibilitychange');
      }
    };
    const handleBlur = () => notify('blur');

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [active, enabled, onTabSwitch]);
};
