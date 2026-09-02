import React, { useState, useEffect } from 'react';
import { generateQuiz, submitQuiz } from '../../api';
import { CheckCircle2, XCircle, ChevronRight, BookOpen, Loader2, Brain, Trophy, RotateCcw, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const [correctCount, setCorrectCount] = useState(0);
  const [finalScore, setFinalScore] = useState<any>(null);

  const loadQuiz = async () => {
    setLoading(true);
    setError('');
    setQuiz(null);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsEvaluated(false);
    setAnswers({});
    setCorrectCount(0);
    setFinalScore(null);
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
      if (finalScore) return;
      
      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key) && !isEvaluated) {
        const index = key.charCodeAt(0) - 65;
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
    if (selectedOption === quiz.questions[currentIndex].correct_answer_index) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = async () => {
    if (!quiz) return;
    
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsEvaluated(false);
    } else {
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

  // ─── Loading State ───
  if (loading && !quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-background relative">
        <Link 
          to={`/workspace/${paperId}`}
          className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Workspace
        </Link>
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
            <Brain size={32} className="text-zinc-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center">
            <Loader2 size={14} className="animate-spin text-emerald-400" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-zinc-200 mb-2">Generating Questions</h2>
        <p className="text-sm text-zinc-500 max-w-xs text-center">Analyzing paper content and synthesizing rigorous assessment questions…</p>
        <div className="mt-6 flex gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  // ─── Error State ───
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-background">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
          <XCircle size={28} className="text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-200 mb-2">Generation Failed</h2>
        <p className="text-sm text-zinc-500 mb-6 max-w-xs text-center">{error}</p>
        <button
          onClick={loadQuiz}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          <RotateCcw size={14} />
          Try Again
        </button>
      </div>
    );
  }

  // ─── Empty / Generate State ───
  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-background relative">
        <Link 
          to={`/workspace/${paperId}`}
          className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Workspace
        </Link>
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center">
            <Brain size={40} className="text-zinc-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Sparkles size={14} className="text-emerald-400" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-zinc-100 mb-2 tracking-tight">Knowledge Assessment</h2>
        <p className="text-sm text-zinc-500 mb-2 max-w-sm text-center leading-relaxed">
          Test your comprehension with AI-generated questions based directly on the paper's content.
        </p>
        <div className="flex items-center gap-4 text-xs text-zinc-600 font-mono mb-8">
          <span>5 Questions</span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <span>Multiple Choice</span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <span>Instant Feedback</span>
        </div>
        <button 
          onClick={loadQuiz}
          className="group flex items-center gap-2.5 bg-zinc-100 text-zinc-950 px-7 py-3 rounded-xl font-medium hover:bg-white transition-all hover:shadow-lg hover:shadow-white/5"
        >
          <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
          Generate Quiz
        </button>
      </div>
    );
  }

  // ─── Final Score ───
  if (finalScore) {
    const pct = Math.round(finalScore.score);
    const grade = pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : pct >= 40 ? 'Needs Review' : 'Study More';
    const gradeColor = pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400';

    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-background">
        <div className="w-20 h-20 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mb-6">
          <Trophy size={36} className={gradeColor} />
        </div>
        <h2 className="text-2xl font-semibold text-zinc-100 mb-1 tracking-tight">Assessment Complete</h2>
        <p className={`text-sm font-medium mb-6 ${gradeColor}`}>{grade}</p>
        
        <div className="relative w-32 h-32 mb-6">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#27272a" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke={pct >= 80 ? '#34d399' : pct >= 60 ? '#fbbf24' : '#f87171'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${pct * 3.267} 326.7`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-mono font-bold text-white">{pct}%</span>
          </div>
        </div>

        <p className="text-sm text-zinc-500 mb-8">
          {finalScore.correct_answers} of {finalScore.total_questions} correct
        </p>
        
        <button
          onClick={loadQuiz}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          <RotateCcw size={14} />
          Retake Quiz
        </button>
      </div>
    );
  }

  // ─── Active Quiz ───
  const currentQ = quiz.questions[currentIndex];
  const letters = ['A', 'B', 'C', 'D'];
  const progress = ((currentIndex) / quiz.questions.length) * 100;

  return (
    <div className="flex flex-col h-full w-full bg-background text-zinc-200 overflow-hidden relative">
      <Link 
        to={`/workspace/${paperId}`}
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors z-10 hidden md:flex"
      >
        <ArrowLeft size={16} />
        Back
      </Link>
      {/* Progress bar */}
      <div className="w-full h-1 bg-zinc-900">
        <div
          className="h-full bg-emerald-500/70 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-8 md:p-16">
        <div className="max-w-2xl w-full mx-auto">
          {/* Header */}
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center">
                <Brain size={16} className="text-zinc-400" />
              </div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{quiz.title || 'Knowledge Assessment'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-500">
                Question
              </span>
              <span className="text-xs font-mono bg-zinc-800 border border-zinc-700/50 px-2.5 py-1 rounded-md text-zinc-300">
                {currentIndex + 1} / {quiz.questions.length}
              </span>
            </div>
          </div>

          {/* Question */}
          <h1 className="text-xl md:text-2xl font-medium leading-relaxed mb-10 text-white">
            {currentQ.question_text}
          </h1>

          {/* Options */}
          <div className="space-y-3 mb-10">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let containerClass = "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-800/50 cursor-pointer";
              let letterClass = "border-zinc-700 text-zinc-500 bg-zinc-900";
              let icon = null;

              if (isEvaluated) {
                if (idx === currentQ.correct_answer_index) {
                  containerClass = "border-emerald-500/30 bg-emerald-500/5";
                  letterClass = "border-emerald-500/50 text-emerald-400 bg-emerald-500/10";
                  icon = <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />;
                } else if (isSelected) {
                  containerClass = "border-red-500/30 bg-red-500/5";
                  letterClass = "border-red-500/50 text-red-400 bg-red-500/10";
                  icon = <XCircle className="text-red-400 shrink-0" size={18} />;
                } else {
                  containerClass = "border-zinc-800/50 bg-zinc-900/30 opacity-40 cursor-not-allowed";
                  letterClass = "border-zinc-800 text-zinc-600 bg-zinc-900";
                }
              } else if (isSelected) {
                containerClass = "border-zinc-500 bg-zinc-800 ring-1 ring-zinc-600";
                letterClass = "border-zinc-400 text-white bg-zinc-700";
              }

              return (
                <div 
                  key={idx}
                  onClick={() => !isEvaluated && setSelectedOption(idx)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-150 ${containerClass}`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-mono border transition-colors ${letterClass}`}>
                      {letters[idx]}
                    </span>
                    <span className="text-sm text-zinc-200">{opt}</span>
                  </div>
                  {icon}
                </div>
              );
            })}
          </div>

          {/* Evaluate Button (before evaluation) */}
          {!isEvaluated && selectedOption !== null && (
            <div className="flex justify-end mb-8">
              <button
                onClick={handleEvaluate}
                className="flex items-center gap-2 bg-zinc-100 text-zinc-950 px-6 py-2.5 rounded-xl font-medium hover:bg-white transition-all text-sm"
              >
                Check Answer
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Explanation Drawer */}
          {isEvaluated && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-300">
              <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-xl mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={14} className="text-emerald-400" />
                  <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Explanation</h3>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {currentQ.explanation}
                </p>
                
                {currentQ.context_snippet && (
                  <div className="mt-4 bg-zinc-950/50 p-4 rounded-lg border border-zinc-800/50">
                    <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-2">Source — Page {currentQ.context_page_number}</div>
                    <blockquote className="text-xs text-zinc-500 border-l-2 border-zinc-700 pl-3 italic leading-relaxed">
                      "{currentQ.context_snippet}"
                    </blockquote>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-zinc-100 text-zinc-950 px-6 py-2.5 rounded-xl font-medium hover:bg-white transition-all text-sm"
                >
                  {currentIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom score tracker */}
      <div className="border-t border-zinc-800 px-8 py-3 flex items-center justify-between text-xs font-mono text-zinc-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-500" />
            {correctCount} correct
          </span>
          <span className="flex items-center gap-1.5">
            <XCircle size={12} className="text-red-400" />
            {Object.keys(answers).length - correctCount} incorrect
          </span>
        </div>
        <span className="text-zinc-600">Press A–D to select, Enter to confirm</span>
      </div>
    </div>
  );
}
