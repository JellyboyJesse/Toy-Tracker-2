import * as Tone from 'tone';
import { computeBounceOffsets, computeStepDurations } from './bounce';
import { useStore } from '@/store';
import type { InstrumentType } from '@/store/types';

interface TrackEngine {
  poly: Tone.PolySynth;
  fm: Tone.FMSynth;
  am: Tone.AMSynth;
  membrane: Tone.MembraneSynth;
  pluck: Tone.PluckSynth;
  player: Tone.Player;
  gain: Tone.Gain;
  part: Tone.Part | null;
}

class AudioEngine {
  private started = false;
  private masterGain: Tone.Gain | null = null;
  private tracks: TrackEngine[] = [];
  private swing = 0;

  async start() {
    if (this.started) return;
    await Tone.start();
    this.started = true;
    this.buildGraph();
  }

  private buildGraph() {
    this.masterGain = new Tone.Gain(useStore.getState().volume);
    this.masterGain.toDestination();

    for (let id = 0; id < 4; id++) {
      const gain = new Tone.Gain(useStore.getState().tracks[id].volume);
      gain.connect(this.masterGain!);

      const poly = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'triangle' } });
      const fm = new Tone.FMSynth();
      const am = new Tone.AMSynth();
      const membrane = new Tone.MembraneSynth();
      const pluck = new Tone.PluckSynth();
      const player = new Tone.Player();

      [poly, fm, am, membrane, pluck, player].forEach(n => n.connect(gain));

      this.tracks.push({ poly, fm, am, membrane, pluck, player, gain, part: null });
    }
  }

  play() {
    const state = useStore.getState();
    Tone.getTransport().bpm.value = state.bpm;

    for (let id = 0; id < 4; id++) {
      this.buildPart(id as 0 | 1 | 2 | 3);
    }

    Tone.getTransport().start();
  }

  stop() {
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    for (const track of this.tracks) {
      track.part?.dispose();
      track.part = null;
    }
    const store = useStore.getState();
    for (let i = 0; i < 4; i++) {
      store.setActiveStep(i, 0);
    }
  }

  private buildPart(trackId: 0 | 1 | 2 | 3) {
    const te = this.tracks[trackId];
    if (te.part) {
      te.part.dispose();
      te.part = null;
    }

    const state = useStore.getState();
    const track = state.tracks[trackId];

    const beatDuration = 60 / state.bpm;
    const loopDuration = (16 * beatDuration) / track.tempo;

    const offsets = computeBounceOffsets(track.bounce, track.bounceDirection, loopDuration, this.swing);
    const durations = computeStepDurations(offsets, loopDuration);

    const events: Array<{ time: number; stepIndex: number; duration: number }> = offsets.map(
      (t, i) => ({ time: t, stepIndex: i, duration: durations[i] })
    );

    const part = new Tone.Part<{ time: number; stepIndex: number; duration: number }>(
      (time, ev) => {
        const currentState = useStore.getState();
        const currentTrack = currentState.tracks[trackId];
        const step = currentTrack.steps[ev.stepIndex];

        Tone.getDraw().schedule(() => {
          useStore.getState().setActiveStep(trackId, ev.stepIndex);
        }, time);

        if (step.note === '---') return;

        const repeat = Math.max(1, Math.min(8, step.repeat));
        const slotDuration = ev.duration;
        const noteDuration = Math.max(0.02, (slotDuration / repeat) * 0.8);

        for (let r = 0; r < repeat; r++) {
          const t = time + (r / repeat) * slotDuration;
          this.triggerStep(trackId, step.note, step.instrument, noteDuration, t);
        }
      },
      events
    );

    part.loop = true;
    part.loopEnd = loopDuration;
    part.start(0);

    te.part = part;
  }

  private triggerStep(
    trackId: number,
    note: string,
    instrumentType: InstrumentType,
    duration: number,
    time: number
  ) {
    const te = this.tracks[trackId];

    if (instrumentType === 'Sample') {
      const buf = useStore.getState().tracks[trackId].sampleBuffer;
      if (buf) {
        te.player.buffer = new Tone.ToneAudioBuffer(buf);
        te.player.start(time);
      }
      return;
    }

    try {
      switch (instrumentType) {
        case 'PolySynth':
          te.poly.triggerAttackRelease(note, duration, time);
          break;
        case 'FMSynth':
          te.fm.triggerAttackRelease(note, duration, time);
          break;
        case 'AMSynth':
          te.am.triggerAttackRelease(note, duration, time);
          break;
        case 'MembraneSynth':
          te.membrane.triggerAttackRelease(note, duration, time);
          break;
        case 'PluckSynth':
          te.pluck.triggerAttack(note, time);
          break;
      }
    } catch {
      // ignore invalid notes
    }
  }

  setBpm(bpm: number) {
    if (!this.started) return;
    Tone.getTransport().bpm.value = bpm;
    if (useStore.getState().playing) {
      for (let id = 0; id < 4; id++) {
        this.buildPart(id as 0 | 1 | 2 | 3);
      }
    }
  }

  setMasterVolume(v: number) {
    this.masterGain?.gain.rampTo(v, 0.05);
  }

  setSwing(swing: number) {
    this.swing = swing;
  }

  updateTrackVolume(trackId: number, v: number) {
    this.tracks[trackId]?.gain.gain.rampTo(v, 0.05);
  }

  updateTrackBounce(trackId: 0 | 1 | 2 | 3) {
    if (useStore.getState().playing) {
      this.buildPart(trackId);
    }
  }
}

export const audioEngine = new AudioEngine();
