import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Loader,
  Lock,
  MonitorCheck,
  ShieldCheck,
  Wifi,
} from 'lucide-react';

const StatusPill = ({ ok, label, detail }) => (
  <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${ok ? 'border-emerald-100 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-white text-gray-600'}`}>
    {ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <Loader className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />}
    <div>
      <p className="text-sm font-black">{label}</p>
      {detail && <p className="mt-0.5 text-xs font-medium opacity-75">{detail}</p>}
    </div>
  </div>
);

const OnlineExamSecurityCheck = ({
  examName,
  protection,
  onReady,
  onCancel,
}) => {
  const videoRef = useRef(null);
  const [browserOk] = useState(Boolean(navigator?.mediaDevices?.getUserMedia && document.documentElement?.requestFullscreen));
  const [internetOk, setInternetOk] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [starting, setStarting] = useState(false);
  const [setupError, setSetupError] = useState('');

  useEffect(() => {
    if (videoRef.current && protection.stream) {
      videoRef.current.srcObject = protection.stream;
    }
  }, [protection.stream]);

  useEffect(() => {
    const handleOnline = () => setInternetOk(true);
    const handleOffline = () => setInternetOk(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const beginSecureExam = async () => {
    setSetupError('');
    setStarting(true);
    try {
      let cameraOk = true;
      let fullscreenOk = true;

      if (protection.securityConfig.require_camera && !protection.isCameraActive) {
        const stream = await protection.requestCamera();
        cameraOk = Boolean(stream);
      }

      if (protection.securityConfig.require_fullscreen && !document.fullscreenElement) {
        fullscreenOk = await protection.requestFullscreen();
      }

      if (!browserOk) {
        setSetupError('This browser does not support the required exam security features.');
        return;
      }
      if (protection.securityConfig.require_camera && !cameraOk) {
        setSetupError('Camera permission is required for this online exam.');
        return;
      }
      if (protection.securityConfig.require_fullscreen && !fullscreenOk) {
        setSetupError('Fullscreen mode is required for this online exam.');
        return;
      }

      onReady();
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6fbf9] text-gray-900">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#166D70]/15 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#166D70] shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            Online Exam Security Check
          </div>
          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">
            Prepare Your Secure Exam Workspace
          </h1>
          <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-gray-600">
            {examName || 'Your online exam'} uses browser-level monitoring to keep the session focused. Camera preview stays local to your browser and is not recorded.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <StatusPill ok={browserOk} label="Browser supported" detail="Fullscreen and camera APIs available" />
            <StatusPill ok={internetOk} label="Internet detected" detail={internetOk ? 'Connection is currently online' : 'Reconnect before beginning'} />
            <StatusPill ok={!protection.securityConfig.require_camera || protection.isCameraActive} label="Camera permission" detail={protection.isCameraActive ? 'Camera preview active' : 'Permission required'} />
            <StatusPill ok={!protection.securityConfig.require_fullscreen || protection.isFullscreen} label="Fullscreen mode" detail={protection.isFullscreen ? 'Fullscreen enabled' : 'Will start when you begin'} />
          </div>

          {setupError && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-semibold">{setupError}</p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={beginSecureExam}
              disabled={starting || !browserOk || !internetOk}
              className="inline-flex items-center gap-2 rounded-xl bg-[#166D70] px-7 py-3 text-xs font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-[#166D70]/20 transition hover:bg-[#125b5e] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {starting ? <Loader className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Begin Secure Exam
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-gray-600 transition hover:border-[#166D70]/30 hover:text-[#166D70]"
            >
              Back
            </button>
          </div>
        </section>

        <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xl shadow-gray-200/50">
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-950">
            {protection.stream ? (
              <video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full object-cover" />
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-3 text-gray-400">
                <Camera className="h-10 w-10" />
                <p className="text-sm font-bold">Camera preview will appear here</p>
              </div>
            )}
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
              <Camera className="h-5 w-5 text-[#166D70]" />
              <div>
                <p className="text-sm font-black">Camera stays local</p>
                <p className="text-xs font-medium text-gray-500">No video, audio, or screenshots are uploaded.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
              <MonitorCheck className="h-5 w-5 text-[#166D70]" />
              <div>
                <p className="text-sm font-black">Stay in fullscreen</p>
                <p className="text-xs font-medium text-gray-500">Leaving fullscreen or switching tabs creates warnings.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
              <Wifi className="h-5 w-5 text-[#166D70]" />
              <div>
                <p className="text-sm font-black">Autosave continues</p>
                <p className="text-xs font-medium text-gray-500">If internet drops, keep working and sync will retry.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default OnlineExamSecurityCheck;
