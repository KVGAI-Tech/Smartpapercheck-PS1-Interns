import { AlertCircle, ExternalLink } from "lucide-react";

export function PageViewError({ url }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-800 text-white p-6 text-center">
      <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
      <h3 className="text-xl font-semibold mb-2">Unable to load image</h3>
      <p className="text-gray-300 mb-6 max-w-md">
        The image could not be loaded due to access restrictions or CORS policy.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
      >
        <ExternalLink className="w-4 h-4" />
        <span>Open in new window</span>
      </a>
    </div>
  );
}
