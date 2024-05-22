import { Column, Group, TimeCard, ButtonCard, SidebarCard, AreaCard } from '@hakit/components';
import { useState, useEffect } from 'react';
import { useHass, useEntity, useHistory } from "@hakit/core";
import { Switches } from './areasIndex'
import { AirCon, Efan, Monitor, SystemUnit, MenuDownIcon } from '../../constants/icons'
import { MyApplianceCard } from './card/cardsIndex';
import EnergyUsageGraph from './dashboard/energyUsageGraph';

const EnergyDetails = (props: any) => {

    return(
        <div className='energy-details-content'>
            <EnergyUsageGraph />
        </div>
    )
}

export default EnergyDetails

