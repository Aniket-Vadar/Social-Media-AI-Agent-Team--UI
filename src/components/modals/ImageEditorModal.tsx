'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Sparkles,
  RotateCcw,
  Undo2,
  Crop,
  Sliders,
  Type,
  Wand2,
  Check,
  Layers,
  SunMedium,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Palette,
  Eye,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Plus,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { backendApi } from '@/lib/api/backend';

export const ImageEditorModal: React.FC = () => {
  const {
    isImageEditorOpen,
    setIsImageEditorOpen,
    editingImage,
    setEditingImage,
    selectedPostForDetail,
    setSelectedPostForDetail,
    updatePost,
    posts,
    showSuccess,
  } = useApp();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active loaded image element in React state so renders are 100% reactive
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'magic' | 'crop' | 'adjust' | 'text'>('magic');

  // Upscale & Resolution State
  const [upscaleFactor, setUpscaleFactor] = useState<1 | 2 | 4>(1);
  const [resolution, setResolution] = useState<{ width: number; height: number }>({ width: 1080, height: 1080 });

  // Crop & Aspect Ratio State
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '9:16' | '16:9' | 'orig'>('1:1');
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPanX, setCropPanX] = useState(0);
  const [cropPanY, setCropPanY] = useState(0);

  // Adjustments State
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [warmth, setWarmth] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [vignette, setVignette] = useState(0);

  // Active Filter / Effect
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Text Overlay State
  const [overlayText, setOverlayText] = useState('');
  const [textPosition, setTextPosition] = useState<'top' | 'center' | 'bottom'>('bottom');
  const [textSize, setTextSize] = useState(36);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textBg, setTextBg] = useState(true);
  const [fontFamily, setFontFamily] = useState('system-ui, -apple-system, sans-serif');

  // Interactive Viewport Zoom
  const [viewportZoom, setViewportZoom] = useState(1);

  // History for Undo
  const [history, setHistory] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Sample Presets for instant 1-click photo testing
  const samplePresets = [
    { name: 'Artisan Coffee', url: '/images/coffee-latte.jpg' },
    { name: 'Creative Workspace', url: '/images/coffee-work.jpg' },
    {
      name: 'Mobile & Tech',
      url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1080&auto=format&fit=crop&q=85',
    },
    {
      name: 'Modern Office',
      url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1080&auto=format&fit=crop&q=85',
    },
    {
      name: 'Curated Fashion',
      url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1080&auto=format&fit=crop&q=85',
    },
  ];

  // Helper: Fast 3x3 convolution sharpening filter applied to raw image data
  const applySharpenFilter = (ctx: CanvasRenderingContext2D, width: number, height: number, strength: number) => {
    if (strength <= 0) return;
    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      const pixels = imgData.data;
      const output = ctx.createImageData(width, height);
      const outData = output.data;

      const w = 0.22 * (strength / 100);
      const center = 1 + 4 * w;

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;
          for (let c = 0; c < 3; c++) {
            const val =
              pixels[idx + c] * center -
              (pixels[((y - 1) * width + x) * 4 + c] +
                pixels[((y + 1) * width + x) * 4 + c] +
                pixels[(y * width + (x - 1)) * 4 + c] +
                pixels[(y * width + (x + 1)) * 4 + c]) *
                w;
            outData[idx + c] = Math.min(255, Math.max(0, val));
          }
          outData[idx + 3] = pixels[idx + 3];
        }
      }
      ctx.putImageData(output, 0, 0);
    } catch {
      // Graceful fallback if security sandbox isolates pixel data
    }
  };

  // Helper: Draw rounded rect banner
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // 2. Render Pipeline onto Canvas
  const renderCanvas = useCallback(
    (explicitImg?: HTMLImageElement | null) => {
      const canvas = canvasRef.current;
      const img = explicitImg || imageElement;
      if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Determine target canvas dimensions based on aspect ratio & upscale factor
      let baseW = 1080;
      let baseH = 1080;

      if (aspectRatio === '1:1') {
        baseW = 1080;
        baseH = 1080;
      } else if (aspectRatio === '4:5') {
        baseW = 1080;
        baseH = 1350;
      } else if (aspectRatio === '9:16') {
        baseW = 1080;
        baseH = 1920;
      } else if (aspectRatio === '16:9') {
        baseW = 1920;
        baseH = 1080;
      } else if (aspectRatio === 'orig') {
        baseW = img.naturalWidth || 1080;
        baseH = img.naturalHeight || 1080;
      }

      const targetW = baseW * upscaleFactor;
      const targetH = baseH * upscaleFactor;

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      setResolution({ width: targetW, height: targetH });

      // Enable high-quality smoothing for upscaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Clear canvas
      ctx.clearRect(0, 0, targetW, targetH);

      // Apply color adjustments via ctx.filter
      let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      if (warmth > 0) {
        filterString += ` sepia(${warmth * 0.5}%)`;
      } else if (warmth < 0) {
        filterString += ` hue-rotate(${warmth * 0.4}deg)`;
      }
      ctx.filter = filterString;

      // Calculate crop cover scaling
      const imgW = img.naturalWidth || 800;
      const imgH = img.naturalHeight || 800;
      const imgAspect = imgW / imgH;
      const canvasAspect = targetW / targetH;

      let drawW: number;
      let drawH: number;

      if (imgAspect > canvasAspect) {
        drawH = targetH * cropZoom;
        drawW = drawH * imgAspect;
      } else {
        drawW = targetW * cropZoom;
        drawH = drawW / imgAspect;
      }

      // Centered position with pan offset
      const offsetX = (cropPanX / 100) * targetW;
      const offsetY = (cropPanY / 100) * targetH;
      const drawX = (targetW - drawW) / 2 + offsetX;
      const drawY = (targetH - drawH) / 2 + offsetY;

      // Draw Image
      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Reset filter
      ctx.filter = 'none';

      // Apply Client-Side Sharpening for Upscaling or manual Sharpness
      const totalSharpen = (upscaleFactor > 1 ? 40 : 0) + sharpness;
      if (totalSharpen > 0) {
        applySharpenFilter(ctx, targetW, targetH, Math.min(100, totalSharpen));
      }

      // Apply Vignette / Studio Shadow
      if (vignette > 0) {
        const radius = Math.sqrt(Math.pow(targetW / 2, 2) + Math.pow(targetH / 2, 2));
        const grad = ctx.createRadialGradient(
          targetW / 2,
          targetH / 2,
          radius * 0.35,
          targetW / 2,
          targetH / 2,
          radius
        );
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, `rgba(0,0,0,${(vignette / 100) * 0.78})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, targetW, targetH);
      }

      // Apply Text Overlay if provided
      if (overlayText.trim()) {
        const scaledSize = Math.round(textSize * (targetW / 700));
        ctx.font = `bold ${scaledSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let textY = targetH / 2;
        if (textPosition === 'top') textY = targetH * 0.16;
        if (textPosition === 'bottom') textY = targetH * 0.84;

        const metrics = ctx.measureText(overlayText);
        const paddingX = scaledSize * 0.6;
        const paddingY = scaledSize * 0.35;
        const bannerW = metrics.width + paddingX * 2;
        const bannerH = scaledSize + paddingY * 2;
        const bannerX = targetW / 2 - bannerW / 2;
        const bannerY = textY - bannerH / 2;

        if (textBg) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
          drawRoundedRect(ctx, bannerX, bannerY, bannerW, bannerH, scaledSize * 0.3);
          ctx.fill();
        } else {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = scaledSize * 0.25;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 2;
        }

        ctx.fillStyle = textColor;
        ctx.fillText(overlayText, targetW / 2, textY);

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }
    },
    [
      imageElement,
      aspectRatio,
      upscaleFactor,
      cropZoom,
      cropPanX,
      cropPanY,
      brightness,
      contrast,
      saturation,
      warmth,
      sharpness,
      vignette,
      overlayText,
      textPosition,
      textSize,
      textColor,
      textBg,
      fontFamily,
    ]
  );

  // 1. Reactive Image Loader: ensures image is loaded and drawn immediately
  useEffect(() => {
    if (!isImageEditorOpen) return;

    const sourceSrc = editingImage || '/images/coffee-latte.jpg';
    setImageLoadError(false);

    const isDataUrl = sourceSrc.startsWith('data:');
    const img = new window.Image();

    // Data URLs do not need crossOrigin; remote URLs try anonymous first
    if (!isDataUrl && !sourceSrc.startsWith('/')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      setImageElement(img);
      setResolution({ width: img.naturalWidth || 1080, height: img.naturalHeight || 1080 });
      setHistory([sourceSrc]);
      // Explicit immediate draw onto canvas
      renderCanvas(img);
    };

    img.onerror = () => {
      // Fallback: try loading without crossOrigin in case host blocked CORS header
      const fallback = new window.Image();
      fallback.onload = () => {
        setImageElement(fallback);
        setResolution({ width: fallback.naturalWidth || 1080, height: fallback.naturalHeight || 1080 });
        setHistory([sourceSrc]);
        renderCanvas(fallback);
      };
      fallback.onerror = () => {
        setImageLoadError(true);
      };
      fallback.src = sourceSrc;
    };

    img.src = sourceSrc;
  }, [isImageEditorOpen, editingImage, renderCanvas]);

  // Trigger render on any adjustment/crop state change
  useEffect(() => {
    if (imageElement) {
      renderCanvas(imageElement);
    }
  }, [renderCanvas, imageElement]);

  // Handle User File Upload from Computer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setEditingImage(dataUrl);
        showSuccess('Custom image loaded into studio!');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle Drag and Drop Image Upload
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => {
        const dataUrl = ev.target?.result as string;
        if (dataUrl) {
          setEditingImage(dataUrl);
          showSuccess('Image dropped into studio!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isImageEditorOpen) return null;

  // Snapshot to history
  const pushHistorySnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setHistory(prev => [...prev.slice(-8), dataUrl]);
    } catch {
      // Ignored
    }
  };

  // One-Click AI Magic Presets
  const applyPreset = (presetName: string) => {
    setIsProcessing(true);
    setStatusMessage(`Applying ${presetName}...`);

    setTimeout(() => {
      pushHistorySnapshot();

      if (presetName === 'upscale-2x') {
        setUpscaleFactor(2);
        setSharpness(35);
        setActiveFilter('2x HD Upscale');
      } else if (presetName === 'upscale-4x') {
        setUpscaleFactor(4);
        setSharpness(50);
        setActiveFilter('4x Ultra Upscale');
      } else if (presetName === 'cutout') {
        setVignette(70);
        setContrast(120);
        setSaturation(115);
        setActiveFilter('Studio Focus + Vignette');
      } else if (presetName === 'warm') {
        setWarmth(35);
        setBrightness(105);
        setSaturation(120);
        setActiveFilter('Warm Golden Hour');
      } else if (presetName === 'pop') {
        setContrast(125);
        setSaturation(145);
        setSharpness(40);
        setActiveFilter('Vibrant Pop');
      } else if (presetName === 'noir') {
        setSaturation(0);
        setContrast(140);
        setBrightness(95);
        setVignette(45);
        setActiveFilter('Monochrome Noir');
      }

      setIsProcessing(false);
      setStatusMessage(null);
    }, 280);
  };

  // Undo
  const handleUndo = () => {
    if (history.length <= 1) {
      handleReset();
      return;
    }
    const prev = history[history.length - 2];
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageElement(img);
      setHistory(old => old.slice(0, -1));
      renderCanvas(img);
    };
    img.src = prev;
  };

  // Reset
  const handleReset = () => {
    setUpscaleFactor(1);
    setAspectRatio('1:1');
    setCropZoom(1);
    setCropPanX(0);
    setCropPanY(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setWarmth(0);
    setSharpness(0);
    setVignette(0);
    setActiveFilter(null);
    setOverlayText('');
    setViewportZoom(1);

    if (editingImage) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImageElement(img);
        renderCanvas(img);
      };
      img.src = editingImage;
    }
  };

  // Save Image (Export canvas to JPEG data URL and update active post)
  const handleSaveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
      setEditingImage(dataUrl);

      // Update post in context
      if (selectedPostForDetail) {
        updatePost(selectedPostForDetail.id, { mediaUrl: dataUrl });
        setSelectedPostForDetail({
          ...selectedPostForDetail,
          mediaUrl: dataUrl,
        });
      } else {
        // Find matching post by editingImage
        const matched = posts.find(p => p.mediaUrl === editingImage);
        if (matched) {
          updatePost(matched.id, { mediaUrl: dataUrl });
        }
      }

      // Persist to ImageKit CDN in the background
      const targetId = selectedPostForDetail?.id || posts.find(p => p.mediaUrl === editingImage)?.id;
      backendApi
        .uploadImage({
          file_or_url: dataUrl,
          file_name: `edited_post_${Date.now()}.jpg`,
          folder: '/socialix/user_edits',
          tags: ['socialix', 'editor'],
        })
        .then(res => {
          if (res?.url && targetId) {
            updatePost(targetId, { mediaUrl: res.url });
          }
        })
        .catch(err => console.warn('ImageKit upload error on edit save:', err));

      showSuccess('Transformed image saved and updated on post!');
      setIsImageEditorOpen(false);
    } catch (e) {
      console.error('Failed to export canvas image:', e);
      setIsImageEditorOpen(false);
    }
  };

  // Direct download to user machine
  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.download = `socialix-image-${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
      showSuccess('Image downloaded to your computer!');
    } catch (e) {
      console.error('Download error:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Hidden File Input for uploading custom images */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900">AI Image Studio</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                  Client-Side UI Engine
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Super-upscaling, smart aspect ratio crops, live grading & custom text overlay
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Upload Custom Image Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-purple-600" />
              <span>Upload Image</span>
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownloadImage}
              title="Download image file to computer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>Download</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => setIsImageEditorOpen(false)}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editor Body: Left Canvas Workspace (62%) + Right Controls (38%) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-[500px]">
          {/* Canvas Workspace Area */}
          <div
            ref={containerRef}
            onDragOver={e => {
              e.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            className={`md:col-span-7 p-6 flex flex-col items-center justify-center relative overflow-hidden select-none transition-colors ${
              isDraggingOver ? 'bg-slate-800 ring-2 ring-purple-400 ring-inset' : 'bg-slate-900'
            }`}
            style={{
              backgroundImage:
                'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}
          >
            {/* Top Canvas Controls Bar */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <button
                onClick={handleUndo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md shadow-md border border-gray-200/50 text-xs font-semibold text-gray-700 hover:bg-white transition-all active:scale-95"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md shadow-md border border-gray-200/50 text-xs font-semibold text-gray-700 hover:bg-white transition-all active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md shadow-md border border-gray-200/50 text-xs font-semibold text-purple-700 hover:bg-white transition-all active:scale-95"
              >
                <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                <span>Change Image</span>
              </button>
            </div>

            {/* Top Right Viewport Zoom Controls */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-xl text-white border border-white/10 text-xs">
              <button
                onClick={() => setViewportZoom(prev => Math.max(0.5, prev - 0.15))}
                title="Zoom Out Preview"
                className="p-1 hover:text-purple-300"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-semibold w-11 text-center">
                {Math.round(viewportZoom * 100)}%
              </span>
              <button
                onClick={() => setViewportZoom(prev => Math.min(1.8, prev + 0.15))}
                title="Zoom In Preview"
                className="p-1 hover:text-purple-300"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewportZoom(1)}
                title="Reset Viewport"
                className="p-1 hover:text-purple-300 ml-1 border-l border-white/15 pl-1.5"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>

            {/* Bottom Resolution & Status Pill */}
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-medium border border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {resolution.width} × {resolution.height} px
                </span>
                {upscaleFactor > 1 && (
                  <span className="bg-purple-500/80 text-white font-bold px-1.5 py-0.5 rounded-full text-[9px]">
                    {upscaleFactor}x HD
                  </span>
                )}
                {activeFilter && (
                  <span className="text-purple-300 text-[10px]">• {activeFilter}</span>
                )}
              </div>
            </div>

            {/* Canvas Work Area */}
            <div
              className="relative max-w-full max-h-[460px] flex items-center justify-center transition-transform duration-150 shadow-2xl rounded-2xl overflow-hidden"
              style={{
                transform: `scale(${viewportZoom})`,
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
                backgroundImage:
                  'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                backgroundColor: '#0f172a',
              }}
            >
              <canvas
                ref={canvasRef}
                className="max-h-[420px] max-w-[420px] object-contain rounded-2xl"
                style={{
                  display: 'block',
                }}
              />

              {/* Empty / Error Fallback Overlay */}
              {imageLoadError && (
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-white space-y-3 z-10">
                  <ImageIcon className="w-10 h-10 text-purple-400" />
                  <div>
                    <h4 className="font-bold text-sm">Image failed to load</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Upload an image from your computer to begin editing
                    </p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
                  >
                    Browse Image
                  </button>
                </div>
              )}

              {/* Processing Spinner Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2.5 z-20">
                  <Sparkles className="w-8 h-8 animate-spin text-amber-300" />
                  <span className="text-xs font-bold tracking-wide">
                    {statusMessage || 'Processing on UI Canvas...'}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Sample Presets Picker */}
            <div className="absolute bottom-4 right-4 z-10 hidden sm:flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-xl border border-white/10">
              <span className="text-[10px] text-gray-400 font-semibold pl-1">Presets:</span>
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setEditingImage(preset.url)}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-semibold text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right Toolbar Panel */}
          <div className="md:col-span-5 border-l border-gray-100 flex flex-col bg-white overflow-y-auto">
            {/* Toolbar Tabs */}
            <div className="grid grid-cols-4 border-b border-gray-100 p-2 text-center text-xs font-semibold text-gray-500 bg-gray-50/50">
              <button
                onClick={() => setActiveTab('magic')}
                className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'magic'
                    ? 'bg-white text-purple-700 font-bold shadow-xs border border-gray-100'
                    : 'hover:bg-gray-100/70 text-gray-600'
                }`}
              >
                <Wand2 className="w-4 h-4 text-purple-600" />
                <span>AI magic</span>
              </button>
              <button
                onClick={() => setActiveTab('crop')}
                className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'crop'
                    ? 'bg-white text-purple-700 font-bold shadow-xs border border-gray-100'
                    : 'hover:bg-gray-100/70 text-gray-600'
                }`}
              >
                <Crop className="w-4 h-4 text-purple-600" />
                <span>Crop</span>
              </button>
              <button
                onClick={() => setActiveTab('adjust')}
                className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'adjust'
                    ? 'bg-white text-purple-700 font-bold shadow-xs border border-gray-100'
                    : 'hover:bg-gray-100/70 text-gray-600'
                }`}
              >
                <Sliders className="w-4 h-4 text-purple-600" />
                <span>Adjust</span>
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'text'
                    ? 'bg-white text-purple-700 font-bold shadow-xs border border-gray-100'
                    : 'hover:bg-gray-100/70 text-gray-600'
                }`}
              >
                <Type className="w-4 h-4 text-purple-600" />
                <span>Text</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5 flex-1 space-y-6 overflow-y-auto">
              {/* TAB 1: AI MAGIC */}
              {activeTab === 'magic' && (
                <div className="space-y-5">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Super Resolution & Upscale
                      </span>
                      <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full">
                        UI Canvas Engine
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => applyPreset('upscale-2x')}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          upscaleFactor === 2
                            ? 'border-purple-600 bg-purple-50/70 text-purple-900 font-bold ring-2 ring-purple-100'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <SunMedium className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <div className="font-bold">2x HD Upscale</div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                          2160×2160 px • Crisp edges & unsharp mask
                        </p>
                      </button>

                      <button
                        onClick={() => applyPreset('upscale-4x')}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          upscaleFactor === 4
                            ? 'border-purple-600 bg-purple-50/70 text-purple-900 font-bold ring-2 ring-purple-100'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <div className="font-bold">4x Ultra HD</div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                          4320×4320 px • Maximum print sharpness
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* One-Click Aesthetic Grades */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      One-Click Color & Focus Grades
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => applyPreset('cutout')}
                        className="p-3 rounded-2xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/40 text-left transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <span className="font-bold text-gray-800">Studio Focus</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Radial vignette + subject contrast</p>
                      </button>

                      <button
                        onClick={() => applyPreset('warm')}
                        className="p-3 rounded-2xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/40 text-left transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <span className="font-bold text-gray-800">Golden Hour</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Warm golden tones & rich glow</p>
                      </button>

                      <button
                        onClick={() => applyPreset('pop')}
                        className="p-3 rounded-2xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/40 text-left transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-pink-500 flex-shrink-0" />
                          <span className="font-bold text-gray-800">Vibrant Pop</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Social feed contrast & saturation</p>
                      </button>

                      <button
                        onClick={() => applyPreset('noir')}
                        className="p-3 rounded-2xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/40 text-left transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-gray-800 flex-shrink-0" />
                          <span className="font-bold text-gray-800">Monochrome Noir</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">High-contrast B&W film grade</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CROP & ASPECT RATIO */}
              {activeTab === 'crop' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Aspect Ratio
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { id: '1:1', label: '1:1 Square', desc: 'Instagram Feed, Square Post' },
                        { id: '4:5', label: '4:5 Portrait', desc: 'Instagram Best Fit (1080×1350)' },
                        { id: '9:16', label: '9:16 Story/Reel', desc: 'TikTok, Reels, Shorts' },
                        { id: '16:9', label: '16:9 Landscape', desc: 'YouTube, Twitter, Landscape' },
                        { id: 'orig', label: 'Original', desc: 'Preserve Natural Bounds' },
                      ].map(r => (
                        <button
                          key={r.id}
                          onClick={() => setAspectRatio(r.id as any)}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            aspectRatio === r.id
                              ? 'border-brand-500 bg-brand-50/50 text-brand-700 font-bold ring-2 ring-brand-100'
                              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-semibold text-gray-900">{r.label}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{r.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Crop Zoom & Framing */}
                  <div className="space-y-4 pt-2 border-t border-gray-100 text-xs">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Framing & Crop Zoom
                    </span>

                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold text-gray-700">
                        <span>Crop Zoom (In/Out)</span>
                        <span>{Math.round(cropZoom * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="2.5"
                        step="0.05"
                        value={cropZoom}
                        onChange={e => setCropZoom(parseFloat(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-gray-700">
                          <span>Pan Horizontal</span>
                          <span>{cropPanX}%</span>
                        </div>
                        <input
                          type="range"
                          min="-40"
                          max="40"
                          value={cropPanX}
                          onChange={e => setCropPanX(Number(e.target.value))}
                          className="w-full accent-brand-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-gray-700">
                          <span>Pan Vertical</span>
                          <span>{cropPanY}%</span>
                        </div>
                        <input
                          type="range"
                          min="-40"
                          max="40"
                          value={cropPanY}
                          onChange={e => setCropPanY(Number(e.target.value))}
                          className="w-full accent-brand-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCropZoom(1);
                        setCropPanX(0);
                        setCropPanY(0);
                      }}
                      className="text-[11px] text-brand-600 font-semibold hover:underline"
                    >
                      Reset crop framing
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: ADJUST */}
              {activeTab === 'adjust' && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold text-gray-700">
                      <span>Brightness</span>
                      <span>{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={brightness}
                      onChange={e => setBrightness(Number(e.target.value))}
                      className="w-full accent-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold text-gray-700">
                      <span>Contrast</span>
                      <span>{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="160"
                      value={contrast}
                      onChange={e => setContrast(Number(e.target.value))}
                      className="w-full accent-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold text-gray-700">
                      <span>Saturation</span>
                      <span>{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={e => setSaturation(Number(e.target.value))}
                      className="w-full accent-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold text-gray-700">
                      <span>Warmth & Tint</span>
                      <span>{warmth > 0 ? `+${warmth}` : warmth}</span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      value={warmth}
                      onChange={e => setWarmth(Number(e.target.value))}
                      className="w-full accent-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold text-gray-700">
                      <span>Sharpness & Edge Clarity</span>
                      <span>{sharpness}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={sharpness}
                      onChange={e => setSharpness(Number(e.target.value))}
                      className="w-full accent-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold text-gray-700">
                      <span>Vignette (Edge Shadow)</span>
                      <span>{vignette}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={vignette}
                      onChange={e => setVignette(Number(e.target.value))}
                      className="w-full accent-brand-500"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: TEXT OVERLAY */}
              {activeTab === 'text' && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-800">Overlay Text Caption</label>
                    <input
                      type="text"
                      value={overlayText}
                      onChange={e => setOverlayText(e.target.value)}
                      placeholder="e.g. Freshly Brewed Artisan Coffee ☕"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setTextPosition('top')}
                      className={`p-2 rounded-xl border text-center font-semibold ${
                        textPosition === 'top'
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      Top
                    </button>
                    <button
                      onClick={() => setTextPosition('center')}
                      className={`p-2 rounded-xl border text-center font-semibold ${
                        textPosition === 'center'
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      Center
                    </button>
                    <button
                      onClick={() => setTextPosition('bottom')}
                      className={`p-2 rounded-xl border text-center font-semibold ${
                        textPosition === 'bottom'
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      Bottom
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold text-gray-700">
                      <span>Font Size</span>
                      <span>{textSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="64"
                      value={textSize}
                      onChange={e => setTextSize(Number(e.target.value))}
                      className="w-full accent-brand-500"
                    />
                  </div>

                  {/* Text Color Choices */}
                  <div className="space-y-1.5">
                    <span className="font-semibold text-gray-700">Text Color</span>
                    <div className="flex items-center gap-2">
                      {[
                        { color: '#FFFFFF', label: 'White' },
                        { color: '#FACC15', label: 'Gold' },
                        { color: '#F43F5E', label: 'Rose' },
                        { color: '#38BDF8', label: 'Cyan' },
                        { color: '#0F172A', label: 'Black' },
                      ].map(c => (
                        <button
                          key={c.color}
                          onClick={() => setTextColor(c.color)}
                          style={{ backgroundColor: c.color }}
                          className={`w-7 h-7 rounded-full border border-gray-300 shadow-xs flex items-center justify-center transition-transform ${
                            textColor === c.color ? 'scale-115 ring-2 ring-brand-500' : 'hover:scale-105'
                          }`}
                        >
                          {textColor === c.color && (
                            <Check
                              className={`w-3.5 h-3.5 ${
                                c.color === '#FFFFFF' || c.color === '#FACC15' ? 'text-gray-900' : 'text-white'
                              }`}
                            />
                          )}
                        </button>
                      ))}

                      <label className="flex items-center gap-1.5 ml-auto text-xs text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={textBg}
                          onChange={e => setTextBg(e.target.checked)}
                          className="rounded text-brand-500 accent-brand-500"
                        />
                        <span>Banner pill</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white select-none">
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              All edits rendered instantly in-browser. Saved directly to your scheduled post.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsImageEditorOpen(false)}
              className="px-4 py-2 rounded-xl text-gray-600 hover:text-gray-900 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveImage}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-md shadow-indigo-200 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Save image to post</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
