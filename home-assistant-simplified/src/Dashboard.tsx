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
import addUserToFirebase from '../scripts/functions/addUserToFirebase'

const Dashboard = () => {
  const [ efanEnabled, setEfanEnabled ] = useState<boolean>(false)
  const { getAllEntities, useStore, getUser } = useHass();
  const [ user, setUser ] = useState<HassUser | null>(null)
  const entities = useStore(store => store.entities);
  const { data: sensorData } = useSensorData()

  useEffect(() => {
    async function fetchUser() {
      const user = await getUser();
      setUser(user);
    }
    fetchUser();
  }, []) 

  const currentUserData = {
    id: user?.id,
    name: user?.name
  }

  addUserToFirebase(currentUserData)

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
        <p>Efan is {JSON.stringify(efanEnabled)} 2</p>
        {/* <p>Sensor from history {JSON.stringify(sensor2volt?.s)}V, {JSON.stringify(sensor2amp?.s)}A</p>
        <p>Sensor Date: {date.toString() !== "Invalid Date" ? date.toString().slice(4,15) : "...Loading" }</p> */}
        {CallApiExample()}
        <EnergyUsageGraph />
      </Column>
  </Row> 
}

const EnergyUsageGraph = () => {
  // const sensorName = "sensor.esphometest_1_energy2"
  // const sensorData = useSensorHistory(sensorName)

  // console.log(sensorData)
  return <>
  
  </>
}

export default Dashboard