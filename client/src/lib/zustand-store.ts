import { create } from 'zustand';
import { type GenerationResponse, type HistoryItem, type ContentVariation } from '@shared/schema';

interface BrioStore {
  // Generation state
  isGenerating: boolean;
  selectedObjective: string | null;
  currentTopic: string;
  generatedContent: GenerationResponse | null;
  
  // History state
  history: HistoryItem[];
  
  // Actions
  setIsGenerating: (isGenerating: boolean) => void;
  setSelectedObjective: (objective: string | null) => void;
  setCurrentTopic: (topic: string) => void;
  setGeneratedContent: (content: GenerationResponse | null) => void;
  addToHistory: (item: HistoryItem) => void;
  setHistory: (history: HistoryItem[]) => void;
  
  // API calls
  generateContent: (topic: string, objective?: string) => Promise<void>;
  loadHistory: () => Promise<void>;
}

export const useBrioStore = create<BrioStore>((set, get) => ({
  // Initial state
  isGenerating: false,
  selectedObjective: null,
  currentTopic: '',
  generatedContent: null,
  history: [],
  
  // Actions
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setSelectedObjective: (objective) => set({ selectedObjective: objective }),
  setCurrentTopic: (topic) => set({ currentTopic: topic }),
  setGeneratedContent: (content) => set({ generatedContent: content }),
  
  addToHistory: (item) => set((state) => ({
    history: [item, ...state.history.slice(0, 9)] // Keep only last 10
  })),
  
  setHistory: (history) => set({ history }),
  
  // API calls
  generateContent: async (topic: string, objective?: string) => {
    const { setIsGenerating, setGeneratedContent, addToHistory } = get();
    
    try {
      setIsGenerating(true);
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, objective }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao gerar conteúdo');
      }
      
      const result: GenerationResponse = await response.json();
      setGeneratedContent(result);
      
      // Add to history
      addToHistory({
        id: result.id,
        topic: result.topic,
        codes: result.codesUsed,
        timestamp: result.timestamp,
        objective: result.objective,
      });
      
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  },
  
  loadHistory: async () => {
    try {
      const response = await fetch('/api/history');
      if (response.ok) {
        const history: HistoryItem[] = await response.json();
        set({ history });
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  },
}));
