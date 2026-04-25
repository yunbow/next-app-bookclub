"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Loader2 } from "lucide-react";
import Image from "next/image";

type Props = {
  onUpload: (file: File) => Promise<string>;
  onRemove?: (url: string) => void;
  maxImages?: number;
  currentImages?: string[];
  disabled?: boolean;
};

export function ImageUploader({
  onUpload,
  onRemove,
  maxImages = 5,
  currentImages = [],
  disabled = false,
}: Props) {
  const [images, setImages] = useState<string[]>(currentImages);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > maxImages) {
      alert(`最大${maxImages}枚まで画像をアップロードできます`);
      return;
    }

    setIsUploading(true);

    for (const file of files) {
      try {
        const url = await onUpload(file);
        setImages((prev) => [...prev, url]);
      } catch (error) {
        console.error("画像のアップロードに失敗しました:", error);
      }
    }

    setIsUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (url: string) => {
    setImages((prev) => prev.filter((img) => img !== url));
    onRemove?.(url);
  };

  return (
    <div className="space-y-4">
      {(images.length > 0 || isUploading) && (
        <div className="grid grid-cols-2 gap-2">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <Image
                src={url}
                alt={`アップロード画像 ${index + 1}`}
                width={200}
                height={200}
                className="rounded-lg object-cover w-full h-32"
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 disabled:opacity-50"
                aria-label="画像を削除"
                disabled={isUploading || disabled}
              >
                <X className="h-4 w-4 text-white" aria-hidden="true" />
              </button>
            </div>
          ))}
          {isUploading && (
            <div className="relative flex items-center justify-center bg-muted rounded-lg h-32">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
                <span className="text-sm">アップロード中...</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isUploading || images.length >= maxImages}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading || images.length >= maxImages}
          title={
            images.length >= maxImages
              ? `最大${maxImages}枚まで`
              : isUploading
                ? "アップロード中..."
                : undefined
          }
        >
          <ImagePlus className="h-4 w-4 mr-2" />
          画像を追加
        </Button>
        {images.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {images.length}/{maxImages}
          </span>
        )}
      </div>
    </div>
  );
}
