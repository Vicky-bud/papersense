import React, { useState, useEffect } from 'react';
import { generateQuiz, submitQuiz } from '../../api';
import { CheckCircle2, XCircle, ChevronRight, BookOpen, Loader2 } from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  context_page_number?: number;
  context_snippet?: string;
}

interface Quiz {
  id: string;
  paper_id: string;
  title: string;
  questions: Question[];
}

export default function QuizView({ paperId }: { paperId: string }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isEvaluated, setIsEvaluated] = useState(false);
  
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finalScore, setFinalScore] = useState<any>(null);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const data = await generateQuiz(paperId);
      setQuiz(data);
    } catch (err) {
      setError('Failed to generate quiz. Ensure the paper is indexed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!quiz) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if final score is shown
      if (finalScore) return;
      
      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key) && !isEvaluated) {
        const index = key.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
        if (index < quiz.questions[currentIndex].options.length) {
          setSelectedOption(index);
        }
      } else if (e.key === 'Enter') {
        if (!isEvaluated && selectedOption !== null) {
          handleEvaluate();
        } else if (isEvaluated) {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quiz, currentIndex, selectedOption, isEvaluated, finalScore]);

  const handleEvaluate = () => {
    if (selectedOption === null || !quiz) return;
    setIsEvaluated(true);
    setAnswers(prev => ({ ...prev, [quiz.questions[currentIndex].id]: selectedOption }));
  };

  const handleNext = async () => {
    if (!quiz) return;
    
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsEvaluated(false);
    } else {
      // Submit final
      setLoading(true);
      try {
        const res = await submitQuiz(quiz.id, answers);
        setFinalScore(res);
      } catch (err) {
        setError('Failed to submit quiz.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !quiz) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-background text-zinc-400">
        <Loader2 className="animate-spin mr-3" size={24} />
        <span className="tracking-wide">Synthesizing Examination...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400 p-8">{error}</div>;
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-background">
        <BookOpen size={48} className="text-zinc-700 mb-6" />
        <h2 className="text-2xl font-semibold text-zinc-200 mb-2">Knowledge Assessment</h2>
        <p className="text-zinc-500 mb-8 max-w-md text-center">
          Test your comprehension. The AI will generate 5 rigorous multiple-choice questions based directly on the paper's contents.
        </p>
        <button 
          onClick={loadQuiz}
          className="bg-zinc-100 text-zinc-950 px-6 py-2 rounded-md font-medium hover:bg-white transition-colors"
        >
          Generate Quiz
        </button>
      </div>
    );
  }

  if (finalScore) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-background">
        <h2 className="text-3xl font-semibold text-zinc-100 mb-4">Assessment Complete</h2>
        <div className="text-6xl font-mono text-primary mb-2">{finalScore.score.toFixed(0)}%</div>
        <p className="text-zinc-400">You got {finalScore.correct_answers} out of {finalScore.total_questions} correct.</p>
      </div>
    );
  }

  const currentQ = quiz.questions[currentIndex];
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="flex h-full w-full bg-background text-zinc-200 p-8 md:p-16 overflow-y-auto">
      <div className="max-w-3xl w-full mx-auto flex flex-col">
        <div className="mb-12 flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{quiz.title}</span>
          <span className="text-xs font-mono bg-zinc-800 px-3 py-1 rounded-full text-zinc-400">
            {currentIndex + 1} / {quiz.questions.length}
          </span>
        </div>

        <h1 className="text-2xl font-medium leading-relaxed mb-10 text-white">
          {currentQ.question_text}
        </h1>

        <div className="space-y-4 mb-12">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            let stateClass = "border-border bg-surface hover:border-zinc-500 cursor-pointer";
            let icon = null;

            if (isEvaluated) {
              if (idx === currentQ.correct_answer_index) {
                stateClass = "border-primary bg-primary/10 text-white";
                icon = <CheckCircle2 className="text-primary" size={20} />;
              } else if (isSelected) {
                stateClass = "border-red-500/50 bg-red-500/10 text-white";
                icon = <XCircle className="text-red-400" size={20} />;
              } else {
                stateClass = "border-border bg-surface opacity-50 cursor-not-allowed";
              }
            } else if (isSelected) {
              stateClass = "border-zinc-300 bg-zinc-800 text-white";
            }

            return (
              <div 
                key={idx}
                onClick={() => !isEvaluated && setSelectedOption(idx)}
                className={`flex items-center justify-between p-5 rounded-lg border transition-all ${stateClass}`}
              >
                <div className="flex items-center gap-4">
                  <span className={`flex items-center justify-center w-6 h-6 rounded text-xs font-mono border ${isSelected && !isEvaluated ? 'border-zinc-400 text-white' : 'border-zinc-700 text-zinc-500'}`}>
                    {letters[idx]}
                  </span>
                  <span className="text-base">{opt}</span>
                </div>
                {icon}
              </div>
            );
          })}
        </div>

        {/* Verification Drawer */}
        {isEvaluated && (
          <div className="mt-auto animate-in slide-in-from-bottom-8 fade-in duration-300">
            <div className="card p-6 rounded-xl border-l-4 border-l-primary relative">
              <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                <BookOpen size={16} className="text-primary" />
                Ground Truth Verification
              </h3>
              <p className="text-zinc-300 text-sm mb-4 leading-relaxed">
                {currentQ.explanation}
              </p>
              
              {currentQ.context_snippet && (
                <div className="bg-[#0f0f11] p-4 rounded-md border border-zinc-800/50">
                  <div className="text-xs font-mono text-zinc-500 mb-2">PAGE {currentQ.context_page_number}</div>
                  <blockquote className="text-sm text-zinc-400 border-l-2 border-zinc-700 pl-3 italic">
                    "{currentQ.context_snippet}"
                  </blockquote>
                </div>
              )}
            </div>
            
            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleNext}
                className="flex items-center gap-2 bg-white text-zinc-950 px-6 py-3 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
              >
                {currentIndex < quiz.questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
