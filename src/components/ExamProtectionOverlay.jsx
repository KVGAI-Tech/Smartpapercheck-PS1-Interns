import React, { useEffect, useRef, useState } from 'react';
import { Camera, ChevronDown, ShieldCheck, Wifi, WifiOff, X } from 'lucide-react';

const ExamProtectionOverlay = ({ protection }) => {
  const videoRef = useRef(null);
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 92 });
  const dragStateRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && protection.stream) {
      videoRef.current.srcObject = protection.stream;
    }
  }, [protection.stream, minimized]);

  useEffect(() => {
    const handleMove = (event) => {
      if (!dragStateRef.current) return;
      const nextX = Math.max(12, Math.min(window.innerWidth - 260, event.clientX - dragStateRef.current.offsetX));
      const nextY = Math.max(12, Math.min(window.innerHeight - 190, event.clientY - dragStateRef.current.offsetY));
      setPosition({ x: nextX, y: nextY });
    };
    const handleUp = () => {
      dragStateRef.current = null;
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  const startDrag = (event) => {
    dragStateRef.current = {
      offsetX: event.clientX - position.x,
      offsetY: event.clientY - position.y,
    };
  };

  return (
    <>
      <div
        className="fixed z-[180] w-[236px] overflow-hidden rounded-2xl border border-white/20 bg-gray-950 text-white shadow-2xl shadow-gray-900/30"
        style={{ left: position.x, top: position.y }}
      >
        <div
          className="flex cursor-move items-center justify-between bg-gray-900 px-3 py-2"
          onMouseDown={startDrag}
        >
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${protection.isCameraActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.16em]">
              {protection.isCameraActive ? 'Camera Active' : 'Camera Required'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMinimized((value) => !value)}
            className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
            title={minimized ? 'Expand camera preview' : 'Minimize camera preview'}
          >
            {minimized ? <Camera className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {!minimized && (
          <div>
            <div className="bg-black">
              {protection.stream ? (
                <video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full object-cover" />
              ) : (
                <div className="flex aspect-video items-center justify-center text-white/50">
                  <Camera className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 bg-gray-950 p-3 text-[10px] font-bold uppercase tracking-wider text-white/70">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                {protection.warningCount}/{protection.securityConfig.violation_limit}
              </span>
              <span className="flex items-center justify-end gap-1.5">
                {protection.isOnline ? <Wifi className="h-3.5 w-3.5 text-emerald-400" /> : <WifiOff className="h-3.5 w-3.5 text-amber-400" />}
                {protection.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        )}
      </div>

      {protection.latestWarning && (
        <div className="fixed right-6 top-6 z-[190] w-full max-w-sm rounded-2xl border border-amber-200 bg-white p-4 text-gray-900 shadow-2xl shadow-amber-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">
                Warning {Math.min(protection.warningCount, protection.securityConfig.violation_limit)}/{protection.securityConfig.violation_limit}
              </p>
              <p className="mt-1 text-sm font-bold">{protection.latestWarning.message}</p>
            </div>
            <button
              type="button"
              onClick={protection.clearLatestWarning}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ExamProtectionOverlay;
