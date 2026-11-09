export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  metadata?: {
    protocol?: string;
    visionScan?: boolean;
    imagePreview?: string;
  };
}

export interface ChatThread {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface TelemetryData {
  status: string;
  arcCoreOutput: string;
  coreTemp: string;
  cpuPercent: number;
  ramPercent: number;
  neuralThroughput: string;
  repulsorReadiness: string;
  suitModel: string;
  securityStatus: string;
  activeSubroutines: number;
  uptimeSeconds: number;
  timestamp: string;
}

export interface ProtocolAction {
  id: string;
  title: string;
  code: string;
  description: string;
  status: 'READY' | 'ACTIVE' | 'STANDBY';
  category: 'ARMOR' | 'DEFENSE' | 'TACTICAL' | 'FLIGHT';
}
