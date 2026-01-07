import { useState } from "react";
import { RefreshCw, ZoomIn, ZoomOut } from "lucide-react";
import { getSafeImageUrl } from "../../../../../lib/utils";
import { PageViewError } from "./PageViewError";

export const PageViewer = ({
  url,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  zoomLevel,
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    console.error("Failed to load image:", url);
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const safeUrl = getSafeImageUrl ? getSafeImageUrl(url) : url;

  if (error) {
    return <PageViewError url={url} />;
  }

  return (
    <div className="relative flex items-center justify-center h-full w-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-80 z-10">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-4"></div>
            <p className="text-white">Loading image...</p>
          </div>
        </div>
      )}
      <div
        className="transition-transform duration-300 ease-out max-h-[80vh] flex items-center justify-center"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <img
          src={safeUrl}
          alt="Student Answer Sheet"
          className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-lg"
          onError={handleError}
          onLoad={handleLoad}
        />
      </div>

      <div className="absolute bottom-6 right-6 flex bg-gray-900 bg-opacity-80 p-2 rounded-full shadow-xl">
        <button
          onClick={onZoomOut}
          className="p-2 text-gray-200 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
          title="Zoom out"
          disabled={zoomLevel <= 0.5}
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={onZoomReset}
          className="p-2 text-gray-200 hover:text-white hover:bg-gray-700 rounded-full transition-colors mx-1"
          title="Reset zoom"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
        <button
          onClick={onZoomIn}
          className="p-2 text-gray-200 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
          title="Zoom in"
          disabled={zoomLevel >= 3}
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};