import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ResultView } from './components/ResultView';
import { Loading } from './components/Loading';
import { fetchPolicyResearch } from './services/geminiService';
import { AppState, FormData, ResearchResult, HistoryItem } from './types';

const HISTORY_KEY = 'policy_scout_history_v1';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.INPUT);
  const [formData, setFormData] = useState<FormData>({
    country: '',
    industry: [], // Initialize as empty array
    query: '',
  });
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load history", e);
    }
  }, []);

  const saveToHistory = (newResult: ResearchResult, form: FormData) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      formData: form,
      result: newResult,
    };
    const updated = [newItem, ...history].slice(0, 5); // Keep last 5
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const handleSubmit = async () => {
    setState(AppState.LOADING);
    setError(null);
    try {
      const data = await fetchPolicyResearch(formData.country, formData.industry, formData.query);
      setResult(data);
      saveToHistory(data, formData);
      setState(AppState.RESULT);
    } catch (err) {
      console.error(err);
      setError("调研服务暂时繁忙，请稍后再试或检查您的网络连接。");
      setState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setState(AppState.INPUT);
    setResult(null);
    setError(null);
    // Optional: clear form, but keeping it might be better UX
    setFormData({ country: '', industry: [], query: '' }); 
  };

  const handleNewSearch = () => {
    setState(AppState.INPUT);
    setResult(null);
    setError(null);
  };

  const handleLoadHistory = (item: HistoryItem) => {
    setFormData(item.formData);
    setResult(item.result);
    setState(AppState.RESULT);
  };

  return (
    <div className="min-h-screen bg-[#F5F6F7] text-gray-900 font-sans selection:bg-lark-100 selection:text-lark-900">
      <Header reset={handleReset} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {state === AppState.INPUT && (
          <InputForm 
            formData={formData} 
            setFormData={setFormData} 
            onSubmit={handleSubmit}
            isSubmitting={false}
            history={history}
            onLoadHistory={handleLoadHistory}
          />
        )}

        {state === AppState.LOADING && <Loading />}

        {state === AppState.RESULT && result && (
          <ResultView 
            data={result} 
            formData={formData} 
            onNewSearch={handleNewSearch} 
          />
        )}

        {state === AppState.ERROR && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100">
              <div className="text-5xl mb-4">😕</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">出了一点小状况</h3>
              <p className="text-gray-600 mb-6">{error || "未知错误"}</p>
              <button 
                onClick={handleNewSearch}
                className="px-6 py-2 bg-lark-500 text-white rounded-lg hover:bg-lark-600 transition-colors"
              >
                重试
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Global HR Policy Scout. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
