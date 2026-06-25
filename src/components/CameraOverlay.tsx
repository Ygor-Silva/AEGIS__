import React, { useRef, useState, useEffect } from "react";
import { Camera, X, Check } from "lucide-react";
import { emitToast } from "./Toast";

interface CameraOverlayProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

export default function CameraOverlay({ onCapture, onClose }: CameraOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error("Error accessing camera:", err);
        emitToast("Falha ao acessar câmera: Dispositivo não encontrado", "error");
        onClose();
      }
    }
    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
  };

  const confirm = () => {
    if (capturedImage) {
      emitToast("Comprovante processado com sucesso", "success");
      onCapture(capturedImage);
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center border-4 border-[#00ffc2]/50 backdrop-blur-sm p-4">
      <div className="flex justify-between items-center w-full max-w-md mb-4">
        <div className="text-[10px] font-bold tracking-widest text-[#00ffc2] uppercase">
          AEGIS // CAMERA SCANNER
        </div>
        <button
          onClick={onClose}
          className="p-2 text-red-500 hover:bg-red-500/20 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative w-full max-w-md aspect-[3/4] bg-black border border-[#00ffc2]/30 flex flex-col items-center justify-center overflow-hidden">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Scanner overlay effect */}
            <div className="absolute inset-0 pointer-events-none border-[20px] border-black/50"></div>
            <div className="absolute inset-0 border-2 border-[#00ffc2]/50 m-8 pointer-events-none">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00ffc2] -mt-0.5 -ml-0.5"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00ffc2] -mt-0.5 -mr-0.5"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00ffc2] -mb-0.5 -ml-0.5"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00ffc2] -mb-0.5 -mr-0.5"></div>
            </div>
            <div className="absolute w-full h-1 bg-[#00ffc2] shadow-[0_0_15px_#00ffc2,0_0_30px_#00ffc2] animate-[scan_2s_ease-in-out_infinite] z-10 flex flex-col pointer-events-none">
              <div className="w-full h-16 bg-gradient-to-t from-[#00ffc2]/40 to-transparent -mt-16"></div>
            </div>
          </>
        ) : (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="mt-8 flex space-x-6">
        {!capturedImage ? (
          <button
            onClick={takePhoto}
            className="w-16 h-16 rounded-full border-2 border-[#00ffc2] flex items-center justify-center hover:bg-[#00ffc2]/20 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-[#00ffc2] opacity-50 flex items-center justify-center">
              <Camera size={24} className="text-black" />
            </div>
          </button>
        ) : (
          <>
            <button
              onClick={retake}
              className="px-6 py-3 border border-red-500 text-red-500 uppercase tracking-widest text-[10px] hover:bg-red-500/20 font-bold"
            >
              Recapturar
            </button>
            <button
              onClick={confirm}
              className="px-6 py-3 bg-[#00ffc2] text-black uppercase tracking-widest text-[10px] hover:bg-white font-bold flex items-center space-x-2"
            >
              <Check size={16} />
              <span>Confirmar</span>
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 90%; }
        }
      `}</style>
    </div>
  );
}
