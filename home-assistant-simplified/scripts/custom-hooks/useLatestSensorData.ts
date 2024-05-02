import { useState, useEffect } from 'react';
import { useHass, useEntity, useHistory, useSubscribeEntity } from "@hakit/core";

const sensorChannel = ['1', '2']
const sensorVariables = [ 'current',  'energy', 'power', 'voltage']
const channel1 = ['', '2']
const channel2 = ['4','5']

const useLatestSensorData = () => {

    const chan1_data = channel1.map(order => {
        const getCurrentSensor = useSubscribeEntity(`sensor.esphometest_1_current${order}`)
        const getEnergySensor = useSubscribeEntity(`sensor.esphometest_1_energy${order}`)
        const getPowerSensor = useSubscribeEntity(`sensor.esphometest_1_power${order}`)
        const getVoltageSensor = useSubscribeEntity(`sensor.esphometest_1_voltage${order}`)

        const sensors = {
            current: getCurrentSensor(),
            energy: getEnergySensor(),
            power: getPowerSensor(),
            voltage: getVoltageSensor()
        }

        return ({
            name: `sensor_${order}`,
            current: sensors.current?.state,
            energy: sensors.energy?.state,
            power: sensors.power?.state,
            voltage: sensors.voltage?.state
        })
    })

    const chan2_data = channel2.map(order => {
        const getCurrentSensor = useSubscribeEntity(`sensor.esphometest_2_current${order}`)
        const getEnergySensor = useSubscribeEntity(`sensor.esphometest_2_energy${order}`)
        const getPowerSensor = useSubscribeEntity(`sensor.esphometest_2_power${order}`)
        const getVoltageSensor = useSubscribeEntity(`sensor.esphometest_2_voltage${order}`)

        const sensors = {
            current: getCurrentSensor(),
            energy: getEnergySensor(),
            power: getPowerSensor(),
            voltage: getVoltageSensor()
        }

        return ({
            name: `sensor_${order}`,
            current: sensors.current?.state,
            energy: sensors.energy?.state,
            power: sensors.power?.state,
            voltage: sensors.voltage?.state
        })
    })

    const data = [
        ...chan1_data,
        ...chan2_data
    ]

    return { data }
}

export default useLatestSensorData