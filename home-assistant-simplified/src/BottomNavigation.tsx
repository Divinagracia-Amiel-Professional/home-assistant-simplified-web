import * as React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { TelevisionIcon, LightningBoltIcon, ToggleSwitchOutlineIcon, ViewDashboardIcon, HeaderBG } from '../constants/icons'
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

const FixedBottomNavigation = () => {
  const [value, setValue] = React.useState('dashboard');
  const ref = React.useRef<HTMLDivElement>(null);
  const {
    width: screenWidth,
    height: screemHeight
  } = useWindowDimensions()

  console.log(value)

  return (
    <div
        className='bottom-navigation-container'
    >
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
  );
}

const getScreenToDisplay = (value: string) => {
    switch(value){
        case 'energy': 
            return <EnergyDetails />
        case 'appliances':
            return <MyAppliances />
        case 'switches': 
            return <CustomSwitches />
        default:
            return <Dashboard />
    }
}

export default FixedBottomNavigation