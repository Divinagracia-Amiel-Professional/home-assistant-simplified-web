import { Column, Group, TimeCard, ButtonCard } from '@hakit/components';
import { useState, useEffect, useMemo, memo } from 'react';
import { useHass, useEntity, useHistory } from '@hakit/core';
import { Axis, VictoryBar } from 'victory';
import useSensorHistory, { UseHistoryParams } from '../../../scripts/custom-hooks/useSensorHistory';
import useLocalDatabase, { UseAllHistoryParams } from '../../../scripts/custom-hooks/useLocalDatabase';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import {
  VictoryChart,
  VictoryVoronoiContainer,
  VictoryLabel,
  VictoryStack,
  VictoryHistogram,
  VictoryAxis,
  VictoryLegend,
  VictoryTooltip,
} from 'victory';
import { Slider } from '@mui/material';
import { DatabaseOffOutlineIcon } from '../../../constants/icons';
import useWindowDimensions from '../../../scripts/custom-hooks/useWindowDimensions';
import { fill } from 'lodash';

const customStyleLabel = {
  '.MuiFormControlLabel-label': {
    color: 'var(--ha-900)',
    fontFamily: 'Poppins',
    fontWeight: 700,
  },
};
const customStyleCheck = {
  color: 'var(--ha-900)',
  '&.Mui-checked': {
    color: 'var(--ha-900)',
  },
};

const textStyle = {
  fontFamily: 'Poppins',
  fontWeight: 700,
  fontStyle: 'normal',
  fill: 'var(--ha-900)',
};

//style of axis
const sharedAxisStyles = {
  axis: { stroke: 'transparent' },
  grid: { stroke: 'transparent' },
  tickLabels: {
    ...textStyle,
  },
  axisLabel: {
    padding: 39,
    fontSize: 13,
    fontStyle: 'italic',
  },
};

const colorScale = ['var(--ha-900)', 'var(--ha-800)', 'var(--ha-400)', 'var(--ha-200)'];

const EnergyUsageGraph = (props: any) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sliderVal, setSliderVal] = useState<number>(0);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // const [ page, setPage ] = useState<number>(0)
  // const [ historyParams, setHistoryParams ] = useState<UseAllHistoryParams>(null)
  const [selected, setSelected] = useState({
    AC: true,
    Efan: true,
    PC: true,
    Monitor: true,
  });

  useEffect(() => {
    setSliderVal(0);
  }, [props?.historyParams]);

  const handleSelected = (device: string) => {
    setSelected(prevState => ({
      ...prevState,
      [device]: !prevState[device],
    }));
  };

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setSliderVal(newValue as number);
  };

  // const historyData = useAllSensorHistory(defaultParams)
  // console.log(historyData)

  const { EFan: EfanData, AC: ACData, Monitor: MonitorData, PC: PCData } = useLocalDatabase(props.historyParams);

  const dataGroup = {
    Efan: EfanData?.arr,
    AC: ACData?.arr,
    Monitor: MonitorData?.arr,
    PC: PCData?.arr,
  };

  console.log(dataGroup);
  // useEffect(() => {
  //     Object.entries(dataGroup).forEach(([key, value]) => {
  //         if(value){
  //             setSelected(prevState => ({
  //                 ...prevState,
  //                 [key]: !prevState[key]
  //             }))
  //         }
  //     })
  // }, [dataGroup])

  const SensorData = [EfanData, ACData, MonitorData, PCData];

  // const selectedData = Object.entries(dataGroup).filter(([key, value]) => {
  //     return selected[key]
  // }).map(item => item[1])

  // console.log(selectedData)

  const haveValues = Object.entries(dataGroup).filter(([key, val]) => val);

  const itemLength = haveValues.length ? haveValues[0][1].length : 0;

  const numberOfItems = itemLength ? (Math.floor(itemLength / 6) > 0 ? 6 : itemLength) : 1;

  const from = sliderVal * numberOfItems;
  const to = Math.min((sliderVal + 1) * numberOfItems, itemLength);

  const minPage = 0;
  const maxPage = Math.ceil(itemLength / 6) - 1;

  const PagedData = haveValues.length ? haveValues.map(([name, data]) => [name, data.slice(from, to)]) : null;

  // console.log(PagedData)

  const VictoryChartComponent = (props: any) => {
    return (
      <VictoryChart
        height={screenHeight * 0.7}
        width={screenWidth > 600 ? 500 : screenWidth}
        containerComponent={
          <VictoryVoronoiContainer
            style={{}}
            labels={datum => {
              console.log(datum);
            }}
          />
        }
      >
        <VictoryLegend
          x={35}
          orientation='horizontal'
          gutter={20}
          colorScale={colorScale}
          data={PagedData?.flatMap(([name, data], index, arr) => ({ name: name, labels: { ...textStyle, fill: colorScale[index] } }))}
        />
        <VictoryStack domainPadding={2.5} colorScale={colorScale}>
          {PagedData.map(([key, data], index, arr) => {
            return (
              <VictoryBar
                barRatio={1.4}
                cornerRadius={
                  {
                    // topLeft: index === arr.length - 1 ? 10 : 0,
                    // topRight: index === arr.length - 1 ? 10 : 0
                    // topLeft: 10,
                    // topRight: 10
                  }
                }
                labelComponent={
                  <VictoryTooltip
                    flyoutPadding={{
                      top: 10,
                      bottom: 10,
                      left: 20,
                      right: 20,
                    }}
                    flyoutStyle={{
                      fill: 'var(--ha-S50)',
                      strokeWidth: 0,
                      filter: 'drop-shadow( 0px 0px 5px var(--ha-S500))',
                    }}
                    style={{
                      ...textStyle,
                    }}
                  />
                }
                labels={({ datum }) => `Energy for ${key}: ${datum[1]} kWh`}
                data={data}
                x={0}
                y={1}
                // events={[{
                //     target: 'data',
                //     eventHandlers: {
                //       onClick: (event, data) => {
                //         console.log(`clicked ${JSON.stringify(data.datum)}`)
                //       },
                //     },
                // }]}
              />
            );
          })}
        </VictoryStack>

        <VictoryAxis
          // tickValues={[1, 2, 3, 4]}
          // tickFormat={["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"]}
          style={sharedAxisStyles}
          // tickLabelComponent={
          //     <VictoryLabel
          //         style={{
          //             fill: 'var(--ha-900)'
          //         }}
          //     />
          // }
        />

        {/* <VictoryAxis
                    dependentAxis
                    style={sharedAxisStyles}
                /> */}
      </VictoryChart>
    );
  };

  return (
    <div className='energy-usage-graph'>
      {/* <p>{sliderVal}</p>
        <p>{`from: ${from} to ${to}`}</p>
        <p>{`min: ${minPage} max: ${maxPage}`}</p> */}
      <FormGroup
        row
        style={{
          gap: 0,
        }}
      >
        <div className='energy-usage-graph-content'>
          <div className='energy-usage-graph-section display-none'>
            <FormControlLabel
              sx={customStyleLabel}
              control={
                <Checkbox
                  sx={customStyleCheck}
                  checked={selected.AC}
                  onChange={() => {
                    handleSelected('AC');
                  }}
                />
              }
              label='AC'
            />
            <FormControlLabel
              sx={customStyleLabel}
              control={
                <Checkbox
                  sx={customStyleCheck}
                  checked={selected.Efan}
                  onChange={() => {
                    handleSelected('Efan');
                  }}
                />
              }
              label='Efan'
            />
            <FormControlLabel
              sx={customStyleLabel}
              control={
                <Checkbox
                  sx={customStyleCheck}
                  checked={selected.PC}
                  onChange={() => {
                    handleSelected('PC');
                  }}
                />
              }
              label='PC'
            />
            <FormControlLabel
              sx={customStyleLabel}
              control={
                <Checkbox
                  sx={customStyleCheck}
                  checked={selected.Monitor}
                  onChange={() => {
                    handleSelected('Monitor');
                  }}
                />
              }
              label='Monitor'
            />
          </div>
          <div className='energy-usage-graph-legend-container'></div>
          <div className='energy-usage-graph-section'>{PagedData ? <VictoryChartComponent /> : <NoDataComponent />}</div>
          <div
            className='energy-usage-graph-section'
            style={{
              display: maxPage > 0 ? 'flex' : 'none',
            }}
          >
            <Slider
              value={typeof sliderVal === 'number' ? sliderVal : 0}
              onChange={handleSliderChange}
              sx={{ width: '50vw' }}
              step={1}
              marks
              min={minPage}
              max={maxPage}
              // min={0}
              // max={1}
            />
          </div>
        </div>
      </FormGroup>
    </div>
  );
};

const NoDataComponent = (props: any) => {
  return (
    <div className='no-data-component'>
      <DatabaseOffOutlineIcon size={96} color={'var(--ha-S300)'} />
      <p
        className='time-range-text poppins-bold'
        style={{
          color: 'var(--ha-S300)',
          textAlign: 'center',
        }}
      >
        There is no data <br /> available
      </p>
    </div>
  );
};

export default memo(EnergyUsageGraph);
