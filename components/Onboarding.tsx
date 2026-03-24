import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Trophy, Gift, Leaf, ArrowRight, Globe, Upload, Loader2, CheckCircle, AlertTriangle, Flame, MapPin } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../services/translations';
import { analyzeEcoAction } from '../services/geminiService';

interface OnboardingProps {
  onComplete: () => void;
  lang: Language;
  toggleLanguage: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, lang, toggleLanguage }) => {
  const [step, setStep] = useState(0);
  const [isTestingAI, setIsTestingAI] = useState(false);
  const [hasTestedAI, setHasTestedAI] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [testResult, setTestResult] = useState<{ points: number; comment: string; isVerified: boolean } | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const t = translations[lang];

  const processTestMedia = async (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve({ base64: reader.result.split(',')[1], mimeType: file.type });
        } else {
          reject(new Error('Failed'));
        }
      };
      reader.onerror = reject;
    });
  };

  const startRecording = async () => {
    if (!streamRef.current) return;
    
    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4';
    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      if (blob.size < 1000) return; // Ignore tiny blobs

      setIsTestingAI(true);
      setTestResult(null);
      
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '');
          reader.onerror = reject;
        });

        const result = await analyzeEcoAction("Test action", base64, mimeType, false, null);
        setTestResult(result);
        setHasTestedAI(true);
      } catch (err) {
        console.error(err);
        setTestResult({ points: 0, comment: "Test failed.", isVerified: false });
      } finally {
        setIsTestingAI(false);
      }
    };

    recorder.start();
    setIsRecording(true);
    setRecordingTime(0);
    
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 2) { // 2 seconds test
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
      setTestResult(null);
      
      // We need a small timeout to let the video element render before attaching the stream
      setTimeout(() => {
        if (liveVideoRef.current && streamRef.current) {
          liveVideoRef.current.srcObject = streamRef.current;
          liveVideoRef.current.play().catch(e => console.error("Video playback error:", e));
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert(lang === 'ar' ? 'تعذر الوصول إلى الكاميرا. يرجى السماح بالأذونات.' : 'Could not access camera. Please allow permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = async () => {
    // Removed for video-only requirement
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Removed for video-only requirement
  };

  const slides = [
    {
      id: 'welcome',
      title: t.onboarding1Title,
      desc: t.onboarding1Desc,
      icon: <Leaf className="w-20 h-20 text-eco-500" />,
      color: "from-eco-500/20 to-transparent"
    },
    {
      id: 'ai-test',
      title: t.onboarding2Title,
      desc: t.onboarding2Desc,
      icon: <Camera className="w-20 h-20 text-blue-500" />,
      color: "from-blue-500/20 to-transparent"
    },
    {
      id: 'streak',
      title: t.onboarding3Title,
      desc: t.onboarding3Desc,
      icon: <Trophy className="w-20 h-20 text-yellow-500" />,
      color: "from-yellow-500/20 to-transparent"
    },
    {
      id: 'location',
      title: t.onboarding4Title,
      desc: lang === 'ar' ? 'نحن الآن نستخدم موقعك للتحقق من الإجراءات ومنع الغش. احصل على مكافآت حقيقية!' : 'We now use your location to verify actions and prevent cheating. Earn real rewards!',
      icon: <MapPin className="w-20 h-20 text-purple-500" />,
      color: "from-purple-500/20 to-transparent"
    }
  ];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
      setTestResult(null);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="absolute top-4 right-4 z-50">
          <button onClick={toggleLanguage} className="flex items-center gap-2 px-3 py-1 bg-eco-900/40 border border-eco-500/30 text-eco-400 rounded-full hover:bg-eco-500/20 transition-all text-xs font-medium">
              <Globe className="h-4 w-4" />
              {lang === 'en' ? 'العربية' : 'English'}
          </button>
      </div>

      <div className="w-full max-w-md flex flex-col h-full relative">
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-b ${slides[step].color} opacity-50 transition-colors duration-700 pointer-events-none`} />

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center w-full"
            >
              <div className="mb-8 p-6 bg-white/5 rounded-full border border-white/10 shadow-2xl backdrop-blur-sm">
                {slides[step].icon}
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">
                {slides[step].title}
              </h1>
              
              <p className="text-gray-400 text-lg leading-relaxed max-w-sm mb-8">
                {slides[step].desc}
              </p>

              {/* Interactive Elements based on step */}
              {slides[step].id === 'ai-test' && (
                <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center">
                  <h3 className="text-white font-bold mb-4">{lang === 'ar' ? 'جرب الذكاء الاصطناعي الآن' : 'Test the AI Now'}</h3>
                  
                  {!isTestingAI && !testResult && !isCameraOpen && (
                    <div className="flex flex-col gap-3 w-full">
                      <button 
                        onClick={startCamera}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all w-full justify-center"
                      >
                        <Camera className="w-5 h-5" />
                        {lang === 'ar' ? 'ابدأ الكاميرا' : 'Start Camera'}
                      </button>
                    </div>
                  )}

                  {isCameraOpen && (
                    <div className="relative w-full h-64 bg-black rounded-xl overflow-hidden mb-4">
                      <video 
                        ref={liveVideoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover" 
                      />
                      
                      {isRecording && (
                        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full z-20">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-white text-[10px] font-bold uppercase tracking-wider">Recording</span>
                        </div>
                      )}
                      <div className="absolute bottom-4 left-0 w-full flex justify-center gap-4">
                        {!isRecording ? (
                          <>
                            <button 
                              onClick={stopCamera}
                              className="px-4 py-2 bg-black/50 text-white rounded-full backdrop-blur-md text-sm"
                            >
                              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button 
                              onClick={startRecording}
                              className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold text-sm transition-all flex items-center gap-2"
                            >
                              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                              {lang === 'ar' ? 'سجل واختبر' : 'Record & Test'}
                            </button>
                          </>
                        ) : (
                          <div className="px-6 py-2 bg-red-600/20 text-red-500 rounded-full font-mono font-bold text-sm backdrop-blur-md border border-red-500/30">
                            00:0{recordingTime}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {isTestingAI && (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      <span className="text-blue-400 text-sm">{lang === 'ar' ? 'جاري التحليل...' : 'Analyzing...'}</span>
                    </div>
                  )}

                  {testResult && (
                    <div className="flex flex-col items-center gap-3 w-full">
                      {testResult.isVerified ? (
                        <div className="flex flex-col items-center gap-2 text-eco-400">
                          <CheckCircle className="w-12 h-12" />
                          <span className="font-bold text-lg">+{testResult.points} Points</span>
                          <span className="text-sm text-center text-gray-300">{testResult.comment}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-red-400">
                          <AlertTriangle className="w-12 h-12" />
                          <span className="font-bold text-lg">Rejected</span>
                          <span className="text-sm text-center text-gray-300">{testResult.comment}</span>
                        </div>
                      )}
                      <button 
                        onClick={() => setTestResult(null)}
                        className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {lang === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}
                      </button>
                    </div>
                  )}

                  {/* Removed file input for video-only requirement */}
                </div>
              )}

              {slides[step].id === 'streak' && (
                <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center">
                  <div className="flex items-center gap-3 mb-6">
                    <Flame className="w-8 h-8 text-orange-500" />
                    <span className="text-2xl font-bold text-white">3 Day Streak!</span>
                  </div>
                  <div className="flex gap-2 w-full justify-between">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <div 
                        key={day}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          day <= 3 
                            ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]' 
                            : 'bg-white/10 text-gray-500'
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-400 text-sm mt-6 text-center">
                    {lang === 'ar' ? 'حافظ على سلسلتك لفتح مكافآت حصرية!' : 'Keep your streak alive to unlock exclusive rewards!'}
                  </p>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Area */}
        <div className="p-8 pb-12 relative z-10">
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? 'w-8 bg-eco-500' : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-4">
            <button 
              onClick={handleSkip}
              className="px-6 py-3 text-gray-400 font-medium hover:text-white transition-colors"
            >
              {t.onboardingSkip}
            </button>
            
            <button 
              onClick={handleNext}
              disabled={slides[step].id === 'ai-test' && !hasTestedAI}
              className={`flex-1 py-4 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg ${
                slides[step].id === 'ai-test' && !hasTestedAI 
                  ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                  : 'bg-eco-600 hover:bg-eco-500 shadow-eco-500/20'
              }`}
            >
              {step === slides.length - 1 ? t.onboardingStart : t.onboardingNext}
              {lang === 'en' 
                  ? <ArrowRight className="h-5 w-5" />
                  : <ArrowRight className="h-5 w-5 rotate-180" />
              }
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Onboarding;
