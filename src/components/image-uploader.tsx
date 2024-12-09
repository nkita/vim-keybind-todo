import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
    onUpload: (file: File) => Promise<void>;
    maxSizeMB?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
    onUpload,
    maxSizeMB = 5
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        processFile(file);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files?.[0];
        processFile(file);
    };

    const processFile = (file?: File) => {
        // Reset previous states
        setError(null);
        setSelectedFile(null);
        setPreviewUrl(null);

        if (!file) return;

        // Check file size
        const fileSizeMB = file.size / 1024 / 1024;
        if (fileSizeMB > maxSizeMB) {
            setError(`File is too large. Maximum size is ${maxSizeMB}MB.`);
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload a valid image file.');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setError(null);

        try {
            await onUpload(selectedFile);
            // Reset after successful upload
            setSelectedFile(null);
            setPreviewUrl(null);
        } catch (err) {
            setError('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            className="w-full max-w-md mx-auto p-6 border-2 border-dashed rounded-lg text-center"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />

            {previewUrl ? (
                <div className="mb-4">
                    <Image
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full max-h-64 mx-auto rounded-lg object-contain"
                    />
                </div>
            ) : (
                <div className="mb-4 text-gray-500">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p>Drag and drop an image here</p>
                    <p className="text-sm">or</p>
                </div>
            )}

            {error && (
                <div className="text-red-500 mb-4">
                    {error}
                </div>
            )}

            <div className="flex gap-2 justify-center">
                <Button
                    variant="outline"
                    onClick={triggerFileInput}
                    disabled={isUploading}
                >
                    <Upload className="mr-2 h-4 w-4" /> Select Image
                </Button>

                {selectedFile && (
                    <Button
                        onClick={handleUpload}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            'Upload'
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
};

// Example usage component
const ImageUploaderPage: React.FC = () => {
    const handleUpload = async (file: File) => {
        // Simulated API upload
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            console.log('Upload successful', result);
        } catch (error) {
            console.error('Upload error', error);
            throw error;
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Image Uploader</h1>
            <ImageUploader
                onUpload={handleUpload}
                maxSizeMB={10}
            />
        </div>
    );
};

export default ImageUploaderPage;