import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useCameraMonitor } from './useCameraMonitor';
import { useFullscreenMonitor } from './useFullscreenMonitor';
import { useTabMonitor } from './useTabMonitor';

const DEFAULT_SECURITY_CONFIG = {
  require_fullscreen: true,
  require_camera: true,
  track_tab_switching: true,
  disable_copy_paste: true,
  auto_submit_on_violation: false,
  violation_limit: 5,
};

const WARNING_MESSAGES = {
  TAB_SWITCH: 'Tab switching detected. Please stay focused on the exam window.',
  FULLSCREEN_EXIT: 'Fullscreen mode is required during the exam.',
  CAMERA_DISABLED: 'Camera preview is inactive. Please keep your camera enabled.',
  COPY_ATTEMPT: 'Copy, paste, and context menu actions are restricted during this exam.',
  BLOCKED_SHORTCUT: 'This keyboard shortcut is restricted during the exam.',
  NETWORK_OFFLINE: 'Internet connection lost. Keep working; autosave will retry when online.',
  NETWORK_ONLINE: 'Internet connection restored.',
};

const normalizeConfig = (config) => ({
  ...DEFAULT_SECURITY_CONFIG,
  ...(config || {}),
  violation_limit: Math.max(1, Number(config?.violation_limit || DEFAULT_SECURITY_CONFIG.violation_limit)),
});

export const useExamProtection = ({
  active = false,
  config,
  examId,
  submissionId,
  logSecurityEvent,
  onAutoSubmit,
  shouldIgnoreTabSwitch,
} = {}) => {
  const securityConfig = useMemo(() => normalizeConfig(config), [config]);
  const [violations, setViolations] = useState([]);
  const [latestWarning, setLatestWarning] = useState(null);
  const [isOnline, setIsOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const lastLoggedAtRef = useRef({});
  const autoSubmitTriggeredRef = useRef(false);
  const suppressedUntilRef = useRef(0);

  const isProtectionSuspended = useCallback(() => Date.now() < suppressedUntilRef.current, []);

  const suspendProtection = useCallback((durationMs = 20000) => {
    suppressedUntilRef.current = Math.max(
      suppressedUntilRef.current,
      Date.now() + Math.max(1000, Number(durationMs) || 20000)
    );
  }, []);

  const recordViolation = useCallback((type, detail = {}) => {
    const violationType = String(type || '').toUpperCase();
    const now = Date.now();
    if (now < suppressedUntilRef.current) return;

    const lastLoggedAt = lastLoggedAtRef.current[violationType] || 0;
    if (now - lastLoggedAt < 800) return;
    lastLoggedAtRef.current[violationType] = now;

    const entry = {
      id: `${violationType}-${now}`,
      type: violationType,
      message: detail.message || WARNING_MESSAGES[violationType] || 'Exam security event detected.',
      at: new Date(now).toISOString(),
      metadata: detail.metadata || {},
    };

    setViolations((previous) => {
      const next = [...previous, entry];
      if (
        securityConfig.auto_submit_on_violation
        && next.filter((item) => !['NETWORK_ONLINE', 'NETWORK_OFFLINE', 'SECURITY_CHECK_STARTED', 'SECURITY_CHECK_PASSED'].includes(item.type)).length >= securityConfig.violation_limit
        && !autoSubmitTriggeredRef.current
      ) {
        autoSubmitTriggeredRef.current = true;
        window.setTimeout(() => onAutoSubmit?.(), 300);
      }
      return next;
    });
    setLatestWarning(entry);

    logSecurityEvent?.({
      violation_type: violationType,
      message: entry.message,
      submission_id: submissionId,
      client_timestamp: entry.at,
      metadata: {
        examId,
        userAgent: navigator.userAgent,
        ...entry.metadata,
      },
    }).catch(() => {});
  }, [examId, logSecurityEvent, onAutoSubmit, securityConfig.auto_submit_on_violation, securityConfig.violation_limit, submissionId]);

  const camera = useCameraMonitor({
    enabled: securityConfig.require_camera,
    onCameraDisabled: () => recordViolation('CAMERA_DISABLED'),
  });

  const fullscreen = useFullscreenMonitor({
    enabled: securityConfig.require_fullscreen,
    active,
    onExit: () => recordViolation('FULLSCREEN_EXIT'),
  });

  useTabMonitor({
    enabled: securityConfig.track_tab_switching,
    active,
    shouldIgnore: (source) => isProtectionSuspended() || shouldIgnoreTabSwitch?.(source),
    onTabSwitch: (source) => recordViolation('TAB_SWITCH', { metadata: { source } }),
  });

  useEffect(() => {
    if (!active || !securityConfig.disable_copy_paste) return undefined;

    const blockedCombos = new Set(['c', 'v', 'x', 'a', 'p', 's', 'u']);
    const handleKeyDown = (event) => {
      const key = String(event.key || '').toLowerCase();
      const blockedDevtools =
        event.key === 'F12'
        || ((event.ctrlKey || event.metaKey) && event.shiftKey && ['i', 'j', 'c'].includes(key));
      const blockedStandard = (event.ctrlKey || event.metaKey) && blockedCombos.has(key);

      if (blockedDevtools || blockedStandard) {
        event.preventDefault();
        event.stopPropagation();
        recordViolation(blockedStandard && ['c', 'v', 'x'].includes(key) ? 'COPY_ATTEMPT' : 'BLOCKED_SHORTCUT', {
          metadata: { key: event.key, ctrlKey: event.ctrlKey, metaKey: event.metaKey, shiftKey: event.shiftKey },
        });
      }
    };

    const blockClipboard = (event) => {
      event.preventDefault();
      event.stopPropagation();
      recordViolation('COPY_ATTEMPT', { metadata: { event: event.type } });
    };

    const blockContextMenu = (event) => {
      event.preventDefault();
      event.stopPropagation();
      recordViolation('COPY_ATTEMPT', { metadata: { event: 'contextmenu' } });
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('copy', blockClipboard, true);
    document.addEventListener('cut', blockClipboard, true);
    document.addEventListener('paste', blockClipboard, true);
    document.addEventListener('contextmenu', blockContextMenu, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('copy', blockClipboard, true);
      document.removeEventListener('cut', blockClipboard, true);
      document.removeEventListener('paste', blockClipboard, true);
      document.removeEventListener('contextmenu', blockContextMenu, true);
    };
  }, [active, recordViolation, securityConfig.disable_copy_paste]);

  useEffect(() => {
    if (!active) return undefined;

    const handleOffline = () => {
      setIsOnline(false);
      recordViolation('NETWORK_OFFLINE');
    };
    const handleOnline = () => {
      setIsOnline(true);
      recordViolation('NETWORK_ONLINE');
    };
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [active, recordViolation]);

  const warningCount = violations.filter((item) => !['NETWORK_ONLINE', 'NETWORK_OFFLINE', 'SECURITY_CHECK_STARTED', 'SECURITY_CHECK_PASSED'].includes(item.type)).length;

  return {
    securityConfig,
    violations,
    warningCount,
    latestWarning,
    clearLatestWarning: () => setLatestWarning(null),
    isOnline,
    recordViolation,
    suspendProtection,
    isProtectionSuspended,
    ...camera,
    ...fullscreen,
  };
};
