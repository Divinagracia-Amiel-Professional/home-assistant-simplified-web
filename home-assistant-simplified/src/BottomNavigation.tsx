import * as React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { TelevisionIcon, LightningBoltIcon, ToggleSwitchOutlineIcon, ViewDashboardIcon, HeaderBG, AltLogo } from '../constants/icons'
import Switches from './components/switches';
import { CustomSwitches, Dashboard, MyAppliances, EnergyDetails } from './ScreensIndex'
import { 
    Column, 
    Group, 
    TimeCard, 
    ButtonCard, 
    Row, 
    SidebarCard, 
    AreaCard
} from '@hakit/components';
import useWindowDimensions from '../scripts/custom-hooks/useWindowDimensions';
import useSensorData from '../scripts/custom-hooks/useSensorData';
import useSensorEnergyData from '../scripts/custom-hooks/useSensorEnergyData';

export const HAContext = React.createContext<any>(null)

const FixedBottomNavigation = () => {
  const [value, setValue] = React.useState('dashboard');
  const ref = React.useRef<HTMLDivElement>(null);
  const {
    width: screenWidth,
    height: screenHeight
  } = useWindowDimensions()

  const totalTodayEnergyData = useSensorEnergyData('consumedToday')
  const totalYesterdayEnergyData = useSensorEnergyData('consumedYesterday')
  const usedToday = useSensorData('hoursUsedToday')
  const usedYesterday = useSensorData('hoursUsedYesterday')

  const appliancesData = {
    today: totalTodayEnergyData,
    yesterday: totalYesterdayEnergyData
  }

//   const usedToday = {data: null, isLoading: true}
//   const usedYesterday = {data: null, isLoading: true}

//   const appliancesData = {
//     today: null,
//     yesterday: null
//   }

  return (
    <HAContext.Provider value={{
        usedToday: usedToday,
        usedYesterday: usedYesterday,
        appliancesData: appliancesData
    }}>
        <div
            className='bottom-navigation-container'
        >

            <div 
                className='alt-logo-container'
            >
                <AltLogo fill={'var(--ha-S100)'} height={72} width={72}/>
            </div>
            <div
                className='header-bg-container'
            >
                <HeaderBG fill={'var(--ha-900)'} height={300} width={screenWidth}/>
            </div>
            {getScreenToDisplay(value)}
            <Box sx={{ pb: 7 }} ref={ref}>
            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                <BottomNavigation
                    showLabels
                    value={value}
                    onChange={(event, newValue) => {
                        setValue(newValue);
                    }}
                    sx={{height: 80}}
                >
                <BottomNavigationAction value={'dashboard'} label="Dashboard" icon={<ViewDashboardIcon />} />
                <BottomNavigationAction value={'energy'} label="Energy" icon={<LightningBoltIcon />}/>
                <BottomNavigationAction value={'appliances'} label="My Appliances" icon={<TelevisionIcon />} />
                <BottomNavigationAction value={'switches'} label="Switches" icon={<ToggleSwitchOutlineIcon />} />
                </BottomNavigation>
            </Paper>
            </Box>
        </div>  
    </HAContext.Provider>
  );
}

const getScreenToDisplay = (value: string) => {
    switch(value){
        case 'energy': 
            return <EnergyDetails  />
        case 'appliances':
            return <MyAppliances />
        case 'switches': 
            return <CustomSwitches />
        default:
            return <Dashboard />
    }
}

export default FixedBottomNavigation