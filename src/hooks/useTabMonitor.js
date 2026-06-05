import { useEffect } from 'react';

export const useTabMonitor = ({ enabled = true, active = false, onTabSwitch, shouldIgnore } = {}) => {
  useEffect(() => {
    if (!enabled || !active) return undefined;

    let lastEventAt = 0;
    const notify = (source) => {
      if (shouldIgnore?.(source)) return;

      const now = Date.now();
      if (now - lastEventAt < 1200) return;
      lastEventAt = now;
      onTabSwitch?.(source);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (shouldIgnore?.('visibilitychange')) return;
        notify('visibilitychange');
      }
    };
    const handleBlur = () => {
      if (shouldIgnore?.('blur')) return;
      notify('blur');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [active, enabled, onTabSwitch, shouldIgnore]);
};
