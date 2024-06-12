import { useState, useEffect } from 'react';
import { useHass, useEntity, useHistory } from '@hakit/core';
import { TimeFrame } from './useLocalDatabase';
import useCounter from './useCounter';
import { getHourMinuteFormat } from '../functions/getMDYFormat';
import { getDeviceName } from './useSensorData';
import { getTotalKwH } from './useLocalDatabase';

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
      return 1;
    case 'consumedYesterday':
      return 2;
    default:
      return 2;
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

        const computed = jsonFormat.map(entity => {
          const { total, prevState } = getTotalKwH(entity.energy, 0);
          const sensorName = getDeviceName(entity.name);

          return { name: sensorName, totalkWh: total };
        });

        setSensorData(computed);
      }
    };

    getConsumed();
  };

  const consumedYesterdayHandler = () => {
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
        // const hourUsed = await computeHourUsed(data, timeFrameYesterday)
        const computed = jsonFormat.map(entity => {
          const { total, prevState } = getTotalKwH(entity.energy, 0);
          const sensorName = getDeviceName(entity.name);

          return { name: sensorName, totalkWh: total };
        });

        setSensorData(computed);
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
