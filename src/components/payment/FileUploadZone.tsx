/**
 * File Upload Zone - Phase 6
 * Drag-and-drop file upload component with preview and validation
 */

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  X, 
  FileImage, 
  AlertCircle, 
  CheckCircle,
  Image as ImageIcon
} from "lucide-react";

interface FileUploadZoneProps {
  onFileSelect: (file: File | null) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in bytes
  multiple?: boolean;
  className?: string;
}

export function FileUploadZone({
  onFileSelect,
  acceptedFileTypes = ["image/*"],
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  multiple = false,
  className = ""
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (acceptedFileTypes.length > 0) {
      const isValidType = acceptedFileTypes.some(type => {
        if (type.endsWith("/*")) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });
      
      if (!isValidType) {
        return `File type not supported. Accepted types: ${acceptedFileTypes.join(", ")}`;
      }
    }

    // Check file size
    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(1);
      return `File size too large. Maximum size: ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      setUploadedFile(null);
      onFileSelect(null);
      return;
    }

    setError(null);
    setUploadedFile(file);
    onFileSelect(file);
  }, [acceptedFileTypes, maxFileSize, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setError(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="w-8 h-8 text-blue-500" />;
    }
    return <FileImage className="w-8 h-8 text-gray-500" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      <Card
        className={`relative overflow-hidden transition-all duration-300 ${
          isDragOver 
            ? "border-purple-500 bg-purple-50 scale-105" 
            : "border-gray-200 hover:border-gray-300"
        } ${error ? "border-red-300 bg-red-50" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            {/* Upload Icon */}
            <motion.div
              animate={{ 
                scale: isDragOver ? 1.1 : 1,
                rotate: isDragOver ? 5 : 0
              }}
              transition={{ duration: 0.2 }}
              className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <Upload className="w-8 h-8 text-gray-600" />
            </motion.div>

            {/* Upload Text */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isDragOver ? "Drop your file here" : "Upload Transaction Screenshot"}
              </h3>
              <p className="text-gray-600 mb-4">
                Drag and drop your file here, or click to browse
              </p>
            </div>

            {/* Upload Button */}
            <Button
              variant="outline"
              onClick={handleClick}
              className="px-6"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>

            {/* File Requirements */}
            <div className="text-sm text-gray-500 space-y-1">
              <p>Accepted formats: JPG, PNG, GIF</p>
              <p>Maximum size: {formatFileSize(maxFileSize)}</p>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFileTypes.join(",")}
            multiple={multiple}
            onChange={handleFileInputChange}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-800">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded File Preview */}
      <AnimatePresence>
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {getFileIcon(uploadedFile)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 truncate">
                        {uploadedFile.name}
                      </h4>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview */}
      <AnimatePresence>
        {uploadedFile && uploadedFile.type.startsWith("image/") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative"
          >
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <img
                    src={URL.createObjectURL(uploadedFile)}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-white/90 text-gray-800">
                      Preview
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}