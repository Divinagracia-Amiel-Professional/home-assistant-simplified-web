import { Column, Group, TimeCard, ButtonCard, SidebarCard, AreaCard } from '@hakit/components';
import { useState, useEffect } from 'react';
import { useHass, useEntity, useHistory } from "@hakit/core";


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
            Switches
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
            My Appliances
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
        </AreaCard>
    </>
}

export default SideBar