import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { AppState, Step, Track, InstrumentType, EffectCode } from './types';

const TRACK_COLORS = ['#4CAF50', '#F44336', '#2196F3', '#FFC107'] as const;

function makeStep(note = '---', instrument: InstrumentType = 'PolySynth'): Step {
  return { note, instrument, effect: null, effectValue: 0, repeat: 1 };
}

// Starter patterns so the sequencer plays immediately
const DEMO_PATTERNS: Array<Array<[string, InstrumentType]>> = [
  // Track 0: melody (PolySynth) — pentatonic
  [
    ['C4', 'PolySynth'], ['---', 'PolySynth'], ['E4', 'PolySynth'], ['---', 'PolySynth'],
    ['G4', 'PolySynth'], ['---', 'PolySynth'], ['A4', 'PolySynth'], ['G4', 'PolySynth'],
    ['E4', 'PolySynth'], ['---', 'PolySynth'], ['D4', 'PolySynth'], ['---', 'PolySynth'],
    ['C4', 'PolySynth'], ['E4', 'PolySynth'], ['G4', 'PolySynth'], ['---', 'PolySynth'],
  ],
  // Track 1: bass (AMSynth)
  [
    ['C3', 'AMSynth'], ['---', 'AMSynth'], ['---', 'AMSynth'], ['C3', 'AMSynth'],
    ['---', 'AMSynth'], ['G3', 'AMSynth'], ['---', 'AMSynth'], ['---', 'AMSynth'],
    ['A2', 'AMSynth'], ['---', 'AMSynth'], ['---', 'AMSynth'], ['A2', 'AMSynth'],
    ['---', 'AMSynth'], ['F3', 'AMSynth'], ['---', 'AMSynth'], ['---', 'AMSynth'],
  ],
  // Track 2: drums (MembraneSynth)
  [
    ['C1', 'MembraneSynth'], ['---', 'MembraneSynth'], ['---', 'MembraneSynth'], ['---', 'MembraneSynth'],
    ['C1', 'MembraneSynth'], ['---', 'MembraneSynth'], ['---', 'MembraneSynth'], ['---', 'MembraneSynth'],
    ['C1', 'MembraneSynth'], ['---', 'MembraneSynth'], ['---', 'MembraneSynth'], ['---', 'MembraneSynth'],
    ['C1', 'MembraneSynth'], ['---', 'MembraneSynth'], ['C1', 'MembraneSynth'], ['---', 'MembraneSynth'],
  ],
  // Track 3: pluck arpeggio (PluckSynth)
  [
    ['---', 'PluckSynth'], ['C5', 'PluckSynth'], ['---', 'PluckSynth'], ['E5', 'PluckSynth'],
    ['---', 'PluckSynth'], ['G5', 'PluckSynth'], ['---', 'PluckSynth'], ['E5', 'PluckSynth'],
    ['---', 'PluckSynth'], ['C5', 'PluckSynth'], ['---', 'PluckSynth'], ['A4', 'PluckSynth'],
    ['---', 'PluckSynth'], ['G4', 'PluckSynth'], ['---', 'PluckSynth'], ['---', 'PluckSynth'],
  ],
];

function makeTrack(id: 0 | 1 | 2 | 3): Track {
  const pattern = DEMO_PATTERNS[id];
  return {
    id,
    color: TRACK_COLORS[id],
    steps: pattern.map(([note, inst]) => makeStep(note, inst)),
    volume: 0.7,
    tempo: 1,
    bounce: 0,
    bounceDirection: 'forward',
    sampleBuffer: null,
    sampleName: null,
  };
}

const initialState: AppState = {
  tracks: [makeTrack(0), makeTrack(1), makeTrack(2), makeTrack(3)],
  playing: false,
  bpm: 120,
  volume: 0.8,
  swing: 0,
  activeSteps: [0, 0, 0, 0],
};

interface Actions {
  setPlaying: (playing: boolean) => void;
  setBpm: (bpm: number) => void;
  setVolume: (volume: number) => void;
  setSwing: (swing: number) => void;
  setTrackVolume: (trackId: number, volume: number) => void;
  setTrackTempo: (trackId: number, tempo: number) => void;
  setTrackBounce: (trackId: number, bounce: number) => void;
  setTrackBounceDirection: (trackId: number, direction: 'forward' | 'reverse') => void;
  setTrackSample: (trackId: number, buffer: AudioBuffer, name: string) => void;
  setStep: (trackId: number, stepIndex: number, partial: Partial<Step>) => void;
  setStepNote: (trackId: number, stepIndex: number, note: string) => void;
  setStepInstrument: (trackId: number, stepIndex: number, instrument: InstrumentType) => void;
  setStepEffect: (trackId: number, stepIndex: number, effect: EffectCode | null) => void;
  setStepEffectValue: (trackId: number, stepIndex: number, value: number) => void;
  setStepRepeat: (trackId: number, stepIndex: number, repeat: number) => void;
  setActiveStep: (trackId: number, step: number) => void;
}

export const useStore = create<AppState & Actions>()(
  immer((set) => ({
    ...initialState,

    setPlaying: (playing) => set((s) => { s.playing = playing; }),
    setBpm: (bpm) => set((s) => { s.bpm = bpm; }),
    setVolume: (volume) => set((s) => { s.volume = volume; }),
    setSwing: (swing) => set((s) => { s.swing = swing; }),

    setTrackVolume: (trackId, volume) => set((s) => { s.tracks[trackId].volume = volume; }),
    setTrackTempo: (trackId, tempo) => set((s) => { s.tracks[trackId].tempo = tempo; }),
    setTrackBounce: (trackId, bounce) => set((s) => { s.tracks[trackId].bounce = bounce; }),
    setTrackBounceDirection: (trackId, direction) => set((s) => {
      s.tracks[trackId].bounceDirection = direction;
    }),
    setTrackSample: (trackId, buffer, name) => set((s) => {
      s.tracks[trackId].sampleBuffer = buffer;
      s.tracks[trackId].sampleName = name;
    }),

    setStep: (trackId, stepIndex, partial) => set((s) => {
      Object.assign(s.tracks[trackId].steps[stepIndex], partial);
    }),
    setStepNote: (trackId, stepIndex, note) => set((s) => {
      s.tracks[trackId].steps[stepIndex].note = note;
    }),
    setStepInstrument: (trackId, stepIndex, instrument) => set((s) => {
      s.tracks[trackId].steps[stepIndex].instrument = instrument;
    }),
    setStepEffect: (trackId, stepIndex, effect) => set((s) => {
      s.tracks[trackId].steps[stepIndex].effect = effect;
    }),
    setStepEffectValue: (trackId, stepIndex, value) => set((s) => {
      s.tracks[trackId].steps[stepIndex].effectValue = value;
    }),
    setStepRepeat: (trackId, stepIndex, repeat) => set((s) => {
      s.tracks[trackId].steps[stepIndex].repeat = repeat;
    }),

    setActiveStep: (trackId, step) => set((s) => { s.activeSteps[trackId] = step; }),
  }))
);
