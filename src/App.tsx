import { useStore } from '@/store';
import { TrackPanel } from '@/components/TrackPanel';
import { GlobalControls } from '@/components/GlobalControls';

function App() {
  const tracks = useStore(s => s.tracks);
  const activeSteps = useStore(s => s.activeSteps);

  return (
    <>
      {/* App header */}
      <header className="app-header">
        <h1 className="app-title crayon-text">CRAYON TRACKER SYNTH</h1>
        <p className="app-subtitle">a wiggly music machine</p>
      </header>

      {/* Global transport + knobs */}
      <GlobalControls />

      {/* Track panels */}
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
  );
}

export default App;
