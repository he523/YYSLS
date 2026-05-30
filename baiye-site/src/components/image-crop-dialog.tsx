"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Cropper, { type Area } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ============================================
// 类型
// ============================================

export interface ImageCropDialogProps {
  /** 原始图片文件 */
  file: File | null;
  /** 裁剪纵横比，默认 3/4（竖版卡牌比例） */
  aspect?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 确认裁剪后的回调，传出裁剪后的 File */
  onCropComplete: (croppedFile: File) => void;
}

// ============================================
// 辅助函数
// ============================================

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  originalFile: File,
): Promise<File> {
  const image = await createImage(imageSrc);
  const { naturalWidth: iw, naturalHeight: ih } = image;

  // 取整并 clamp 到原图范围内，防止浮点数或越界导致 Canvas 绘制失败
  const sx = Math.max(0, Math.round(pixelCrop.x));
  const sy = Math.max(0, Math.round(pixelCrop.y));
  const sw = Math.min(iw - sx, Math.round(pixelCrop.width));
  const sh = Math.min(ih - sy, Math.round(pixelCrop.height));

  if (sw <= 0 || sh <= 0) {
    throw new Error("裁剪区域无效，请拖拽图片调整");
  }

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法获取 2D 上下文");

  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);

  const ext = originalFile.name.split(".").pop()?.toLowerCase() || "jpg";
  const mimeType = originalFile.type || "image/jpeg";

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas 导出失败，请重试"));
          return;
        }
        const croppedFile = new File([blob], `donggua.${ext}`, {
          type: mimeType,
          lastModified: Date.now(),
        });
        resolve(croppedFile);
      },
      mimeType,
      0.92,
    );
  });
}

// ============================================
// 组件
// ============================================

export function ImageCropDialog({
  file,
  aspect = 3 / 4,
  open,
  onOpenChange,
  onCropComplete,
}: ImageCropDialogProps) {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const cropContainerRef = useRef<HTMLDivElement>(null);

  // 阻止滚轮事件冒泡到页面，防止裁剪缩放时后方页面滚动
  useEffect(() => {
    const el = cropContainerRef.current;
    if (!el || !open) return;

    const preventScroll = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    el.addEventListener("wheel", preventScroll, { passive: false });
    return () => el.removeEventListener("wheel", preventScroll);
  }, [open]);

  // 文件变化时创建 Object URL
  useEffect(() => {
    if (file && open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setMediaLoaded(false);
      const url = URL.createObjectURL(file);
      setImgSrc(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    if (!open) {
      setImgSrc("");
    }
  }, [file, open]);

  const onCropCompleteHandler = useCallback(
    (_croppedAreaPercentages: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleConfirm = useCallback(async () => {
    if (!croppedAreaPixels || !file) return;

    setProcessing(true);
    try {
      const croppedFile = await getCroppedImg(imgSrc, croppedAreaPixels, file);
      onCropComplete(croppedFile);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "裁剪失败，请重试");
    } finally {
      setProcessing(false);
    }
  }, [imgSrc, croppedAreaPixels, file, onCropComplete, onOpenChange]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>裁剪少冬瓜图片</DialogTitle>
          <DialogDescription>
            拖拽图片调整显示区域，滚动滚轮缩放
          </DialogDescription>
        </DialogHeader>

        {/* 裁剪区域：固定高度，切勿加 overflow-hidden（会裁剪掉裁剪框线条） */}
        <div
          ref={cropContainerRef}
          className="relative w-full shrink-0 rounded-md bg-[#1a1a2e]"
          style={{ height: "420px" }}
        >
          {imgSrc && (
            <Cropper
              image={imgSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropCompleteHandler}
              onMediaLoaded={() => setMediaLoaded(true)}
              cropShape="rect"
              showGrid
              restrictPosition
              zoomWithScroll
            />
          )}
        </div>

        <DialogFooter className="shrink-0 pt-3">
          <Button variant="outline" onClick={handleCancel} disabled={processing}>
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!mediaLoaded || !croppedAreaPixels || processing}
          >
            {processing ? "处理中..." : "确认裁剪"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
