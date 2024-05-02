import { Column, Group, TimeCard, ButtonCard, SidebarCard, AreaCard, Row } from '@hakit/components';
import { useState, useEffect } from 'react';
import { useHass, useEntity, useHistory } from "@hakit/core";
import { SwitchCard } from './card/cardsIndex';

const Switches = () => {
    return <Column
        fullWidth 
        fullHeight
        style={{
            padding: 15,
            justifyContent: 'flex-start'
        }}
    >
        <Row
            fullWidth
            justifyContent='flex-start'
            alignItems='stretch'
            gap='1rem'
        >
            <ButtonCard
            sm={6}
            md={4}
            lg={4}
            xlg={3}
            service='toggle'
            // active={efanEnabled}
            hideState={false}
            entity='switch.esphometest_1_switch2'
            onClick={() => {
            }}
            />
            <ButtonCard
            sm={6}
            md={4}
            lg={4}
            xlg={3}
            service='toggle'
            // active={efanEnabled}
            hideState={false}
            entity='switch.esphometest_1_switch1'
            onClick={() => {
            }}
            />
            <ButtonCard
            sm={6}
            md={4}
            lg={4}
            xlg={3}
            service='toggle'
            // active={efanEnabled}
            hideState={false}
            entity='switch.esphometest_2_switch1'
            onClick={() => {
            }}
            />
            <ButtonCard
            sm={6}
            md={4}
            lg={4}
            xlg={3}
            service='toggle'
            // active={efanEnabled}
            hideState={false}
            entity='switch.esphometest_2_switch2'
            onClick={() => {
            }}
            />
        </Row>
    </Column> 
}

export default Switches

const CustomSwitches = () => {
    return <>
        <div
            className='switches-group'
        >
            <SwitchCard />
        </div>
    </>
}

export {
    CustomSwitches
}
