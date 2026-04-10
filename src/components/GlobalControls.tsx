import { useStore } from '@/store';
import { Knob } from './Knob';
import { TransportButton } from './TransportButton';
import { RoughPanel } from './RoughPanel';
import { audioEngine } from '@/audio/AudioEngine';

const PURPLE = '#9C27B0';

export function GlobalControls() {
  const bpm = useStore(s => s.bpm);
  const volume = useStore(s => s.volume);
  const swing = useStore(s => s.swing);
  const setBpm = useStore(s => s.setBpm);
  const setVolume = useStore(s => s.setVolume);
  const setSwing = useStore(s => s.setSwing);
  const setPlaying = useStore(s => s.setPlaying);

  const bpmKnob = (bpm - 60) / (200 - 60);

  const handlePlay = async () => {
    await audioEngine.start();
    setPlaying(true);
    audioEngine.play();
  };

  const handleStop = () => {
    setPlaying(false);
    audioEngine.stop();
  };

  return (
    <RoughPanel color={PURPLE} padding={10} style={{ width: '100%' }}>
      <div className="global-controls">
        <Knob
          value={bpmKnob}
          onChange={v => {
            const next = Math.round(60 + v * 140);
            setBpm(next);
            audioEngine.setBpm(next);
          }}
          color={PURPLE}
          label="BPM"
          displayValue={`${bpm}`}
        />
        <Knob
          value={volume}
          onChange={v => {
            setVolume(v);
            audioEngine.setMasterVolume(v);
          }}
          color={PURPLE}
          label="Volume"
          displayValue={`${Math.round(volume * 100)}%`}
        />
        <Knob
          value={swing}
          onChange={v => {
            setSwing(v);
            audioEngine.setSwing(v);
          }}
          color={PURPLE}
          label="Swing"
          displayValue={`${Math.round(swing * 100)}%`}
        />
        <div className="transport-group">
          <TransportButton
            label="▶ PLAY"
            color={PURPLE}
            onClick={handlePlay}
          />
          <TransportButton
            label="■ STOP"
            color="#555"
            onClick={handleStop}
          />
        </div>
      </div>
    </RoughPanel>
  );
}
