import React, { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import { QUESTIONS } from './constants';
import { QuizSettings, ScreenState, Question, QuizResult } from './types';

const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>('setup');
  const [settings, setSettings] = useState<QuizSettings>({
    questionCount: 10,
    useTimer: false,
    timerDuration: 5,
    selectedCategory: 'Semua'
  });
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [lastResult, setLastResult] = useState<QuizResult>({ score: 0, total: 0 });

  const handleStart = (newSettings: QuizSettings) => {
    setSettings(newSettings);
    
    // 1. Filter by category first
    let pool = QUESTIONS;
    if (newSettings.selectedCategory !== 'Semua') {
      pool = QUESTIONS.filter(q => q.category === newSettings.selectedCategory);
    }

    // 2. Shuffle
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    
    // 3. Slice based on count logic
    const selected = shuffled.slice(0, newSettings.questionCount);
    
    setActiveQuestions(selected);
    setScreen('quiz');
  };

  const handleFinish = (score: number, total: number) => {
    setLastResult({ score, total });
    setScreen('result');
  };

  const handleRetry = () => {
    // Restart with same settings but reshuffle questions
    handleStart(settings);
  };

  const handleHome = () => {
    setScreen('setup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-7xl mx-auto">
        {screen === 'setup' && <SetupScreen onStart={handleStart} />}
        {screen === 'quiz' && (
          <QuizScreen 
            questions={activeQuestions} 
            settings={settings} 
            onFinish={handleFinish} 
            onHome={handleHome}
          />
        )}
        {screen === 'result' && (
          <ResultScreen 
            result={lastResult}
            onRetry={handleRetry} 
            onHome={handleHome} 
          />
        )}
      </div>
    </div>
  );
};

export default App;