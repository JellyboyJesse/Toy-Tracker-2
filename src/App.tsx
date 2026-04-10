import { useState } from 'react';
import { useStore } from '@/store';
import { TrackPanel } from '@/components/TrackPanel';
import { GlobalControls } from '@/components/GlobalControls';
import { BounceScreen } from '@/components/BounceScreen';

function App() {
  const tracks = useStore(s => s.tracks);
  const activeSteps = useStore(s => s.activeSteps);
  const [screen, setScreen] = useState<'main' | 'bounce'>('main');

  return (
    <>
      {/* App header */}
      <header className="app-header">
        <h1 className="app-title crayon-text">CRAYON TRACKER SYNTH</h1>
        <p className="app-subtitle">a wiggly music machine</p>
        <button
          className="bounce-screen-btn"
          onClick={() => setScreen(s => s === 'main' ? 'bounce' : 'main')}
        >
          {screen === 'main' ? 'BOUNCE →' : '← BACK'}
        </button>
      </header>

      {screen === 'bounce' ? (
        <BounceScreen />
      ) : (
        <>
          {/* Global transport + knobs */}
          <GlobalControls />

          {/* Track panels — 4 side by side */}
          <div className="tracker-grid">
            {tracks.map(track => (
              <TrackPanel
                key={track.id}
                track={track}
                activeStep={activeSteps[track.id]}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

export default App;
