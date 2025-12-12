import React, { useState, useRef, useEffect } from 'react';
import { COUNTRIES, INDUSTRIES } from '../constants';
import { FormData, HistoryItem } from '../types';

interface InputFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  history: HistoryItem[];
  onLoadHistory: (item: HistoryItem) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  isSubmitting,
  history,
  onLoadHistory
}) => {
  const [isIndustryOpen, setIsIndustryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsIndustryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleIndustry = (industry: string) => {
    const current = formData.industry;
    const isSelected = current.includes(industry);
    let updated: string[];
    
    if (isSelected) {
      updated = current.filter(i => i !== industry);
    } else {
      updated = [...current, industry];
    }
    
    setFormData({ ...formData, industry: updated });
  };

  const isFormValid = formData.country && formData.industry.length > 0 && formData.query.length > 5;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          出海用工政策调研
        </h1>
        <p className="text-lg text-gray-600">
          基于 Gemini 2.5 实时搜索，为您提供最地道的全球用工合规与实践指引。
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">目标国家/地区</label>
            <div className="relative">
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-lark-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer hover:bg-gray-100"
              >
                <option value="" disabled>请选择国家或地区</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="space-y-2 relative" ref={dropdownRef}>
            <label className="block text-sm font-semibold text-gray-700">所属行业 (可多选)</label>
            <div 
              onClick={() => setIsIndustryOpen(!isIndustryOpen)}
              className="w-full min-h-[46px] px-3 py-2 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-lark-500 border-transparent outline-none transition-all cursor-pointer hover:bg-gray-100 flex flex-wrap gap-2 items-center"
            >
              {formData.industry.length === 0 && <span className="text-gray-500 ml-1">请选择行业</span>}
              {formData.industry.map(ind => (
                <span key={ind} className="inline-flex items-center px-2 py-1 rounded bg-lark-100 text-lark-700 text-xs font-medium">
                  {ind.split(' ')[0]} 
                  <span className="ml-1 cursor-pointer hover:text-lark-900" onClick={(e) => { e.stopPropagation(); toggleIndustry(ind); }}>&times;</span>
                </span>
              ))}
              <div className="absolute right-3 top-[38px] pointer-events-none text-gray-500">
                 <svg className={`h-4 w-4 transform transition-transform ${isIndustryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            
            {isIndustryOpen && (
              <div className="absolute z-20 mt-2 w-full bg-white shadow-xl rounded-xl border border-gray-100 max-h-60 overflow-y-auto p-2">
                {INDUSTRIES.map((i) => (
                  <div 
                    key={i} 
                    onClick={() => toggleIndustry(i)}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className={`w-4 h-4 rounded border mr-3 flex items-center justify-center transition-colors ${formData.industry.includes(i) ? 'bg-lark-500 border-lark-500' : 'border-gray-300'}`}>
                      {formData.industry.includes(i) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                    </div>
                    <span className="text-sm text-gray-700">{i}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mb-8 space-y-2">
          <label className="block text-sm font-semibold text-gray-700">调研问题 / Topic</label>
          <div className="relative">
            <textarea
              name="query"
              value={formData.query}
              onChange={handleChange}
              placeholder="例如：请问在德国解雇一名工作3年的员工需要支付多少赔偿金？有没有PIP流程要求？"
              className="w-full p-4 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-lark-500 focus:border-transparent outline-none transition-all min-h-[140px] resize-none hover:bg-gray-100 placeholder-gray-400"
            />
          </div>
           <p className="text-xs text-gray-400 text-right mt-1">越具体的描述能获得越精准的实操建议</p>
        </div>

        <button
          onClick={onSubmit}
          disabled={!isFormValid || isSubmitting}
          className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg shadow-lark-500/30 transition-all transform duration-200
            ${!isFormValid || isSubmitting 
              ? 'bg-gray-300 cursor-not-allowed shadow-none' 
              : 'bg-lark-500 hover:bg-lark-600 hover:-translate-y-1 active:translate-y-0'
            }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              正在深度调研...
            </span>
          ) : (
            '开始调研'
          )}
        </button>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="animate-fade-in">
          <h3 className="text-lg font-bold text-gray-800 mb-4 px-2 flex items-center">
            <span className="mr-2">🕒</span> 最近调研记录
          </h3>
          <div className="space-y-3">
            {history.map((item) => (
              <div 
                key={item.id}
                onClick={() => onLoadHistory(item)}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-lark-200 cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-lark-50 text-lark-700 text-xs rounded-md font-medium">{item.formData.country}</span>
                    {item.formData.industry.slice(0, 2).map(ind => (
                      <span key={ind} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">{ind.split(' ')[0]}</span>
                    ))}
                    {item.formData.industry.length > 2 && <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">+{item.formData.industry.length - 2}</span>}
                  </div>
                  <span className="text-xs text-gray-400">{new Date(item.result.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-lark-600 transition-colors">
                  {item.formData.query}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};