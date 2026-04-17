import React, { useState, useEffect, useRef } from 'react';
import { Settings, X, Eye, EyeOff, Check } from 'lucide-react';

export type ApiProvider = 'gemini' | 'claude' | 'xai';

export interface ApiConfig {
  provider: ApiProvider;
  apiKey: string;
}

const STORAGE_KEY = 'vn_law_api_config';

const PROVIDERS: { id: ApiProvider; label: string; placeholder: string }[] = [
  { id: 'gemini', label: 'Google Gemini', placeholder: 'AIza...' },
  { id: 'claude', label: 'Anthropic Claude', placeholder: 'sk-ant-...' },
  { id: 'xai', label: 'xAI Grok', placeholder: 'xai-...' },
];

export function loadApiConfig(): ApiConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function ApiKeySettings() {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<ApiProvider>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const config = loadApiConfig();
    if (config) {
      setProvider(config.provider);
      setApiKey(config.apiKey);
    } else {
      const envKey = process.env.GEMINI_API_KEY;
      if (envKey) setApiKey(envKey);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ provider, apiKey }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey('');
    setProvider('gemini');
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors p-1"
        title="API Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Cấu hình API</h3>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Nhà cung cấp</label>
            <div className="flex flex-col gap-1">
              {PROVIDERS.map(p => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md hover:bg-gray-50">
                  <input
                    type="radio"
                    name="provider"
                    value={p.id}
                    checked={provider === p.id}
                    onChange={() => setProvider(p.id)}
                    className="accent-deepsea"
                  />
                  <span className="text-sm text-gray-700">{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={PROVIDERS.find(p => p.id === provider)?.placeholder}
                className="w-full pr-9 pl-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-deepsea font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-deepsea rounded-md hover:bg-kaitoke transition-colors"
            >
              {saved ? <Check className="w-4 h-4" /> : null}
              {saved ? 'Đã lưu' : 'Lưu'}
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Xóa
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
