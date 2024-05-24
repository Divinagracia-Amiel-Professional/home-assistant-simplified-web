import { Column, Group, TimeCard, ButtonCard } from '@hakit/components';
import { useState, useEffect } from 'react';
import { useHass, useEntity, useHistory } from "@hakit/core";
import { VictoryBar } from 'victory';
import useSensorHistory, { UseHistoryParams } from '../../../scripts/custom-hooks/useSensorHistory';
import useLocalDatabase, { UseAllHistoryParams } from '../../../scripts/custom-hooks/useLocalDatabase'
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { 
    VictoryChart,
    VictoryVoronoiContainer,
    VictoryLabel,
    VictoryStack,
    VictoryHistogram,
    VictoryAxis 
} from 'victory';
import { Slider } from '@mui/material';

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
    grid: {stroke: 'transparent'},
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
    const [ isLoading, setIsLoading ] = useState<boolean>(false)
    const [ sliderVal, setSliderVal ] = useState<number>(0)

    // const [ page, setPage ] = useState<number>(0)
    // const [ historyParams, setHistoryParams ] = useState<UseAllHistoryParams>(null)
    const [ selected, setSelected ] = useState({
        AC: false,
        Efan: false,
        PC: false,
        Monitor: false,
    })

    useEffect(() => {
        setSliderVal(0)
    }, [ props?.historyParams ])

    const handleSelected = (device: string) => {
        setSelected(prevState => ({
            ...prevState,
            [device]: !prevState[device]
        }))
    }

    const handleSliderChange = (event: Event, newValue: number | number[]) => {
        setSliderVal(newValue as number);
    };
   
    // const historyData = useAllSensorHistory(defaultParams)
    // console.log(historyData)

    const {
        EFan: EfanData,
        AC: ACData,
        Monitor: MonitorData,
        PC: PCData
    } = useLocalDatabase(props.historyParams)

    const dataGroup = {
        Efan: EfanData?.arr,
        AC: ACData?.arr,
        Monitor: MonitorData?.arr,
        PC: PCData?.arr
    }

    const SensorData = [EfanData, ACData, MonitorData, PCData]

    const haveValues = SensorData.filter(data => data)
    const itemLength = haveValues.length ? haveValues[0].arr.length : 0 

    const numberOfItems = itemLength ? (Math.floor(itemLength / 6) > 0 ? 6 : itemLength ) : 1

    const from = sliderVal * numberOfItems
    const to = Math.min((sliderVal + 1) * numberOfItems, itemLength);

    const minPage = 0
    const maxPage = Math.ceil(itemLength / 6) 

    const PagedData = haveValues.length ? haveValues.map(data => data.arr.slice(from, to)) : null

    console.log(PagedData)

    const VictoryChartComponent = (props: any) => {
        return(
            <VictoryChart>
                <VictoryStack
                    domainPadding={10}
                    colorScale={[
                        "var(--ha-900)",
                        "var(--ha-700)",
                        "var(--ha-500)",
                        "var(--ha-300)",
                        // "#d45087",
                        // "#f95d6a",
                        // "#ff7c43",
                        // "#ffa600"
                    ]}
                >
                    {
                        PagedData.map(data => {
                            return(
                                <VictoryBar 
                                    barRatio={1}
                                    data={data}
                                    x={0}
                                    y={1}
                                />
                            )
                        }) 
                    }
                </VictoryStack>

                <VictoryAxis
                    // tickValues={[1, 2, 3, 4]}
                    // tickFormat={["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"]}
                    style={sharedAxisStyles}
                />

                {/* <VictoryAxis
                    dependentAxis
                    style={sharedAxisStyles}
                /> */}
            </VictoryChart>
        ) 
    }
    
    return <div
        className='energy-usage-graph'
    >
        <p>{sliderVal}</p>
        <p>{`from: ${from} to ${to}`}</p>
        <p>{`min: ${minPage} max: ${maxPage}`}</p>
        <FormGroup
            row
            style={{
                gap: 0,
            }}
        >
            <div
                className='energy-usage-graph-content'
            >
                <div
                    className='energy-usage-graph-section'
                >
                    <FormControlLabel sx={customStyleLabel} control={<Checkbox sx={customStyleCheck} checked={selected.AC} onChange={() => { handleSelected('AC') }}/>} label="AC" />
                    <FormControlLabel sx={customStyleLabel} control={<Checkbox sx={customStyleCheck} checked={selected.Efan} onChange={() => { handleSelected('Efan') }}/>} label="Efan" />
                    <FormControlLabel sx={customStyleLabel} control={<Checkbox sx={customStyleCheck} checked={selected.PC} onChange={() => { handleSelected('PC') }}/>} label="PC" />
                    <FormControlLabel sx={customStyleLabel} control={<Checkbox sx={customStyleCheck} checked={selected.Monitor} onChange={() => { handleSelected('Monitor') }}/>} label="Monitor" />
                </div>
                <div
                    className='energy-usage-graph-section'
                >
                    {PagedData ? <VictoryChartComponent /> : <NoDataComponent />}
                </div>
                <div
                    className='energy-usage-graph-section'
                    style={{
                        display: maxPage > 1 ? 'flex' : 'none'
                    }}
                >
                    <Slider 
                        value={typeof sliderVal === 'number' ? sliderVal : 0}
                        onChange={handleSliderChange}
                        sx={{width: "50vw"}}
                        step={1}
                        marks
                        min={minPage}
                        max={maxPage}
                    />
                </div>
            </div>
        </FormGroup>
    </div>
}

const NoDataComponent = (props: any) => {
    return(
        <div
            className='no-data-component'
        >
            <p>There is no data</p>
        </div>
    )
}

export default EnergyUsageGraph