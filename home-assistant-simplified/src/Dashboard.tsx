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
import DevicesCards from './components/dashboard/devicesCards';
import useWindowDimensions from '../scripts/custom-hooks/useWindowDimensions'
import EnergyUsageSummary from './components/dashboard/energyUsageSummary';
import FixedBottomNavigation from './BottomNavigation';
import Header from './components/header';
import dayjs from 'dayjs';

const Dashboard = () => {
  const [ efanEnabled, setEfanEnabled ] = useState<boolean>(false)
  const { getAllEntities, useStore, getUser } = useHass();
  const [ user, setUser ] = useState<HassUser | null>(null)
  const entities = useStore(store => store.entities);
  const { data: sensorData } = useSensorData()
  const windowDimensions = useWindowDimensions()
  const dateNow = dayjs()
  const dateDisplayString = `${dateNow.format('D')}th ${dateNow.format('MMMM YYYY')}`

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

  const devices = Object.keys(entities).filter(key => {
    return (key.includes('sensor.esphometest') || key.includes('switch.esphometest'))
  })

  // const device1 = entities[devices[0]]
  // test Object.entries
  const dimensionLogic = windowDimensions.width >= 1000 ? 15 : 0

  return( 
    <div
      className='dashboard-container'
      style={{
        marginLeft: dimensionLogic,
        marginRight: dimensionLogic,
      }}
    >
      <Header type={'dashboard'} data={{date: dateDisplayString, user: currentUserData.name}}/>
      <DevicesCards />
      <EnergyUsageSummary user={currentUserData.id}/>
    </div>
)}

export default Dashboard
