
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeEcoAction } from './geminiService';
import { Loader2, Camera, X, Video, AlertTriangle, CheckCircle, ScanLine, Upload, Zap, Wifi, Cpu, RefreshCw, Skull, ShieldAlert, Flame, Clock } from 'lucide-react';
import { Language } from './types';
import { translations } from './translations';
import { hapticSuccess, hapticError, hapticClick } from './haptics';

interface ActionLogProps {
  onPointsAwarded: (points: number, description: string, comment: string, category: string, confidenceScore?: number) => void;
  onActionPendingReview: (proposedPoints: number, description: string, comment: string, category: string, confidenceScore: number, videoData: string, mimeType: string) => void;
  onActionRejected: () => void;
  currentStreak: number;
  lang: Language;
  section?: string;
  dailyLimit?: number;
  userName?: string;
  isLowPowerMode: boolean;
}

const ActionLog: React.FC<ActionLogProps> = ({ onPointsAwarded, onActionPendingReview, onActionRejected, currentStreak, lang, section = '10b1', dailyLimit = 25, userName, isLowPowerMode }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<{ points: number; comment: string; isVerified: boolean; confidenceScore?: number; isPending?: boolean } | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [dailyCount, setDailyCount] = useState(0);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const isEshel = userName?.toLowerCase() === 'eshel';

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(`daily_count_${today}`);
    if (stored) {
        setDailyCount(parseInt(stored));
    } else {
        // Reset if new day
        setDailyCount(0);
    }

    // Request location for anti-cheat
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                console.warn("Location access denied or unavailable.", error);
            }
        );
    }
  }, []);

  const updateDailyCount = () => {
      const today = new Date().toISOString().split('T')[0];
      const newCount = dailyCount + 1;
      setDailyCount(newCount);
      localStorage.setItem(`daily_count_${today}`, newCount.toString());
  };
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const t = translations[lang];

  // Camera & Recording State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount or visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
        if (document.hidden) {
            stopCamera();
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      stopCamera();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Countdown Timer Logic
  useEffect(() => {
    const updateTimer = () => {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0); // Next midnight
        const diff = midnight.getTime() - now.getTime();
        
        if (diff <= 0) {
            setTimeLeft('00:00:00');
        } else {
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${h}h ${m}m ${s}s`);
        }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Monitor camera state and attach stream to video element once it mounts
  useEffect(() => {
    if (isCameraOpen && liveVideoRef.current && streamRef.current) {
      liveVideoRef.current.srcObject = streamRef.current;
      liveVideoRef.current.play().catch(e => console.error("Video playback error:", e));
    }
  }, [isCameraOpen]);

  // Auto-stop recording after 15 seconds (Optimized from 30s)
  useEffect(() => {
    if (isRecording && recordingTime >= 15) {
        stopRecording();
    }
  }, [recordingTime, isRecording]);

  const formatTime = (seconds: number) => {
    return `0:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: 'environment',
            width: { ideal: isLowPowerMode ? 1280 : 1920 }, // 720p or 1080p
            height: { ideal: isLowPowerMode ? 720 : 1080 },
            frameRate: { ideal: isLowPowerMode ? 30 : 60 } 
        }, 
        audio: false 
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
      setFeedback(null);
    } catch (err) {
      console.warn("Error accessing environment camera, trying fallback:", err);
      try {
        // Fallback to any available camera
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false 
        });
        streamRef.current = fallbackStream;
        setIsCameraOpen(true);
        setFeedback(null);
      } catch (fallbackErr) {
        console.error("Error accessing camera:", fallbackErr);
        alert("Could not access camera. Please allow permissions in your browser settings.");
      }
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
    // Prefer webm (Chrome/Firefox), fallback to mp4 (Safari)
    const mimeType = MediaRecorder.isTypeSupported('video/webm') 
        ? 'video/webm'
        : 'video/mp4';
      
    try {
        const options: MediaRecorderOptions = { 
            mimeType
        };

        const recorder = new MediaRecorder(streamRef.current, options);
        
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
              chunksRef.current.push(e.data);
          }
        };
    
        recorder.onstop = () => {
          const type = mimeType;
          const blob = new Blob(chunksRef.current, { type });
          
          if (blob.size < 10000) { // Less than 10KB usually means corrupted or empty
              alert("Video recording was too short or corrupted. Please try again.");
              stopCamera();
              return;
          }

          const ext = type.includes('mp4') ? 'mp4' : 'webm';
          const file = new File([blob], `capture_${Date.now()}.${ext}`, { type });
          
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(file));
          stopCamera();
          
          // Auto-analyze after recording
          triggerAnalysisFlow(file);
        };
    
        // Do not use timeslice (e.g. recorder.start(1000)) as it can corrupt WebM headers in some browsers
        recorder.start(); 
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

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFeedback(null);
    stopCamera();
  };

  // Optimized media processor
  const processMediaForAI = async (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
      // If it's an image, resize it via Canvas to reduce payload size
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize large images to max 1024px dimension, 512px for low optimization
          const MAX_SIZE = isLowPowerMode ? 512 : 1024;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
             ctx.drawImage(img, 0, 0, width, height);
             // Compress to JPEG 0.8 quality
             const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
             resolve({ 
                 base64: dataUrl.split(',')[1], 
                 mimeType: 'image/jpeg' 
             });
          } else {
             // Fallback if canvas context fails
             const reader = new FileReader();
             reader.onload = () => resolve({ base64: (reader.result as string).split(',')[1], mimeType: file.type });
             reader.readAsDataURL(file);
          }
        };
        img.onerror = reject;
      } else {
        // Video handling (already optimized via recording bitrate)
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            const base64 = reader.result.split(',')[1];
            resolve({ base64, mimeType: file.type });
          } else {
            reject(new Error('Failed to convert file'));
          }
        };
        reader.onerror = error => reject(error);
      }
    });
  };

  // Haversine formula
  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const triggerAnalysisFlow = (file: File) => {
      const isBetaTester = userName?.toLowerCase() === 'bt';
      
      if (!isBetaTester) {
          if (!location) {
              setFeedback({
                  points: 0,
                  comment: "LOCATION REQUIRED. Please enable GPS to verify you are at MAIS Sharjah.",
                  isVerified: false
              });
              return;
          }
          
          const maisLat = 25.3855;
          const maisLng = 55.4300;
          const distance = getDistanceFromLatLonInKm(location.lat, location.lng, maisLat, maisLng);
          
          // 2 km radius for MAIS Sharjah
          if (distance > 2) {
              setFeedback({
                  points: 0,
                  comment: "LOCATION REJECTED. You must be at MAIS Sharjah to submit actions.",
                  isVerified: false
              });
              return;
          }
      }

      if (currentStreak > 0) {
          setShowWarning(true);
      } else {
          processSubmission(file);
      }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedFile) return;

    triggerAnalysisFlow(selectedFile);
  };

  const processSubmission = async (fileOverride?: File) => {
    const file = fileOverride || selectedFile;
    if (!file) return;

    // Check Daily Limit
    if (dailyCount >= dailyLimit) {
        setFeedback({
            points: 0,
            comment: `DAILY LIMIT REACHED (${dailyCount}/${dailyLimit}). COME BACK TOMORROW.`,
            isVerified: false
        });
        return;
    }

    setIsAnalyzing(true);
    setFeedback(null);
    setShowWarning(false);
    setAnalysisStep('Processing Media...');

    try {
      const { base64, mimeType } = await processMediaForAI(file);
      
      setAnalysisStep('Consulting AI Referee...');
      const defaultDescription = "Eco-friendly action check";
      const result = await analyzeEcoAction(defaultDescription, base64, mimeType, isLowPowerMode, location);
      
      setAnalysisStep('Verifying Result...');
      let displayComment = result.comment;
      let finalPoints = result.points > 0 ? result.points : 5; // Use AI points or fallback

      const isBT = userName?.toLowerCase() === 'bt';
      const isPendingReview = ((result.confidenceScore !== undefined && result.confidenceScore < 50) || isBT) && result.category !== 'Error';

      if (!result.isVerified && result.category !== 'Error' && !isPendingReview) {
          finalPoints = 0; // Reset points if rejected and not pending
          const failureQuotes = [
              "ACTION UNVERIFIED.",
              "INSUFFICIENT EVIDENCE.",
              "LOW CONFIDENCE SCORE.",
              "VISUALS UNCLEAR.",
              "FRAUD DETECTED.",
              "SUBJECT UNCLEAR.",
              "A TRASH A DAY KEEPS MR MAHMOOD AWAY."
          ];
          displayComment = failureQuotes[Math.floor(Math.random() * failureQuotes.length)];
      }
      
      if (isPendingReview) {
          if (isBT && result.confidenceScore !== undefined && result.confidenceScore >= 50) {
              displayComment = "BT Test Mode: The video has been sent to a moderator and it might take a day or 2. Thank you for your patience.";
          } else {
              displayComment = "The video has been sent to a moderator and it might take a day or 2. Thank you for your patience.";
          }
      }

      setFeedback({ 
        points: isPendingReview ? 0 : finalPoints, 
        comment: displayComment,
        isVerified: isPendingReview ? true : result.isVerified, // Force true so the UI doesn't show a red X if it's pending
        confidenceScore: result.confidenceScore,
        isPending: isPendingReview
      });

      if (isPendingReview) {
        hapticSuccess();
        setTimeout(() => {
            onActionPendingReview(finalPoints, 'VERIFIED_ACTION', result.comment, result.category, result.confidenceScore || 0, base64, mimeType);
            updateDailyCount();
            clearFile();
        }, 5000); // Wait longer so they can read the message
      } else if (result.isVerified && finalPoints > 0) {
        // Delay clearing to show the success animation
        hapticSuccess();
        setTimeout(() => {
            onPointsAwarded(finalPoints, 'VERIFIED_ACTION', result.comment, result.category, result.confidenceScore);
            updateDailyCount(); // Increment daily count
            clearFile();
        }, 2500);
      } else if (!result.isVerified) {
        hapticError();
        onActionRejected();
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
    <div className="max-w-3xl mx-auto p-4 animate-slide-up relative">
      
      {/* SUCCESS / PENDING OVERLAY (Blocks interactions momentarily) */}
      <AnimatePresence>
      {feedback?.isVerified && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className={`absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md rounded-xl border ${feedback.isPending ? 'border-blue-500' : 'border-eco-500'}`}
          >
              <div className="flex flex-col items-center text-center p-6">
                  <motion.div 
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="relative mb-6"
                  >
                      <div className={`absolute inset-0 ${feedback.isPending ? 'bg-blue-500' : 'bg-eco-500'} blur-3xl opacity-30 animate-pulse rounded-full`}></div>
                      {feedback.isPending ? (
                          <Clock className="h-24 w-24 text-blue-400 fill-blue-900" />
                      ) : (
                          <CheckCircle className="h-24 w-24 text-eco-400 fill-eco-900" />
                      )}
                      {/* Particles */}
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full animate-ping"></div>
                      <div className={`absolute -bottom-2 -left-2 w-3 h-3 ${feedback.isPending ? 'bg-blue-300' : 'bg-eco-300'} rounded-full animate-ping delay-100`}></div>
                  </motion.div>
                  
                  {!feedback.isPending && (
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-6xl font-black text-white italic tracking-tighter mb-2"
                      >
                          +{feedback.points}
                      </motion.div>
                  )}
                  
                  <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={`px-4 py-1 ${feedback.isPending ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-eco-500/20 border-eco-500 text-eco-300'} border rounded-full font-mono text-xs uppercase tracking-[0.3em] overflow-hidden whitespace-nowrap`}
                  >
                      {feedback.isPending ? 'PENDING REVIEW' : t.verified}
                  </motion.div>

                  {feedback.isPending && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-6 text-gray-300 text-sm max-w-sm leading-relaxed"
                      >
                          {feedback.comment}
                      </motion.p>
                  )}

                  {feedback.confidenceScore !== undefined && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-4 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400 font-mono text-[10px] uppercase tracking-wider"
                      >
                          Confidence Score: {feedback.confidenceScore}%
                      </motion.div>
                  )}
              </div>
          </motion.div>
      )}
      </AnimatePresence>

      <div className={`bg-white/5 backdrop-blur-xl border ${isEshel ? 'border-pink-500/20' : 'border-white/10'} rounded-3xl overflow-hidden shadow-2xl`}>
        {/* Minimal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
            <span className={`text-sm font-medium ${isEshel ? 'text-pink-400' : 'text-eco-400'}`}>{t.uploadModule}</span>
            <div className="flex gap-3 items-center">
                <div className="flex gap-1.5">
                    <div className={`w-2 h-2 ${isEshel ? 'bg-pink-500' : 'bg-eco-500'} rounded-full animate-pulse`}></div>
                </div>
            </div>
        </div>

        <div className="p-6 md:p-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight flex items-center justify-center gap-2">
                    {t.uploadTitle}
                </h2>
                <p className="text-gray-400 text-sm">{t.uploadDesc}</p>
                <div className={`mt-4 inline-block px-4 py-1.5 ${isEshel ? 'bg-pink-500/10 text-pink-400' : 'bg-eco-500/10 text-eco-400'} rounded-full text-xs font-medium`}>
                    Daily Limit: {dailyCount}/{dailyLimit}
                </div>
            </div>

            <form className="space-y-6">
            
            {/* Media Area */}
            <div className="space-y-2 relative group">
                {!previewUrl && !isCameraOpen ? (
                    <div className="w-full h-64 bg-white/5 border-2 border-dashed border-white/10 hover:border-eco-500/50 hover:bg-white/10 transition-all rounded-2xl flex flex-col items-center justify-center relative overflow-hidden p-6 gap-6 group-hover:shadow-lg">
                        <div className="flex items-center justify-center gap-8 w-full">
                            {/* Camera Option */}
                            <button 
                                type="button"
                                onClick={() => { hapticClick(); startCamera(); }}
                                className="flex flex-col items-center gap-3 group/btn p-4 rounded-xl transition-all"
                            >
                                <div className="bg-white/5 p-5 rounded-full group-hover/btn:bg-eco-500/20 group-hover/btn:scale-110 transition-all">
                                    <Camera className="h-6 w-6 text-gray-400 group-hover/btn:text-eco-400" />
                                </div>
                                <span className="text-gray-400 font-medium text-sm">{t.recordVideo}</span>
                            </button>
                        </div>
                    </div>
                ) : isCameraOpen ? (
                    <div className="relative w-full h-80 bg-black overflow-hidden rounded-2xl shadow-2xl">
                         <video 
                            ref={liveVideoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className="w-full h-full object-cover" 
                         />
                         
                         {/* Live Indicator */}
                         <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full z-20">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-white text-xs font-medium tracking-wide">Live</span>
                         </div>

                         {/* Low Power Mode Indicator */}
                         {isLowPowerMode && (
                             <div className="absolute top-4 left-20 flex items-center gap-2 bg-yellow-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-yellow-500/30 z-20">
                                <Zap className="w-3 h-3 text-yellow-500" />
                                <span className="text-yellow-500 text-[10px] font-bold tracking-wide uppercase">Eco Mode</span>
                             </div>
                         )}

                         {/* Enhanced Timer */}
                         {isRecording && (
                             <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
                                 <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-red-500/30 flex items-center gap-3">
                                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                      <div className="font-mono font-bold text-lg text-white tracking-wider">
                                         {formatTime(recordingTime)}
                                      </div>
                                 </div>
                             </div>
                         )}

                         <button 
                            type="button" 
                            onClick={stopCamera} 
                            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors backdrop-blur-md"
                         >
                            <X className="h-5 w-5" />
                         </button>

                         {/* Controls */}
                         <div className="absolute bottom-8 left-0 w-full flex items-center justify-center">
                            {!isRecording ? (
                                <button 
                                    type="button" 
                                    onClick={() => { hapticClick(); startRecording(); }}
                                    className="group relative"
                                >
                                    <div className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center group-hover:border-white transition-all group-hover:scale-105 bg-black/20 backdrop-blur-sm">
                                        <div className="w-16 h-16 bg-red-500 rounded-full shadow-lg shadow-red-500/30"></div>
                                    </div>
                                </button>
                            ) : (
                                <button 
                                    type="button" 
                                    onClick={() => { hapticClick(); stopRecording(); }}
                                    className="group relative"
                                >
                                    <div className="w-20 h-20 rounded-full border-4 border-red-500 flex items-center justify-center bg-red-500/10 backdrop-blur-sm transition-all group-hover:scale-105">
                                        <div className="w-8 h-8 bg-red-500 rounded-md shadow-sm"></div>
                                    </div>
                                </button>
                            )}
                         </div>
                    </div>
                ) : (
                    <div className="relative w-full h-80 bg-black rounded-2xl overflow-hidden shadow-2xl">
                        {selectedFile?.type.startsWith('video') ? (
                            <video src={previewUrl!} controls className="w-full h-full object-contain bg-black" />
                        ) : (
                            <img src={previewUrl!} alt="Preview" className="w-full h-full object-contain bg-black" />
                        )}
                        
                        {/* Scanning Line Animation & HUD Overlay */}
                        {isAnalyzing && (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-eco-500/10 to-transparent w-full h-[20%] animate-[scan_2s_linear_infinite] pointer-events-none z-10"></div>
                                
                                {/* New Centered HUD Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                    <div className="bg-black/80 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
                                        <Loader2 className="h-8 w-8 text-eco-500 animate-spin" />
                                        <span className="text-white font-medium text-sm tracking-wide">{analysisStep || t.processingData}</span>
                                    </div>
                                </div>
                            </>
                        )}
                        
                        {/* FAILURE OVERLAY */}
                        {feedback && !feedback.isVerified && (
                             <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                                    <AlertTriangle className="h-8 w-8 text-red-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Action Rejected</h2>
                                <p className="text-gray-400 text-sm mb-4 max-w-xs leading-relaxed">
                                    {feedback.comment}
                                </p>
                                {feedback.confidenceScore !== undefined && (
                                    <div className="mb-8 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400 font-mono text-[10px] uppercase tracking-wider">
                                        Confidence Score: {feedback.confidenceScore}%
                                    </div>
                                )}
                                <div className="flex gap-3 w-full max-w-xs">
                                    <button 
                                        onClick={clearFile} 
                                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium text-sm transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                    <button 
                                        onClick={() => handleSubmit()} 
                                        className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw className="h-4 w-4" /> Retry
                                    </button>
                                </div>
                             </div>
                        )}

                        <button 
                            type="button"
                            onClick={clearFile}
                            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md transition-colors z-30"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Streak Timer Display */}
            <div className="w-full">
                {currentStreak > 0 ? (
                    <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl relative overflow-hidden">
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="bg-orange-500/20 p-2.5 rounded-full">
                                <Flame className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                                <div className="text-xs text-orange-400 font-medium uppercase tracking-wide">Streak Active</div>
                                <div className="text-lg font-bold text-white">{currentStreak} DAYS</div>
                            </div>
                        </div>
                        <div className="text-right relative z-10">
                            <div className="text-xs text-gray-500 font-medium mb-1">Ends In</div>
                            <div className="text-xl font-mono font-bold text-white tabular-nums">{timeLeft}</div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/5 p-2.5 rounded-full">
                                <Flame className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">No Streak</div>
                                <div className="text-lg font-bold text-gray-400">Start Today</div>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="text-xs text-gray-600 font-medium mb-1">Timeout</div>
                            <div className="text-xl font-mono font-bold text-gray-600">--:--:--</div>
                        </div>
                    </div>
                )}
            </div>
            </form>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-600 font-medium flex justify-center items-center gap-2">
            <Wifi className="h-3 w-3" /> Secure Uplink • AI Referee Active
        </p>
      </div>

      {/* WARNING MODAL */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
             <div className="w-full max-w-sm bg-[#0a0a0a] border-2 border-red-600 shadow-[0_0_60px_rgba(220,38,38,0.5)] animate-slide-up relative overflow-hidden rounded-sm p-1 group">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(220,38,38,0.05)_10px,rgba(220,38,38,0.05)_20px)] pointer-events-none"></div>
                <div className="absolute inset-0 bg-red-900/5 animate-pulse pointer-events-none"></div>
                
                <div className="bg-black/80 p-6 flex flex-col items-center text-center relative z-10">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-red-600 blur-2xl opacity-30 animate-pulse rounded-full"></div>
                        <Skull className="h-16 w-16 text-red-500 relative z-10 animate-pulse" />
                    </div>
                    
                    <h2 className="text-3xl font-black text-red-600 uppercase tracking-tighter mb-2">
                        {t.warningTitle}
                    </h2>
                    
                    <div className="bg-red-950/30 border-l-2 border-red-600 p-4 mb-6 w-full text-left">
                        <div className="flex justify-between items-end mb-2 border-b border-red-800/30 pb-2">
                             <span className="text-[10px] text-red-400 font-mono uppercase tracking-widest">Risk Factor</span>
                             <span className="text-sm text-red-500 font-mono font-bold animate-pulse">CRITICAL</span>
                        </div>
                        <p className="text-red-200 text-xs font-mono uppercase tracking-wider leading-relaxed">
                            {t.warningDesc}
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-[10px] text-red-500 font-mono font-bold uppercase">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Streak at stake: {currentStreak} days</span>
                        </div>
                    </div>

                    <div className="w-full space-y-3">
                         <button
                            onClick={() => processSubmission()}
                            className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all border border-red-500 flex items-center justify-center gap-2 group/btn"
                         >
                            <ShieldAlert className="h-4 w-4 group-hover/btn:animate-ping" />
                            <span>{t.warningConfirm}</span>
                         </button>
                         
                         <button
                            onClick={() => clearFile()}
                            className="w-full py-3 bg-transparent text-red-500 border border-red-900/50 hover:bg-red-950/50 font-mono text-xs uppercase tracking-widest transition-colors"
                         >
                            {t.warningCancel}
                         </button>
                    </div>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default ActionLog;
