import React from 'react';
import { Home, RefreshCw, Trophy } from 'lucide-react';
import { QuizResult } from '../types';

interface ResultScreenProps {
  result: QuizResult;
  onRetry: () => void;
  onHome: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ result, onRetry, onHome }) => {
  const percentage = Math.round((result.score / result.total) * 100);
  
  let message = "Terus Belajar!";
  if (percentage === 100) message = "Mumtaz! Sempurna!";
  else if (percentage >= 80) message = "Masya Allah, Luar Biasa!";
  else if (percentage >= 60) message = "Alhamdulillah, Cukup Baik";

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full p-6 text-center animate-fade-in">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-2xl w-full border-t-8 border-emerald-500">
        
        <div className="mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gold-400 rounded-full mb-4 shadow-lg animate-bounce-slow text-white">
                <Trophy size={48} fill="currentColor" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Kuis Selesai!</h2>
            <p className="text-emerald-600 font-medium text-lg">{message}</p>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-8 mb-8 border border-emerald-100 transform hover:scale-105 transition-transform duration-300">
          <p className="text-gray-500 uppercase tracking-widest text-sm font-bold mb-2">Skor Akhir</p>
          <div className="flex items-center justify-center items-baseline gap-2">
            <span className="text-6xl md:text-7xl font-black text-emerald-700">{result.score}</span>
            <span className="text-2xl text-gray-400 font-medium">/ {result.total}</span>
          </div>
          <div className="mt-4 text-emerald-600 font-semibold bg-emerald-100 inline-block px-4 py-1 rounded-full">
            {percentage}% Benar
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-8 text-sm text-gray-500 italic">
          "Alhamdulillahi Jaza Kumullohu Khoiro" <br/>
          (Semoga Allah membalas kalian dengan kebaikan)
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg"
          >
            <RefreshCw size={20} />
            Coba Lagi
          </button>
          
          <button
             onClick={onHome} 
             className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-emerald-700 border border-emerald-200 rounded-xl font-bold hover:bg-emerald-50 transition-all"
          >
            <Home size={20} />
            Menu Utama
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;