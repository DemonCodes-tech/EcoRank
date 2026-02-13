import React, { useState, useRef, useEffect } from 'react';
import { analyzeEcoAction } from '../services/geminiService';
import { Loader2, Camera, X, Video, AlertTriangle, CheckCircle, ScanLine, Upload, Zap, Wifi, Cpu, RefreshCw } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../services/translations';

interface ActionLogProps {
  onPointsAwarded: (points: number, description: string, comment: string, category: string) => void;
  lang: Language;
}

const ActionLog: React.FC<ActionLogProps> = ({ onPointsAwarded, lang }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<{ points: number; comment: string; isVerified: boolean } | null>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const t = translations[lang];

  // Camera & Recording State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Monitor camera state and attach stream to video element once it mounts
  useEffect(() => {
    if (isCameraOpen && liveVideoRef.current && streamRef.current) {
      liveVideoRef.current.srcObject = streamRef.current;
      liveVideoRef.current.play().catch(e => console.error("Video playback error:", e));
    }
  }, [isCameraOpen]);

  // Auto-stop recording after 30 seconds
  useEffect(() => {
    if (isRecording && recordingTime >= 30) {
        stopRecording();
    }
  }, [recordingTime, isRecording]);

  const formatTime = (seconds: number) => {
    return `0:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const startCamera = async () => {
    try {
      // OPTIMIZATION: Request lower resolution and frame rate to reduce processing load
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: 'environment',
            width: { ideal: 480 }, // 480p is enough for AI
            height: { ideal: 360 },
            frameRate: { ideal: 24 } // 24fps for smoother 30s video
        }, 
        audio: false // Disable audio to save bandwidth
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
      setFeedback(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please allow permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
    }
    setIsCameraOpen(false);
    setIsRecording(false);
    setRecordingTime(0);
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    
    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8') 
        ? 'video/webm;codecs=vp8' // VP8 is older but very compatible and fast
        : 'video/webm';
      
    try {
        const options: MediaRecorderOptions = { 
            mimeType,
            // 350 kbps: ~1.5MB for 30s. Good balance for mobile upload + AI analysis.
            videoBitsPerSecond: 350000 
        };

        const recorder = new MediaRecorder(streamRef.current, options);
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
    
        recorder.onstop = () => {
          const type = chunksRef.current[0]?.type || 'video/webm';
          const blob = new Blob(chunksRef.current, { type });
          const ext = type.includes('mp4') ? 'mp4' : 'webm';
          const file = new File([blob], `capture_${Date.now()}.${ext}`, { type });
          
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(file));
          stopCamera(); 
        };
    
        recorder.start(1000); // Collect chunks every second
        setIsRecording(true);
        mediaRecorderRef.current = recorder;
        
        setRecordingTime(0);
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);

    } catch (e) {
        console.error("MediaRecorder error:", e);
        alert("Recording failed. Device format incompatible.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Basic size check for uploads (15MB limit)
      if (file.size > 15 * 1024 * 1024) {
          alert(t.fileTooLarge);
          return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsCameraOpen(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFeedback(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    stopCamera();
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Removes "data:video/mp4;base64," prefix
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setFeedback(null);

    try {
      let base64Data: string | undefined = undefined;
      let mimeType: string | undefined = undefined;

      if (selectedFile) {
        base64Data = await fileToBase64(selectedFile);
        mimeType = selectedFile.type;
      }

      const defaultDescription = "Eco-friendly action check";
      const result = await analyzeEcoAction(defaultDescription, base64Data, mimeType);
      
      let displayComment = result.comment;
      
      // Only replace comment with flavor text if it's NOT a system error
      if (!result.isVerified && result.category !== 'Error') {
          const failureQuotes = [
              "ACTION UNVERIFIED.",
              "INSUFFICIENT EVIDENCE.",
              "LOW CONFIDENCE SCORE.",
              "VISUALS UNCLEAR.",
              "FRAUD DETECTED.",
              "MOTION UNDETECTED.",
              "NO DISPOSAL ACTION SEEN.",
              "SUBJECT UNCLEAR.",
              "ENVIRONMENTAL MISMATCH."
          ];
          displayComment = failureQuotes[Math.floor(Math.random() * failureQuotes.length)];
      }
      
      setFeedback({ 
        points: result.points, 
        comment: displayComment,
        isVerified: result.isVerified
      });

      if (result.isVerified && result.points > 0) {
        onPointsAwarded(result.points, 'VERIFIED_ACTION', result.comment, result.category);
        clearFile();
      }
      
    } catch (err) {
      console.error(err);
      setFeedback({
          points: 0,
          comment: "TRANSMISSION FAILED. TRY SHORTER VIDEO.",
          isVerified: false
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 animate-slide-up">
      <div className="bg-black/40 backdrop-blur-xl border border-eco-500/30 p-1">
        {/* Terminal Header */}
        <div className="bg-eco-900/30 px-4 py-2 flex items-center justify-between border-b border-eco-500/30">
            <span className="text-xs font-mono text-eco-400 uppercase tracking-widest">>> {t.uploadModule}</span>
            <div className="flex gap-2 items-center">
                <span className="text-[10px] text-eco-600 font-mono hidden md:inline">LOW_BW_MODE: ON</span>
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-eco-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-eco-500/30 rounded-full"></div>
                </div>
            </div>
        </div>

        <div className="p-6 md:p-8">
            <div className="text-center mb-8 font-mono">
            <h2 className="text-2xl text-white mb-2 uppercase tracking-tight flex items-center justify-center gap-2">
                <ScanLine className="h-6 w-6 text-eco-400" />
                {t.uploadTitle}
            </h2>
            <p className="text-eco-500/60 text-xs">{t.uploadDesc}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Media Area */}
            <div className="space-y-2 relative group">
                {/* Corner Accents */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t border-l border-eco-500 z-20"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t border-r border-eco-500 z-20"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b border-l border-eco-500 z-20"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b border-r border-eco-500 z-20"></div>

                {!previewUrl && !isCameraOpen ? (
                   <div className="w-full h-56 bg-[radial-gradient(#064e3b_1px,transparent_1px)] [background-size:16px_16px] bg-black/50 border border-dashed border-eco-700 flex flex-col items-center justify-center relative overflow-hidden p-6 gap-6">
                        <div className="flex items-center justify-center gap-8 w-full">
                            {/* Upload Option */}
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center gap-3 group/btn hover:bg-white/5 p-4 rounded-xl transition-all"
                            >
                                <div className="bg-eco-900/50 p-4 rounded-full border border-eco-500/30 group-hover/btn:scale-110 group-hover/btn:border-eco-400 transition-all">
                                    <Upload className="h-6 w-6 text-eco-400" />
                                </div>
                                <span className="text-eco-300 font-mono text-xs tracking-wider">{t.uploadFile}</span>
                            </button>

                            <div className="h-12 w-px bg-eco-800"></div>

                            {/* Camera Option */}
                            <button 
                                type="button"
                                onClick={startCamera}
                                className="flex flex-col items-center gap-3 group/btn hover:bg-white/5 p-4 rounded-xl transition-all"
                            >
                                <div className="bg-eco-900/50 p-4 rounded-full border border-eco-500/30 group-hover/btn:scale-110 group-hover/btn:border-eco-400 transition-all">
                                    <Camera className="h-6 w-6 text-eco-400" />
                                </div>
                                <span className="text-eco-300 font-mono text-xs tracking-wider">{t.recordVideo}</span>
                            </button>
                        </div>
                        <p className="text-eco-600 text-[10px] absolute bottom-2 font-mono uppercase tracking-widest">{t.selectInput}</p>
                    </div>
                ) : isCameraOpen ? (
                    <div className="relative w-full h-72 bg-black border border-eco-500/50 overflow-hidden rounded-sm">
                         <video 
                            ref={liveVideoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className="w-full h-full object-cover" 
                         />
                         
                         {/* Live Indicator */}
                         <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-2 py-1 rounded">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-white text-[10px] font-mono tracking-widest">{t.liveFeed} [480p]</span>
                         </div>

                         {/* Enhanced Timer */}
                         {isRecording && (
                             <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20">
                                 <div className="bg-black/60 backdrop-blur-md px-5 py-2 rounded-full border border-red-500/50 flex items-center gap-3 shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                                      <div className="w-3 h-3 bg-red-600 rounded-full animate-[pulse_0.5s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
                                      <div className="font-mono font-bold text-xl text-white tracking-wider flex items-baseline gap-1">
                                         <span>{formatTime(recordingTime)}</span>
                                         <span className="text-xs text-white/40">/ 0:30</span>
                                      </div>
                                 </div>
                                 <div className="text-[10px] text-red-400 font-mono uppercase tracking-[0.2em] animate-pulse font-bold">
                                     Recording Active
                                 </div>
                             </div>
                         )}

                         <button 
                            type="button" 
                            onClick={stopCamera} 
                            className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-900/50 transition-colors"
                         >
                            <X className="h-5 w-5" />
                         </button>

                         {/* Controls */}
                         <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-center">
                            {!isRecording ? (
                                <button 
                                    type="button" 
                                    onClick={startRecording} 
                                    className="group flex flex-col items-center gap-2"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                                        <div className="w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center group-hover:border-white transition-all group-hover:scale-105 bg-black/20 backdrop-blur-sm">
                                            <div className="w-14 h-14 bg-red-600 rounded-full shadow-inner shadow-red-800"></div>
                                        </div>
                                    </div>
                                    <span className="text-white text-xs font-mono tracking-widest uppercase opacity-80 group-hover:opacity-100">{t.startRecord}</span>
                                </button>
                            ) : (
                                <button 
                                    type="button" 
                                    onClick={stopRecording} 
                                    className="group flex flex-col items-center gap-2"
                                >
                                    <div className="relative">
                                         <div className="absolute inset-0 rounded-full border-4 border-red-500/30 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                                         <div className="w-20 h-20 rounded-full border-4 border-red-500 flex items-center justify-center bg-red-950/30 backdrop-blur-sm transition-all group-hover:bg-red-900/50 group-hover:scale-105">
                                            <div className="w-8 h-8 bg-white rounded-md shadow-sm"></div>
                                        </div>
                                    </div>
                                    <span className="text-red-400 text-xs font-mono tracking-widest uppercase font-bold animate-pulse">{t.stopRecord}</span>
                                </button>
                            )}
                         </div>
                    </div>
                ) : (
                    <div className="relative w-full h-64 bg-black border border-eco-500/50">
                        {selectedFile?.type.startsWith('video') ? (
                            <video src={previewUrl!} controls className="w-full h-full object-contain opacity-90" />
                        ) : (
                            <img src={previewUrl!} alt="Preview" className="w-full h-full object-contain opacity-90" />
                        )}
                        
                        {/* Scanning Line Animation & HUD Overlay */}
                        {isAnalyzing && (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-eco-500/20 to-transparent w-full h-[10%] animate-[scan_2s_linear_infinite] pointer-events-none z-10"></div>
                                
                                {/* New Centered HUD Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                    <div className="bg-black/80 backdrop-blur-sm border border-eco-500/50 px-6 py-3 rounded-sm shadow-[0_0_30px_rgba(16,185,129,0.2)] flex flex-col items-center gap-2 animate-pulse">
                                        <div className="flex items-center gap-3">
                                            <Cpu className="h-5 w-5 text-eco-400 animate-spin" />
                                            <span className="text-eco-400 font-mono text-xs font-bold tracking-[0.2em]">{t.processingData}</span>
                                        </div>
                                        <div className="text-[9px] text-eco-600 font-mono tracking-widest uppercase">
                                            AI_VISION_MODULE::ACTIVE
                                        </div>
                                    </div>
                                </div>

                                {/* Corner Brackets Animation */}
                                <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-eco-500/70 rounded-tl-lg animate-pulse z-10"></div>
                                <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-eco-500/70 rounded-tr-lg animate-pulse z-10"></div>
                                <div className="absolute bottom-10 left-2 w-8 h-8 border-b-2 border-l-2 border-eco-500/70 rounded-bl-lg animate-pulse z-10"></div>
                                <div className="absolute bottom-10 right-2 w-8 h-8 border-b-2 border-r-2 border-eco-500/70 rounded-br-lg animate-pulse z-10"></div>
                            </>
                        )}

                        <button 
                            type="button"
                            onClick={clearFile}
                            className="absolute top-2 right-2 bg-black/80 hover:bg-red-900/80 text-white p-2 border border-white/10 transition-colors z-30"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 w-full bg-black/80 p-2 text-xs font-mono text-eco-400 border-t border-eco-800 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                {selectedFile?.type.startsWith('video') ? <Video className="h-3 w-3"/> : <Camera className="h-3 w-3"/>}
                                <span className="uppercase">{selectedFile?.name.slice(0, 15)}...</span>
                            </span>
                            <span className="text-eco-700">{(selectedFile!.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                    </div>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="video/*,image/*"
                    className="hidden"
                />
            </div>

            <button
                type="submit"
                disabled={(!selectedFile && !isRecording) || isAnalyzing}
                className={`w-full flex items-center justify-center gap-2 py-4 font-mono font-bold text-lg tracking-wider transition-all duration-200 border ${
                !selectedFile || isAnalyzing
                    ? 'bg-black/50 border-eco-900 text-eco-800 cursor-not-allowed'
                    : 'bg-eco-600/20 hover:bg-eco-600/40 border-eco-500 text-eco-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                }`}
            >
                {isAnalyzing ? (
                <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span className="animate-pulse">{t.analyzing}</span>
                </>
                ) : (
                <>
                    {!selectedFile ? (
                    <span className="opacity-50">{t.awaitingData}</span>
                    ) : (
                    <>
                        <Zap className="h-5 w-5 fill-current" />
                        {t.analyzeBtn}
                    </>
                    )}
                </>
                )}
            </button>
            </form>

            {feedback && (
            <div className={`mt-8 p-1 border-l-4 font-mono animate-fade-in ${
                feedback.isVerified 
                ? 'border-l-eco-500 bg-eco-900/10' 
                : 'border-l-red-500 bg-red-900/10'
            }`}>
                <div className="p-4">
                    {feedback.isVerified ? (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-eco-400 uppercase tracking-widest text-xs font-bold mb-1">
                                <CheckCircle className="h-4 w-4" /> {t.verified}
                            </div>
                            <div className="text-4xl font-bold text-white mb-1">
                            +{feedback.points} PTS
                            </div>
                            <p className="text-eco-200/80 text-sm">>> {feedback.comment}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                             <div className="flex items-center gap-2 text-red-400 uppercase tracking-widest text-xs font-bold mb-1">
                                <AlertTriangle className="h-4 w-4" /> {t.rejected}
                            </div>
                            <h3 className="text-xl font-bold text-red-500">REJECTED</h3>
                            <p className="text-red-300/60 text-sm">>> {feedback.comment}</p>
                            
                            {(feedback.comment.toUpperCase().includes("ERROR") || feedback.comment.toUpperCase().includes("FAILED") || feedback.comment.toUpperCase().includes("RETRY") || feedback.comment.includes("TRANSMISSION")) && (
                                <button 
                                    onClick={() => handleSubmit()}
                                    className="mt-2 self-start flex items-center gap-2 px-4 py-2 bg-red-900/40 border border-red-500/50 hover:bg-red-900/60 text-red-200 text-xs font-bold uppercase tracking-wider rounded transition-all"
                                >
                                    <RefreshCw className="h-3 w-3" /> {t.retry}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            )}
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-[10px] text-eco-700 font-mono uppercase flex justify-center items-center gap-2">
            <Wifi className="h-3 w-3" /> SECURE UPLINK // AI REFEREE ACTIVE
        </p>
      </div>
    </div>
  );
};

export default ActionLog;