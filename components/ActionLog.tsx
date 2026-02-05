import React, { useState } from 'react';
import { analyzeEcoAction } from '../services/geminiService';
import { Loader2, Send, Sparkles } from 'lucide-react';

interface ActionLogProps {
  onPointsAwarded: (points: number, description: string, comment: string, category: string) => void;
}

const ActionLog: React.FC<ActionLogProps> = ({ onPointsAwarded }) => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<{ points: number; comment: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsAnalyzing(true);
    setFeedback(null);

    try {
      const result = await analyzeEcoAction(input);
      setFeedback({ points: result.points, comment: result.comment });
      onPointsAwarded(result.points, input, result.comment, result.category);
      setInput('');
      
      // Auto clear feedback after a few seconds
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 animate-slide-up">
      <div className="bg-eco-900/50 backdrop-blur-xl border border-eco-700 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Log Activity</h2>
          <p className="text-eco-200">What did you do for the planet today?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., I cycled to work instead of driving, or planted a small tree..."
              className="w-full bg-eco-950/80 border border-eco-700 rounded-2xl p-4 text-white placeholder-eco-600 focus:outline-none focus:ring-2 focus:ring-eco-500 focus:border-transparent min-h-[120px] resize-none transition-all"
              disabled={isAnalyzing}
            />
            <Sparkles className="absolute top-4 right-4 text-eco-500 opacity-50" />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isAnalyzing}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
              !input.trim() || isAnalyzing
                ? 'bg-eco-800 text-eco-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-eco-500 to-emerald-400 text-white hover:shadow-lg hover:shadow-eco-500/30 hover:scale-[1.02]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Analyzing Impact...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Claim Points
              </>
            )}
          </button>
        </form>

        {feedback && (
          <div className="mt-8 p-6 bg-gradient-to-br from-eco-500/20 to-emerald-500/10 border border-eco-500/30 rounded-2xl animate-fade-in text-center">
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-eco-300 to-white mb-2">
              +{feedback.points} Points!
            </div>
            <p className="text-eco-100 italic">"{feedback.comment}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionLog;