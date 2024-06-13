import { useState, useEffect } from 'react';
import { useHass, useEntity, useHistory } from '@hakit/core';
import { TimeFrame } from './useLocalDatabase';
import useCounter from './useCounter';
import { getHourMinuteFormat } from '../functions/getMDYFormat';
import { getDeviceName } from './useSensorData';
import { doRoundNumber } from './useLocalDatabase';

const sensorChannel = ['1', '2'];
const sensorVariables = ['current', 'energy', 'power', 'voltage'];
const channel1 = ['', '2'];
const channel2 = ['4', '5'];

/*
    props: {
        mode: string,
        daysToShow: number,
    }
*/

const getDaysToShow = (mode: string) => {
  switch (mode) {
    case 'consumedToday':
      return 3;
    case 'consumedYesterday':
      return 3;
    default:
      return 3;
  }
};

const convertDataToJSONformat = (data: any, timeframe: TimeFrame) => {
  const sensorConverted = data.map(sensorDatum => {
    const energyConverted = sensorDatum.energy.entityHistory
      .map(entity => ({ state: entity.s, time: entity.lu * 1000 }))
      .filter(entity => entity.time >= timeframe.start.getTime() && entity.time <= timeframe.end.getTime());

    return { ...sensorDatum, energy: energyConverted };
  });

  return sensorConverted;
};

export const getTotalKwH = (data: any, prevState: any) => {
  if (!data.length) {
    return { total: 0, prevState: prevState };
  }

  let firstItemIndex = 0;
  let lastItemIndex = data.length - 1
  // if(prevState === null){
  //     prevState = nearestPrevData
  // }

  while (data[firstItemIndex].state === 'unavailable' && firstItemIndex < data.length) {
    firstItemIndex++;
  }

  while (data[lastItemIndex].state === 'unavailable' && lastItemIndex >= 0){
    lastItemIndex--;
  }

  var isfirstItemStateZero = data[firstItemIndex].state === 0;

  const compute = data[lastItemIndex].state - data[firstItemIndex].state
  
  const computeTotalKwh = data.reduce((partialSum, entity, index, arr) => {
    // console.log(partialSum)
    // if (index <= firstItemIndex) {
    //   prevState = entity.state;
    //   return partialSum;
    // } 
    if (entity.state === 'unavailable' || !entity.state) {
      return partialSum;
    } 
    // else if (typeof partialSum === 'string'){
    //   return parseFloat(partialSum)
    // }

    const currentState = parseFloat(entity.state);
    
    if (currentState < prevState) {
      const diffPrevToCurrent = Math.abs(currentState - prevState);
      const diffZeroToCurrent = Math.abs(0 - currentState);

      if (diffZeroToCurrent < diffPrevToCurrent) {
        prevState = currentState;
        return partialSum + currentState;
      } else {
        const difference = prevState - currentState;
        prevState = currentState;
        return partialSum + difference;
      }
    } else {
      const difference = currentState - prevState;
      prevState = currentState;
      return partialSum + difference;
    }
  }, 0);

  return { total: doRoundNumber(compute, 2), prevState: doRoundNumber(prevState, 2) };
};

const useSensorEnergyData = (sensorMode: string) => {
  const [sensorData, setSensorData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const counter = useCounter(3);
  const dateToday = new Date();

  const mode = sensorMode ? sensorMode : 'consumedToday';
  const daysToShow = getDaysToShow(mode);

  const chan1_data = channel1.map(order => {
    const energySensor = useHistory(`sensor.esphometest_1_energy${order}`, {
      hoursToShow: 24 * daysToShow,
    });

    return {
      name: `sensor_${order}`,
      energy: energySensor,
    };
  });

  const chan2_data = channel2.map(order => {
    const energySensor = useHistory(`sensor.esphometest_2_energy${order}`, {
      hoursToShow: 24 * daysToShow,
    });

    return {
      name: `sensor_${order}`,
      energy: energySensor,
    };
  });

  const data = [...chan1_data, ...chan2_data];

  const dataLoadingStates = data.flatMap(datum => {
    const datumLoadingStates = Object.entries(datum)
      .flatMap(([key, val]) => {
        return val.loading;
      })
      .filter(datumVal => datumVal);

    return datumLoadingStates;
  });

  const energyDataLength = data.reduce((partialSum, datum) => {
    return partialSum + datum.energy?.entityHistory?.length;
  }, 0);

  const consumedTodayHandler = () => {
    const timeFrameYesterday: TimeFrame = {
      start: new Date(dateToday.getFullYear(), dateToday.getMonth(), dateToday.getDate() - 1, 0, 0, 0),
      end: new Date(dateToday.getFullYear(), dateToday.getMonth(), dateToday.getDate() - 1, 23, 59, 59),
    };

    const timeFrameToday: TimeFrame = {
      start: new Date(dateToday.getFullYear(), dateToday.getMonth(), dateToday.getDate(), 0, 0, 0),
      end: new Date(dateToday.getFullYear(), dateToday.getMonth(), dateToday.getDate(), 23, 59, 59),
    };

    const getConsumed = async () => {
      if (counter.secondsLeft !== 0) {
        // console.log(counter.secondsLeft);
        return;
      }

      if (dataLoadingStates.length === 0) {
        const jsonFormat = convertDataToJSONformat(data, timeFrameToday);
        const yesterdayJson = convertDataToJSONformat(data, timeFrameYesterday);

        // console.log(jsonFormat)

        const today = jsonFormat.map(entity => {
          const { total, prevState } = getTotalKwH(entity.energy, 0);
          const sensorName = getDeviceName(entity.name);

          return { name: sensorName, totalkWh: total };
        });

        const yesterday = yesterdayJson.map(entity => {
          const { total, prevState } = getTotalKwH(entity.energy, 0);
          const sensorName = getDeviceName(entity.name);

          return { name: sensorName, totalkWh: total };
        });

        // console.log(yesterday)
        // console.log(today)

        const computed = today.map(entity => {
          const yesterdayState = yesterday.find(yesterDayEntity => yesterDayEntity.name === entity.name);
          if (!entity.totalkWh) {
            return { name: entity.name, totalkWh: 0 };
          }

          // console.log(`today: ${entity.totalkWh}, yesterday: ${yesterday.totalkWh}}`)
          const total = entity.totalkWh - yesterdayState.totalkWh;

          return { name: entity.name, totalkWh: doRoundNumber(total, 2) };
        });

        setSensorData(today);
      }
    };

    getConsumed();
  };

  const consumedYesterdayHandler = () => {
    const timeFrameDayBfYes: TimeFrame = {
      start: new Date(dateToday.getFullYear(), dateToday.getMonth(), dateToday.getDate() - 2, 0, 0, 0),
      end: new Date(dateToday.getFullYear(), dateToday.getMonth(), dateToday.getDate() - 2, 23, 59, 59),
    };

    const timeFrameYesterday: TimeFrame = {
      start: new Date(dateToday.getFullYear(), dateToday.getMonth(), dateToday.getDate() - 1, 0, 0, 0),
      end: new Date(dateToday.getFullYear(), dateToday.getMonth(), dateToday.getDate() - 1, 23, 59, 59),
    };

    const getConsumed = async () => {
      if (counter.secondsLeft !== 0) {
        // console.log(counter.secondsLeft)
        return;
      }

      if (dataLoadingStates.length === 0) {
        const jsonFormat = convertDataToJSONformat(data, timeFrameYesterday);
        const twoDaysBfJson = convertDataToJSONformat(data, timeFrameDayBfYes);
        // const hourUsed = await computeHourUsed(data, timeFrameYesterday)

        const yesterday = jsonFormat.map(entity => {
          const { total, prevState } = getTotalKwH(entity.energy, 0);
          const sensorName = getDeviceName(entity.name);

          return { name: sensorName, totalkWh: total };
        });

        const twoDaysBf = twoDaysBfJson.map(entity => {
          const { total, prevState } = getTotalKwH(entity.energy, 0);
          const sensorName = getDeviceName(entity.name);

          return { name: sensorName, totalkWh: total };
        });

        const computed = yesterday.map(entity => {
          const twoDaysBfState = twoDaysBf.find(twoDaysBfEntity => twoDaysBfEntity.name === entity.name);
          if (!entity.totalkWh) {
            return { name: entity.name, totalkWh: 0 };
          }

          const total = entity.totalkWh - twoDaysBfState.totalkWh;

          return { name: entity.name, totalkWh: doRoundNumber(total, 2) };
        });

        setSensorData(yesterday);
      }
    };

    getConsumed();
  };

  // console.log(data)
  // console.log(dataLoadingStates)
  // console.log(sensorData)

  useEffect(() => {
    if (dataLoadingStates.length === 0) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [dataLoadingStates]);

  useEffect(() => {
    switch (mode) {
      case 'consumedToday':
        consumedTodayHandler();
        break;
      case 'consumedYesterday':
        consumedYesterdayHandler();
        break;
      default:
        break;
    }
  }, [counter]);

  return sensorData;
};

export default useSensorEnergyData;
