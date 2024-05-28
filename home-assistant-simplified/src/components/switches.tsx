import { Column, Group, TimeCard, ButtonCard, SidebarCard, AreaCard, Row } from '@hakit/components';
import { useState, useEffect } from 'react';
import { useHass, useEntity, useHistory } from "@hakit/core";
import { SwitchCard } from './card/cardsIndex';
import useLatestSensorData from '../../scripts/custom-hooks/useLatestSensorData'
import Header from './header';

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

const CustomSwitches = () => {
    const ACSwitch = useEntity('switch.esphometest_1_switch1')
    const EFanSwitch = useEntity('switch.esphometest_1_switch2')
    const MonitorSwitch = useEntity('switch.esphometest_2_switch1')
    const DesktopSwitch = useEntity('switch.esphometest_2_switch2')
    const latestSensorData = useLatestSensorData()

    const destructuredData = {
        AC: latestSensorData.data[0],
        Efan: latestSensorData.data[1],
        Desktop: latestSensorData.data[2],
        Monitor: latestSensorData.data[3],
    }

    // const switchStates = [
    //     ACSwitch?.state, EFanSwitch?.state, MonitorSwitch?.state, DesktopSwitch?.state
    // ]

    const switchStates = [
        {
            power: destructuredData.AC?.power,
            switchState: ACSwitch?.state
        },
        {
            power: destructuredData.Efan?.power,
            switchState: EFanSwitch?.state
        },
        {
            power: destructuredData.Desktop?.power,
            switchState: DesktopSwitch?.state
        },
        {
            power: destructuredData.Monitor?.power,
            switchState: MonitorSwitch?.state
        }
    ]

    let numOfRunning = 0
    switchStates.forEach(state => {
        if(state.switchState === 'off'){
            numOfRunning++
        }
    })

    console.log(destructuredData)

    const numOfDevices = Object.keys(destructuredData).length

    const switchValues = [
        {
            entityName: 'Desktop',
            entityId: 'switch.esphometest_2_switch2',
            iconParams: {
                type: 'SystemUnit',
                dimensions: 50,
            },
            state: DesktopSwitch.state,
            latestSensorData: {
                current: destructuredData.Desktop.current,
                energy: destructuredData.Desktop.energy,
                power: destructuredData.Desktop.power,
                voltage: destructuredData.Desktop.voltage, 
            }
        },
        {
            entityName: 'Monitor',
            entityId: 'switch.esphometest_2_switch1',
            iconParams: {
                type: 'Monitor',
                dimensions: 50,
            },
            state: MonitorSwitch.state,
            latestSensorData: {
                current: destructuredData.Monitor.current,
                energy: destructuredData.Monitor.energy,
                power: destructuredData.Monitor.power,
                voltage: destructuredData.Monitor.voltage, 
            }
        },
        {
            entityName: 'Electric Fan',
            entityId: 'switch.esphometest_1_switch2',
            iconParams: {
                type: 'Efan',
                dimensions: 50,
            },
            state: EFanSwitch.state,
            latestSensorData: {
                current: destructuredData.Efan.current,
                energy: destructuredData.Efan.energy,
                power: destructuredData.Efan.power,
                voltage: destructuredData.Efan.voltage,
            }
        },
        {
            entityName: 'AC',
            entityId: 'switch.esphometest_1_switch1',
            iconParams: {
                type: 'AC',
                dimensions: 50,
            },
            state: ACSwitch.state,
            latestSensorData: {
                current: destructuredData.AC.current,
                energy: destructuredData.AC.energy,
                power: destructuredData.AC.power,
                voltage: destructuredData.AC.voltage,
            }
        },
    ]

    return <div
        className='screen-general-container'
    >
        <Header 
            type={'switches'} 
            data={{
                numOfRunning: numOfRunning,
                numOfDevices: numOfDevices,
            }} 
        />
        <div
            className='switches-group'
        >
            {
                switchValues.map(switches => {
                    return(
                        <SwitchCard 
                            iconParams={{
                                ...switches.iconParams
                            }}
                            entityName={switches.entityName}
                            entityId={switches.entityId}
                            state={switches.state ? switches.state : 'off'}
                            latestSensorData={{
                                ...switches.latestSensorData
                            }}
                        />
                    )
                })
            }
        </div>
    </div>
}

export default Switches

export {
    CustomSwitches
}
