export type InstrumentType = 'PolySynth' | 'FMSynth' | 'AMSynth' | 'MembraneSynth' | 'PluckSynth' | 'Sample';
export type EffectCode = 'V' | 'P' | 'D' | 'C'; // volume, pitch, delay, cutoff

export interface Step {
  note: string; // 'C4', 'D#3', '---'
  instrument: InstrumentType;
  effect: EffectCode | null;
  effectValue: number; // 0-255
  repeat: number; // 1 = normal, 2-8 = stutter
}

export interface Track {
  id: 0 | 1 | 2 | 3;
  color: string;
  steps: Step[];
  volume: number; // 0-1
  tempo: number; // playbackRate multiplier 0.25-4
  bounce: number; // 0-1
  bounceDirection: 'forward' | 'reverse';
  sampleBuffer: AudioBuffer | null;
  sampleName: string | null;
}

export interface AppState {
  tracks: Track[];
  playing: boolean;
  bpm: number; // 60-200
  volume: number; // 0-1
  filterFreq: number; // 0-1
  swing: number; // 0-1
  activeSteps: [number, number, number, number];
  ballPositions: [number, number, number, number];
}
