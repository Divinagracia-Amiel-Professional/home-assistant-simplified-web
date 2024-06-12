import { ThemeProvider } from '@hakit/components';
import { HassConnect } from '@hakit/core';
import Dashboard from './Dashboard';
import CustomThemeContext from '../scripts/custom-hooks/customThemeContext';
import { ThemeProvider as MuiTheme } from '@mui/material';
import FixedBottomNavigation from './BottomNavigation';
import { Notifications } from '@bdhamithkumara/react-push-notification';

function App() {
  return (
    <>
      <Notifications position='top_middle' />
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
        <MuiTheme theme>
          {/* <Dashboard /> */}
          <FixedBottomNavigation />
        </MuiTheme>
      </HassConnect>
    </>
  );
}

export default App;
