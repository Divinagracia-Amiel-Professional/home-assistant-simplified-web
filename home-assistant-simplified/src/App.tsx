import { ThemeProvider } from '@hakit/components';
import { HassConnect } from '@hakit/core';
import Dashboard from './Dashboard';
import CustomThemeContext from '../scripts/custom-hooks/customThemeContext'

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
        globalStyles={`
          @import url('fonts.css');
          body {
            
          }
        `}
        globalComponentStyles={{
          buttonCard: `
            box-shadow: 0 0 5px 2px var(--ha-900);
            background-color: var(--ha-S50);
          `,
        }}
        includeThemeControls 
      />
      <CustomThemeContext.Provider value={{}}>
        <Dashboard />
      </CustomThemeContext.Provider>
    </HassConnect>
  </>
}

export default App;