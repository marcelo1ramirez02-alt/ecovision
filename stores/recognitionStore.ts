import { create } from 'zustand';
import { RecognitionRecord, RecognitionResult } from '../types/recognition';

interface RecognitionState {
  currentCaptureUri: string | null;
  latestResult: RecognitionResult | null;
  latestRecord: RecognitionRecord | null;
  history: RecognitionRecord[];
  isAnalyzing: boolean;
  setCaptureUri: (uri: string | null) => void;
  setLatestResult: (result: RecognitionResult | null, record?: RecognitionRecord | null) => void;
  setHistory: (records: RecognitionRecord[]) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  reset: () => void;
}

export const useRecognitionStore = create<RecognitionState>((set) => ({
  currentCaptureUri: null,
  latestResult: null,
  latestRecord: null,
  history: [],
  isAnalyzing: false,

  setCaptureUri: (uri) => set({ currentCaptureUri: uri }),
  setLatestResult: (result, record = null) =>
    set({ latestResult: result, latestRecord: record }),
  setHistory: (records) => set({ history: records }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  reset: () =>
    set({
      currentCaptureUri: null,
      latestResult: null,
      latestRecord: null,
      isAnalyzing: false,
    }),
}));
