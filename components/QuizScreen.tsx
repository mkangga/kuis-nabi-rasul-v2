import React, { useState, useEffect, useRef } from 'react';
import { Question, QuizSettings } from '../types';
import Flashcard from './Flashcard';
import { ArrowRight, Clock, PauseCircle, PlayCircle, Home, CheckCircle, XCircle, RefreshCw, Eye } from 'lucide-react';

interface QuizScreenProps {
  questions: Question[];
  settings: QuizSettings;
  onFinish: (score: number, total: number) => void;
  onHome: () => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ questions, settings, onFinish, onHome }) => {
  // Queue State: Holds the list of questions remaining to be answered
  const [queue, setQueue] = useState<Question[]>(questions);
  
  // Stats
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const totalQuestions = questions.length;

  const [isFlipped, setIsFlipped] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.useTimer ? settings.timerDuration * 60 : 0);
  const [isPaused, setIsPaused] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initial setup: ensure queue matches props if props change (though typically they won't in this flow)
  useEffect(() => {
    setQueue(questions);
  }, [questions]);

  // Sound Effect
  const playSound = (type: 'beep' | 'success' | 'wrong') => {
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    if (type === 'beep') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.15);
    } else if (type === 'success') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.3);
    } else {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, ctx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.2);
    }
  };

  // Timer Logic
  useEffect(() => {
    if (!settings.useTimer || isPaused) return;

    if (timeLeft <= 0) {
      onFinish(score, totalQuestions);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 16 && prev > 1) { 
             playSound('beep');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.useTimer, timeLeft, isPaused, onFinish, score, totalQuestions]);

  // Actions
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSkip = () => {
    // Move current question to the end of the queue
    if (queue.length > 1) {
        const current = queue[0];
        const newQueue = [...queue.slice(1), current];
        setQueue(newQueue);
        setIsFlipped(false); // Reset flip
    } else {
        // Only 1 item left, skip just resets flip
        setIsFlipped(false);
    }
  };

  const handleJudge = (isCorrect: boolean) => {
    if (isCorrect) {
        setScore(s => s + 1);
        playSound('success');
    } else {
        playSound('wrong');
    }
    
    setAnsweredCount(c => c + 1);

    // Remove current question from queue
    const newQueue = queue.slice(1);
    
    if (newQueue.length === 0) {
        // We are done! Wait a split second for effect then finish
        setTimeout(() => {
            onFinish(isCorrect ? score + 1 : score, totalQuestions);
        }, 300);
    } else {
        setQueue(newQueue);
        setIsFlipped(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Current Progress based on Completed vs Total
  const progress = (answeredCount / totalQuestions) * 100;
  const timerColor = timeLeft <= 15 ? 'text-red-600 animate-pulse' : 'text-emerald-700';

  // Get current card data
  const currentCard = queue[0];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col h-full min-h-[90vh]">
      {/* Header: Progress & Timer */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-emerald-100">
        
        <button 
          onClick={onHome} 
          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
          title="Kembali ke Menu Utama"
        >
          <Home size={24} />
        </button>

        {/* Progress Bar */}
        <div className="w-full flex-grow">
          <div className="flex justify-between text-sm font-semibold text-gray-500 mb-1">
            <span>Terjawab {answeredCount} / {totalQuestions}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Timer Control */}
        {settings.useTimer && (
          <div className="flex items-center gap-4 min-w-fit mt-2 md:mt-0">
             <button 
              onClick={() => setIsPaused(!isPaused)}
              className="text-gray-400 hover:text-emerald-600 transition-colors"
              title={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? <PlayCircle size={28} /> : <PauseCircle size={28} />}
            </button>
            <div className={`flex items-center gap-2 text-2xl font-mono font-bold ${timerColor}`}>
              <Clock size={24} />
              {formatTime(timeLeft)}
            </div>
           
          </div>
        )}
      </div>

      {/* Main Flashcard Area */}
      <div className="flex-grow flex flex-col justify-center items-center relative">
         {/* Pause Overlay */}
         {isPaused && (
            <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
                <h3 className="text-3xl font-bold text-emerald-800 mb-2">Terjeda</h3>
                <button 
                    onClick={() => setIsPaused(false)}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                    Lanjutkan
                </button>
            </div>
        )}

        {currentCard && (
            <Flashcard
            key={currentCard.id} // Add key to force re-render/animation when card changes
            data={currentCard}
            isFlipped={isFlipped}
            onFlip={handleFlip}
            />
        )}
      </div>

      {/* Control Buttons */}
      <div className="mt-8 flex justify-center items-center gap-4 w-full">
        
        {!isFlipped ? (
            /* PRE-FLIP BUTTONS */
            <>
                <button
                    onClick={handleSkip}
                    className="flex-1 max-w-[180px] flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 transition-all shadow-sm"
                    title="Taruh di urutan paling belakang"
                >
                    <RefreshCw size={20} />
                    <span>Lewati</span>
                </button>

                <button
                    onClick={handleFlip}
                    className="flex-[2] max-w-sm flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg transform active:scale-95 transition-all text-lg"
                >
                    <Eye size={24} />
                    <span>Lihat Jawaban</span>
                </button>
            </>
        ) : (
            /* POST-FLIP BUTTONS (Self Assessment) */
            <>
                <button
                    onClick={() => handleJudge(false)}
                    className="flex-1 max-w-xs flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold bg-red-100 text-red-700 border-2 border-red-200 hover:bg-red-200 hover:border-red-300 shadow-md transition-all active:scale-95"
                >
                    <XCircle size={28} />
                    <span className="text-lg">Salah</span>
                </button>

                <button
                    onClick={() => handleJudge(true)}
                    className="flex-1 max-w-xs flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold bg-emerald-100 text-emerald-700 border-2 border-emerald-200 hover:bg-emerald-200 hover:border-emerald-300 shadow-md transition-all active:scale-95"
                >
                    <CheckCircle size={28} />
                    <span className="text-lg">Benar</span>
                </button>
            </>
        )}

      </div>
      
      {/* Helper Text */}
      <div className="mt-4 text-center text-gray-400 text-sm h-6">
        {!isFlipped ? "Klik 'Lewati' jika belum ingin menjawab sekarang" : "Apakah jawaban Anda tadi benar?"}
      </div>

    </div>
  );
};

export default QuizScreen;