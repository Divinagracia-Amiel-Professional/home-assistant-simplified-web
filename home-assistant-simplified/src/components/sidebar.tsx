import { Column, Group, TimeCard, ButtonCard, SidebarCard, AreaCard } from '@hakit/components';
import { useState, useEffect } from 'react';
import { useHass, useEntity, useHistory } from "@hakit/core";
import { Switches, MyAppliances, CustomSwitches } from './areasIndex'
import { AirCon, Efan, Monitor, SystemUnit } from '../../constants/icons'

const SideBar = () => {
    return <>
        <SidebarCard
          includeTimeCard={false}
        >
        </SidebarCard>
        <AreaCard 
          image={''} 
          title="Switches" 
          icon="mdi:toggle-switch-outline" 
          hash="switches"
          style={{
            display: 'none'
          }}
          >
            <CustomSwitches />
        </AreaCard>
        <AreaCard 
          image={''} 
          title="My Appliances" 
          icon="mdi:television" 
          hash="appliances"
          style={{
            display: 'none'
          }}
          >
            <MyAppliances />
        </AreaCard>
        <AreaCard 
          image={''} 
          title="Energy" 
          icon="mdi:lightning-bolt" 
          hash="energy"
          style={{
            display: 'none'
          }}
          >
            Energy
            <AirCon fill='yellow' width={100} height={100} scale={1}/>
            <Efan fill='yellow' width={100} height={100} scale={1}/> 
            <Monitor fill='yellow' width={100} height={100} scale={.75}/>
            <SystemUnit fill='yellow' width={100} height={100} scale={.75}/>
        </AreaCard>
    </>
}

export default SideBar