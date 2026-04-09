import { useState, useCallback, useRef } from 'react';
import { RoughPanel } from './RoughPanel';
import { Knob } from './Knob';
import { StepGrid } from './StepGrid';
import { BallPlayhead } from './BallPlayhead';
import { useStore } from '@/store';
import { audioEngine } from '@/audio/AudioEngine';
import type { Track } from '@/store/types';

const TRACK_NAMES = ['Track 1', 'Track 2', 'Track 3', 'Track 4'];

interface TrackPanelProps {
  track: Track;
  activeStep: number;
}

export function TrackPanel({ track, activeStep }: TrackPanelProps) {
  const setTrackVolume = useStore(s => s.setTrackVolume);
  const setTrackTempo = useStore(s => s.setTrackTempo);
  const setTrackBounce = useStore(s => s.setTrackBounce);
  const setTrackBounceDirection = useStore(s => s.setTrackBounceDirection);
  const setTrackSample = useStore(s => s.setTrackSample);

  const [isDragOver, setIsDragOver] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (!file || !file.name.match(/\.(wav|mp3)$/i)) return;
      try {
        const arrayBuffer = await file.arrayBuffer();
        const ctx = new AudioContext();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        setTrackSample(track.id, audioBuffer, file.name);
      } catch {
        // ignore decode errors
      }
    },
    [track.id, setTrackSample]
  );

  const tempoDisplay = `${track.tempo.toFixed(2)}×`;
  const bpmKnobValue = (track.tempo - 0.25) / (4 - 0.25);

  return (
    <RoughPanel color={track.color} padding={16} style={{ width: '100%' }}>
      {/* Header */}
      <div className="track-header">
        <div className="track-label crayon-text" style={{ color: track.color }}>
          {TRACK_NAMES[track.id]}
        </div>
        <div className="track-knobs">
          <Knob
            value={track.volume}
            onChange={v => {
              setTrackVolume(track.id, v);
              audioEngine.updateTrackVolume(track.id, v);
            }}
            color={track.color}
            label="Vol"
            displayValue={`${Math.round(track.volume * 100)}%`}
          />
          <Knob
            value={bpmKnobValue}
            onChange={v => {
              setTrackTempo(track.id, 0.25 + v * (4 - 0.25));
              audioEngine.updateTrackBounce(track.id);
            }}
            color={track.color}
            label="Tempo"
            displayValue={tempoDisplay}
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Knob
              value={track.bounce}
              onChange={v => {
                setTrackBounce(track.id, v);
                audioEngine.updateTrackBounce(track.id);
              }}
              color={track.color}
              label="Bounce"
              displayValue={`${Math.round(track.bounce * 100)}%`}
            />
            <div style={{ display: 'flex', gap: 2 }}>
              <button
                className={`bounce-dir-btn${track.bounceDirection === 'forward' ? ' active' : ''}`}
                style={{ color: track.bounceDirection === 'forward' ? track.color : undefined }}
                onClick={() => {
                setTrackBounceDirection(track.id, 'forward');
                audioEngine.updateTrackBounce(track.id);
              }}
              >
                ▶ fwd
              </button>
              <button
                className={`bounce-dir-btn${track.bounceDirection === 'reverse' ? ' active' : ''}`}
                style={{ color: track.bounceDirection === 'reverse' ? track.color : undefined }}
                onClick={() => {
                setTrackBounceDirection(track.id, 'reverse');
                audioEngine.updateTrackBounce(track.id);
              }}
              >
                rev ◀
              </button>
            </div>
          </div>
        </div>
        {track.sampleName && (
          <div className="sample-name" style={{ color: track.color }}>
            {track.sampleName}
          </div>
        )}
      </div>

      {/* Grid body with ball playhead */}
      <div
        className="track-body"
        ref={dropRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <BallPlayhead trackId={track.id} color={track.color} bounce={track.bounce} />
        <StepGrid
          trackId={track.id}
          color={track.color}
          steps={track.steps}
          activeStep={activeStep}
        />

        {/* Drop zone overlay */}
        <div
          className={`drop-zone${isDragOver ? ' active' : ''}`}
          style={{ border: isDragOver ? `2px dashed ${track.color}` : undefined }}
        >
          <span>Drop .wav / .mp3 here</span>
        </div>
      </div>
    </RoughPanel>
  );
}
