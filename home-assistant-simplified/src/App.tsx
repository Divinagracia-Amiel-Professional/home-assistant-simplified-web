import { ThemeProvider } from '@hakit/components';
import { HassConnect } from '@hakit/core';
import Dashboard from './Dashboard';

function App() {
  return <>
    <HassConnect hassUrl={import.meta.env.VITE_HA_URL}>
      <ThemeProvider 
        hue={214}
        lightness={51}
        saturation={90}
        darkMode={false}
        contrastThreshold={65}
        tint={0.5}
        includeThemeControls 
      />
      <Dashboard />
    </HassConnect>
  </>
}

export default App;