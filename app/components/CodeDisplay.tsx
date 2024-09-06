import React from "react";

interface CodeDisplayProps {
  inputCode: string;
  outputCode: string;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ inputCode, outputCode }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen  text-white">
      <div className="flex space-x-4 w-full max-w-6xl">
        <div className="w-1/2 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Input</h2>
          <pre className="bg-gray-700 p-4 rounded-lg overflow-auto">
            <code className="language-json">{inputCode}</code>
          </pre>
        </div>
        <div className="w-1/2 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Output</h2>
          <pre className="bg-gray-700 p-4 rounded-lg overflow-auto">
            <code className="language-json">{outputCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeDisplay;
