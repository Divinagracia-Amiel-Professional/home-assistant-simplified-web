import { useState, useEffect } from 'react';
import { useHass, useEntity, useHistory } from "@hakit/core";

interface historyData {

}

const sensorChannel = ['1', '2']
const sensorVariables = [ 'current',  'energy', 'power', 'voltage']
const channel1 = ['', '2']
const channel2 = ['4','5']

const useSensorData = () => {
    const chan1_data = channel1.map(order => {
        const currentSensor = useHistory(`sensor.esphometest_1_current${order}`)
        const energySensor = useHistory(`sensor.esphometest_1_energy${order}`)
        const powerSensor = useHistory(`sensor.esphometest_1_power${order}`)
        const voltageSensor = useHistory(`sensor.esphometest_1_voltage${order}`)

        return ({
            name: `sensor_${order}`,
            current: currentSensor,
            energy: energySensor,
            power: powerSensor,
            voltage: voltageSensor
        })
    })

    const chan2_data = channel2.map(order => {
        const currentSensor = useHistory(`sensor.esphometest_2_current${order}`)
        const energySensor = useHistory(`sensor.esphometest_2_energy${order}`)
        const powerSensor = useHistory(`sensor.esphometest_2_power${order}`)
        const voltageSensor = useHistory(`sensor.esphometest_2_voltage${order}`)

        return ({
            name: `sensor_${order}`,
            current: currentSensor,
            energy: energySensor,
            power: powerSensor,
            voltage: voltageSensor
        })
    })

    const data = {
        ...chan1_data,
        ...chan2_data
    }

    return { data }
}

export default useSensorData

