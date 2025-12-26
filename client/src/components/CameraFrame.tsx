import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { FilesetResolver, HandLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";
import { recognizeGesture, type GestureType } from "@/lib/gesture-recognition";
import { Loader2, CameraOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface CameraFrameProps {
  onGestureDetected: (gesture: GestureType) => void;
  isProcessing?: boolean;
}

export default function CameraFrame({ onGestureDetected, isProcessing = true }: CameraFrameProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [webcamReady, setWebcamReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const requestRef = useRef<number>();

  // 1. Initialize HandLandmarker
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        setHandLandmarker(landmarker);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load MediaPipe:", error);
        setLoading(false);
      }
    };
    initMediaPipe();
  }, []);

  // 2. Continuous Prediction Loop
  const predictWebcam = () => {
    if (
      handLandmarker && 
      webcamRef.current && 
      webcamRef.current.video && 
      webcamRef.current.video.readyState === 4 &&
      isProcessing
    ) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      
      if (canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          // Detect
          const startTimeMs = performance.now();
          const results = handLandmarker.detectForVideo(video, startTimeMs);

          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          if (results.landmarks && results.landmarks.length > 0) {
            // Draw skeleton
            const drawingUtils = new DrawingUtils(ctx);
            for (const landmarks of results.landmarks) {
              drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
                color: "#00ff80",
                lineWidth: 2
              });
              drawingUtils.drawLandmarks(landmarks, {
                color: "#00f3ff",
                lineWidth: 1,
                radius: 3
              });

              // Recognize Gesture
              const gesture = recognizeGesture(landmarks);
              onGestureDetected(gesture);
            }
          } else {
            onGestureDetected("None");
          }
        }
      }
    }
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  useEffect(() => {
    if (webcamReady && handLandmarker) {
      requestRef.current = requestAnimationFrame(predictWebcam);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [webcamReady, handLandmarker, isProcessing]);

  return (
    <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-xl overflow-hidden border-2 border-primary/30 bg-black shadow-[0_0_30px_rgba(0,255,128,0.1)]">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 text-primary">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="font-mono text-sm uppercase tracking-wider animate-pulse">Initializing Vision System...</p>
        </div>
      )}

      <Webcam
        ref={webcamRef}
        className="absolute inset-0 w-full h-full object-cover mirror-x"
        onUserMedia={() => setWebcamReady(true)}
        onUserMediaError={() => setLoading(false)}
        mirrored={true}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          facingMode: "user",
          width: 1280,
          height: 720
        }}
      />
      
      {/* Overlay Canvas for Skeleton */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover mirror-x z-10 pointer-events-none"
      />

      {/* Grid Overlay for Cyberpunk feel */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(0,255,128,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,128,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* Corner Brackets */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary z-20"></div>
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary z-20"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary z-20"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary z-20"></div>
    </div>
  );
}
