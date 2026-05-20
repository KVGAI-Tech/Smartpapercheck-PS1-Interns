import { useCallback, useEffect, useRef, useState } from 'react';

export const useCameraMonitor = ({ enabled = true, onCameraDisabled } = {}) => {
  const streamRef = useRef(null);
  const disabledNotifiedRef = useRef(false);
  const [stream, setStream] = useState(null);
  const [cameraStatus, setCameraStatus] = useState('idle');
  const [cameraError, setCameraError] = useState('');

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    streamRef.current = null;
    setStream(null);
    setCameraStatus('idle');
  }, []);

  const requestCamera = useCallback(async () => {
    if (!enabled) {
      setCameraStatus('disabled');
      return null;
    }
    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraStatus('unsupported');
      setCameraError('Camera access is not supported in this browser.');
      return null;
    }

    setCameraStatus('requesting');
    setCameraError('');
    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 360 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = nextStream;
      setStream(nextStream);
      setCameraStatus('active');
      disabledNotifiedRef.current = false;
      return nextStream;
    } catch (error) {
      setCameraStatus('blocked');
      setCameraError(error?.message || 'Camera permission was not granted.');
      return null;
    }
  }, [enabled]);

  useEffect(() => {
    if (!stream) return undefined;

    const notifyDisabled = () => {
      setCameraStatus('inactive');
      if (!disabledNotifiedRef.current) {
        disabledNotifiedRef.current = true;
        onCameraDisabled?.();
      }
    };

    const tracks = stream.getVideoTracks();
    tracks.forEach((track) => {
      track.addEventListener('ended', notifyDisabled);
      track.addEventListener('mute', notifyDisabled);
    });

    return () => {
      tracks.forEach((track) => {
        track.removeEventListener('ended', notifyDisabled);
        track.removeEventListener('mute', notifyDisabled);
      });
    };
  }, [stream, onCameraDisabled]);

  useEffect(() => stopCamera, [stopCamera]);

  return {
    stream,
    cameraStatus,
    cameraError,
    requestCamera,
    stopCamera,
    isCameraActive: cameraStatus === 'active',
  };
};
