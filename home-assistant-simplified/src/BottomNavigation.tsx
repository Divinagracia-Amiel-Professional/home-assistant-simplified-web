import * as React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
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

const FixedBottomNavigation = () => {
  const [value, setValue] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);

  console.log(value)

  return (
    <div
        className='bottom-navigation-container'
    >
        {getScreenToDisplay(value)}
        <Box sx={{ pb: 7 }} ref={ref}>
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
            <BottomNavigation
            showLabels
            value={value}
            onChange={(event, newValue) => {
                setValue(newValue);
            }}
            >
            <BottomNavigationAction label="Dashboard" />
            <BottomNavigationAction label="Energy" />
            <BottomNavigationAction label="My Appliances" />
            <BottomNavigationAction label="Switches" />
            </BottomNavigation>
        </Paper>
        </Box>
    </div>  
  );
}

const getScreenToDisplay = (value: number) => {
    switch(value){
        case 1: 
            return <EnergyDetails />
        case 2:
            return <MyAppliances />
        case 3: 
            return <Switches />
        default:
            return <Dashboard />
    }
}

export default FixedBottomNavigation