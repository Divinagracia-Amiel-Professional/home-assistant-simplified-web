import { 
  Column, 
  Group, 
  TimeCard, 
  ButtonCard, 
  Row, 
  SidebarCard, 
  AreaCard 
} from '@hakit/components';
import { useState, useEffect } from 'react';
import { useHass, useEntity, useHistory } from "@hakit/core";
import useSensorData from '../scripts/custom-hooks/useSensorData'
import { CallApiExample, useSensorHistory } from '../scripts/custom-hooks/apiHooks'
import groupByMonth from '../scripts/functions/groupByDate';
import SideBar from './components/sidebar';

const Dashboard = () => {
  const [ efanEnabled, setEfanEnabled ] = useState<boolean>(false)
  const { getAllEntities, useStore } = useHass();
  const entities = useStore(store => store.entities);
  const { data: sensorData } = useSensorData()

  // const sensor2volt = sensorData[1].voltage.entityHistory[sensorData[1].voltage.entityHistory.length - 1]
  // const sensor2amp = sensorData[1].current.entityHistory[sensorData[1].current.entityHistory.length - 1]
  // const date = new Date(sensor2volt?.lu * 1000)
  const grouped = groupByMonth(sensorData)

  return <Row
    fullWidth 
    fullHeight
    wrap='nowrap'
    >
      <SideBar />
      <Column
        fullWidth 
        fullHeight
        style={{
          marginTop: 50,
          marginLeft: 15,
          marginRight: 15
        }}
      >
        <p>You have <b>{Object.keys(getAllEntities()).length}</b> entities to start automating with! Have fun!</p>
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
              setEfanEnabled(prevState => !prevState)
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
        <p>Efan is {JSON.stringify(efanEnabled)} 2</p>
        {/* <p>Sensor from history {JSON.stringify(sensor2volt?.s)}V, {JSON.stringify(sensor2amp?.s)}A</p>
        <p>Sensor Date: {date.toString() !== "Invalid Date" ? date.toString().slice(4,15) : "...Loading" }</p> */}
        {CallApiExample()}
        <EnergyUsageGraph />
      </Column>
  </Row> 
}

const EnergyUsageGraph = () => {
  const sensorName = "sensor.esphometest_1_power"
  // const sensorData = useSensorHistory(sensorName)

  // console.log(sensorData)
  return <>
  
  </>
}

export default Dashboard