import { ACEnergy, PCEnergy, MonitorEnergy, EFanEnergy } from "../../assets/sensorData/sensorDataIndex";
import React, { useEffect, useState } from 'react'
import useAllSensorHistory, { UseAllHistoryParams } from './useAllSensoryHistory'

const useLocalDatabase = (props: UseAllHistoryParams) => {
    const data = JSON.parse(JSON.stringify(PCEnergy))
    const parsed = {
        AC: JSON.parse(JSON.stringify(ACEnergy)).default,
        PC: JSON.parse(JSON.stringify(PCEnergy)).default,
        Monitor: JSON.parse(JSON.stringify(MonitorEnergy)).default,
        EFan: JSON.parse(JSON.stringify(EFanEnergy)).default
    }
}

export default useLocalDatabase