import { Column, Group, TimeCard, ButtonCard, SidebarCard, AreaCard } from '@hakit/components';
import { useState, useEffect } from 'react';
import { useHass, useEntity, useHistory } from "@hakit/core";
import { Switches, MyAppliances, CustomSwitches, EnergyDetails } from './areasIndex'
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
            {/* use Switches Component for the Ha-kit provided switches */}
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
            <EnergyDetails />
        </AreaCard>
    </>
}

export default SideBar