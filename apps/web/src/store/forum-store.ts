import { create } from "zustand";
import type { ForumConfig, ForumMessage } from "@/lib/api";

interface PipelineStatus {
  current_node: string;
  progress: number;
  label: string;
}

interface ForumStore {
  sessionId: string | null;
  status: string;
  topic: string;
  currentRound: number;
  maxRounds: number;
  messages: ForumMessage[];
  pipeline: PipelineStatus;
  config: ForumConfig | null;

  setSession: (sessionId: string, config: ForumConfig) => void;
  setStatus: (status: string) => void;
  addMessage: (message: ForumMessage) => void;
  setMessages: (messages: ForumMessage[]) => void;
  updatePipeline: (pipeline: PipelineStatus) => void;
  setRound: (round: number) => void;
  reset: () => void;
}

export const useForumStore = create<ForumStore>((set) => ({
  sessionId: null,
  status: "idle",
  topic: "",
  currentRound: 0,
  maxRounds: 3,
  messages: [],
  pipeline: { current_node: "", progress: 0, label: "" },
  config: null,

  setSession: (sessionId, config) =>
    set({
      sessionId,
      config,
      topic: config.topic,
      maxRounds: config.max_rounds,
      status: "running",
      currentRound: 1,
      messages: [],
    }),

  setStatus: (status) => set({ status }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setMessages: (messages) => set({ messages }),

  updatePipeline: (pipeline) => set({ pipeline }),

  setRound: (round) => set({ currentRound: round }),

  reset: () =>
    set({
      sessionId: null,
      status: "idle",
      topic: "",
      currentRound: 0,
      maxRounds: 3,
      messages: [],
      pipeline: { current_node: "", progress: 0, label: "" },
      config: null,
    }),
}));
