import { Column, Group, TimeCard, ButtonCard } from '@hakit/components';
import { useState, useEffect } from 'react';
import { useHass, useEntity, useHistory } from "@hakit/core";
import { VictoryBar } from 'victory';
import useSensorHistory, { UseHistoryParams } from '../../../scripts/custom-hooks/useSensorHistory';
import useAllSensorHistory, { UseAllHistoryParams } from '../../../scripts/custom-hooks/useAllSensoryHistory'
import useLocalDatabase from '../../../scripts/custom-hooks/useLocalDatabase'
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Efan } from '../../../constants/icons';
import { 
    VictoryChart,
    VictoryVoronoiContainer,
    VictoryLabel,
    VictoryStack,
    VictoryHistogram,
    VictoryAxis 
} from 'victory';

const customStyleLabel = {
    '.MuiFormControlLabel-label': {
        color: 'var(--ha-900)',
        fontFamily: 'Poppins',
        fontWeight: 700
    }
}
const customStyleCheck = {
    color: 'var(--ha-900)',
    '&.Mui-checked': {
        color: 'var(--ha-900)',
    },
}

//style of axis
const sharedAxisStyles = {
    tickLabels: {
      fontSize: 13
    },
    axisLabel: {
      padding: 39,
      fontSize: 13,
      fontStyle: "italic"
    }
  };

const EnergyUsageGraph = (props: any) => {
    const [ historyParams, setHistoryParams ] = useState<UseHistoryParams>()
    const [ selected, setSelected ] = useState({
        AC: false,
        Efan: false,
        PC: false,
        Monitor: false,
    })

    const handleSelected = (device: string) => {
        setSelected(prevState => ({
            ...prevState,
            [device]: !prevState[device]
        }))
    }

    const params: UseAllHistoryParams = {
        userId: props.user,
        startTime: '2024-04-17T00:00:00.000+08:00',
        endTime: '2024-04-20T00:00:00.000+08:00',
    }
   
    // const historyData = useAllSensorHistory(defaultParams)
    // console.log(historyData)

    const data = useLocalDatabase(params)

    return <div
        className='energy-usage-graph'
    >
        <FormGroup
            row
            style={{
                gap: 0,
            }}
        >
            <FormControlLabel sx={customStyleLabel} control={<Checkbox sx={customStyleCheck} checked={selected.AC} onChange={() => { handleSelected('AC') }}/>} label="AC" />
            <FormControlLabel sx={customStyleLabel} control={<Checkbox sx={customStyleCheck} checked={selected.Efan} onChange={() => { handleSelected('Efan') }}/>} label="Efan" />
            <FormControlLabel sx={customStyleLabel} control={<Checkbox sx={customStyleCheck} checked={selected.PC} onChange={() => { handleSelected('PC') }}/>} label="PC" />
            <FormControlLabel sx={customStyleLabel} control={<Checkbox sx={customStyleCheck} checked={selected.Monitor} onChange={() => { handleSelected('Monitor') }}/>} label="Monitor" />
            <p>{data.type}</p>
        </FormGroup>
    </div>
}

export default EnergyUsageGraph