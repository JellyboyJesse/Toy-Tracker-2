export type InstrumentType = 'PolySynth' | 'FMSynth' | 'AMSynth' | 'MembraneSynth' | 'PluckSynth' | 'Sample';
export type EffectCode = 'V' | 'P' | 'D' | 'C';

export interface Step {
  note: string;
  instrument: InstrumentType;
  effect: EffectCode | null;
  effectValue: number;
  repeat: number; // 1–8
}

export interface Track {
  id: 0 | 1 | 2 | 3;
  color: string;
  steps: Step[];
  volume: number;
  tempo: number;
  bounce: number;
  bounceDirection: 'forward' | 'reverse';
  sampleBuffer: AudioBuffer | null;
  sampleName: string | null;
}

export interface AppState {
  tracks: Track[];
  playing: boolean;
  bpm: number;
  volume: number;
  swing: number;
  activeSteps: [number, number, number, number];
}
