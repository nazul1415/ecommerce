import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';

interface CSVUploaderProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
}

export const CSVUploader: React.FC<CSVUploaderProps> = ({ onFileSelect, isUploading }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate if file is CSV
  const validateAndProcessFile = (file: File) => {
    setError(null);
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension !== 'csv') {
      setError('Invalid file format. Please select an active file with a .csv extension.');
      return;
    }

    onFileSelect(file);
  };

  // Drag over handler
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  // Drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Manual select handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Local validation error banner */}
      {error && (
        <div className="mb-4 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md flex items-start space-x-3 transition">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700 font-medium">{error}</div>
        </div>
      )}

      {/* Drag & Drop container */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[250px]
          ${isDragActive 
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' 
            : 'border-gray-300 hover:border-indigo-400 bg-white hover:bg-gray-50/50'
          }
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv"
          onChange={handleChange}
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600"></div>
              <FileText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-800">Processing CSV file...</p>
              <p className="text-xs text-gray-500 mt-1">This may take a moment. Please do not close or refresh this page.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full">
              <UploadCloud className="h-10 w-10 animate-pulse" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-800">
                Drag and drop your <span className="text-indigo-600 font-bold">.csv</span> file here
              </p>
              <p className="text-xs text-gray-400 mt-1.5">
                Or click to browse files on your device
              </p>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                Structured CSV catalog files only
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSVUploader;
