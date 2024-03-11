import { Column, Group, TimeCard, ButtonCard } from '@hakit/components';
import { useState, useEffect } from 'react';
import { useHass, useEntity, useHistory } from "@hakit/core";
import useSensorData from '../scripts/custom-hooks/useSensorData'

function Dashboard() {
  const [ efanEnabled, setEfanEnabled ] = useState<boolean>(false)
  const { getAllEntities, useStore } = useHass();
  const entities = useStore(store => store.entities);
  const { data: sensorData } = useSensorData()

  const sensor2volt = sensorData[1].voltage.entityHistory[sensorData[1].voltage.entityHistory.length - 1]

  return <Column fullWidth fullHeight>
    <h2>Succesfully Authenticated!</h2>
    <p>The time below should be updating from home asisstant every minute</p>
    <TimeCard />
    <p>You have <b>{Object.keys(getAllEntities()).length}</b> entities to start automating with! Have fun!</p>
    <Group 
      title="Devices"
      style={{
        flexWrap: 'wrap'
      }}
    >
      <ButtonCard
        service='toggle'
        // active={efanEnabled}
        hideState={false}
        entity='switch.esphometest_1_switch2'
        onClick={() => {
          setEfanEnabled(prevState => !prevState)
        }}
        
      />
    </Group>
    <p>Efan is {JSON.stringify(efanEnabled)} 2</p>
    <p>Sensor from history {JSON.stringify(sensor2volt?.s)}</p>
  </Column>
}

export default Dashboard