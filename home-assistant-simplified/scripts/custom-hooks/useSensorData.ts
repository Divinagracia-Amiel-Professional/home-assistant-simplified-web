import { useState, useEffect } from 'react';
import { useHass, useEntity, useHistory } from '@hakit/core';
import { TimeFrame } from './useLocalDatabase';
import useCounter from './useCounter';
import { getHourMinuteFormat } from '../functions/getMDYFormat';

interface historyData {}

interface SensorObject {}

const sensorChannel = ['1', '2'];
const sensorVariables = ['current', 'energy', 'power', 'voltage'];
const channel1 = ['', '2'];
const channel2 = ['4', '5'];

export const getDeviceName = (id: string) => {
  switch (id) {
    case 'sensor_2':
      return 'Electric Fan';
    case 'sensor_4':
      return 'PC';
    case 'sensor_5':
      return 'Monitor';
    default:
      return 'AC';
  }
};

const computeHourUsed = async (data: any, timeframe: TimeFrame) => {
  const powerData = data.map(datum => ({
    name: datum.name,
    power: datum.power?.entityHistory.filter(historyItem => {
      const time = historyItem.lu * 1000;
      const parseValue = historyItem.s !== 'unavailable' ? parseFloat(historyItem.s) : 0;
      const isOff = parseValue === 0;

      return time >= timeframe.start.getTime() && time <= timeframe.end.getTime() && !isOff;
    }),
  }));
  // console.log(powerData);

  const computeHourUsed = async () => {
    // console.log('compute');
    const hourMap = powerData.map(datum => {
      if (!datum.power.length) {
        return {
          name: getDeviceName(datum.name),
          hoursUsed: getHourMinuteFormat(0),
        };
      }

      let startSecondsBeforeInterval = 0;
      let endSecondsBeforeInterval = 0;
      const secondsConsumed = datum.power.reduce((partialSum, historyItem, index, arr) => {
        const isLastIndex = index === arr.length - 1;
        const interval = !isLastIndex ? Math.abs(historyItem.lu - arr[index + 1].lu) : 60 * 5 + 1;
        const isNextItemIntervalOff = interval >= 60 * 5;

        // console.log(isIntervalOff)

        if (index === 0) {
          startSecondsBeforeInterval = historyItem.lu;
          endSecondsBeforeInterval = historyItem.lu;
          return partialSum;
        } else if (isNextItemIntervalOff) {
          const difference = partialSum + (endSecondsBeforeInterval - startSecondsBeforeInterval);
          startSecondsBeforeInterval = !isLastIndex ? arr[index + 1].lu : 0;
          endSecondsBeforeInterval = !isLastIndex ? arr[index + 1].lu : 0;
          return difference;
        } else {
          endSecondsBeforeInterval = historyItem.lu;
          return partialSum;
        }
      }, 0);

      const hoursConsumed = secondsConsumed / (60 * 60);

      return {
        name: getDeviceName(datum.name),
        hoursUsed: getHourMinuteFormat(hoursConsumed),
      };
    });

    return hourMap;
  };

  return await computeHourUsed();
};

const useSensorData = (mode: string) => {
  const [sensorData, setSensorData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const counter = useCounter(5);

  const chan1_data = channel1.map(order => {
    const currentSensor = useHistory(`sensor.esphometest_1_current${order}`, {
      hoursToShow: 24 * 3,
    });
    const energySensor = useHistory(`sensor.esphometest_1_energy${order}`, {
      hoursToShow: 24 * 3,
    });
    const powerSensor = useHistory(`sensor.esphometest_1_power${order}`, {
      hoursToShow: 24 * 3,
    });
    const voltageSensor = useHistory(`sensor.esphometest_1_voltage${order}`, {
      hoursToShow: 24 * 3,
    });

    return {
      name: `sensor_${order}`,
      current: currentSensor,
      energy: energySensor,
      power: powerSensor,
      voltage: voltageSensor,
    };
  });

  const chan2_data = channel2.map(order => {
    const currentSensor = useHistory(`sensor.esphometest_2_current${order}`, {
      hoursToShow: 24 * 3,
    });
    const energySensor = useHistory(`sensor.esphometest_2_energy${order}`, {
      hoursToShow: 24 * 3,
    });
    const powerSensor = useHistory(`sensor.esphometest_2_power${order}`, {
      hoursToShow: 24 * 3,
    });
    const voltageSensor = useHistory(`sensor.esphometest_2_voltage${order}`, {
      hoursToShow: 24 * 3,
    });

    return {
      name: `sensor_${order}`,
      current: currentSensor,
      energy: energySensor,
      power: powerSensor,
      voltage: voltageSensor,
    };
  });

  const data = [...chan1_data, ...chan2_data];

  const dateToday = new Date();

  const timeframeThisMonth: TimeFrame = {
    start: new Date(dateToday.getFullYear(), dateToday.getMonth(), 1, 0, 0, 0),
    end: new Date(dateToday.getFullYear(), dateToday.getMonth() + 1, 0, 23, 59, 59),
  };

  const testTimeFrame: TimeFrame = {
    start: new Date('2024-05-28T00:00:00+08:00'),
    end: new Date('2024-05-28T23:59:59+08:00'),
  };

  const dataLoadingStates = data.flatMap(datum => {
    const datumLoadingStates = Object.entries(datum)
      .flatMap(([key, val]) => {
        if (key !== 'power') {
          return null;
        }

        return val.loading;
      })
      .filter(datumVal => datumVal);

    return datumLoadingStates;
  });

  const powerDataLength = data.reduce((partialSum, datum) => {
    return partialSum + datum.power?.entityHistory?.length;
  }, 0);

  const hoursUsedTodayHandler = () => {
    const timeFrameToday: TimeFrame = {
      start: new Date(dateToday.getFullYear(), dateToday.getMonth(), dateToday.getDate(), 0, 0, 0),
      end: new Date(dateToday.getFullYear(), dateToday.getMonth(), dateToday.getDate(), 23, 59, 59),
    };

    const getHourUsed = async () => {
      if (counter.secondsLeft !== 0) {
        // console.log(counter.secondsLeft);
        return;
      }

      if (dataLoadingStates.length === 0) {
        const hourUsed = await computeHourUsed(data, timeFrameToday);

        setSensorData(hourUsed);
      }
    };

    getHourUsed();
  };

  const hoursUsedYesterdayHandler = () => {
    const timeFrameYesterday: TimeFrame = {
      start: new Date(dateToday.getFullYear(), dateToday.getMonth(), dateToday.getDate() - 1, 0, 0, 0),
      end: new Date(dateToday.getFullYear(), dateToday.getMonth(), dateToday.getDate() - 1, 23, 59, 59),
    };

    const getHourUsed = async () => {
      if (counter.secondsLeft !== 0) {
        // console.log(counter.secondsLeft);
        return;
      }

      if (dataLoadingStates.length === 0) {
        const hourUsed = await computeHourUsed(data, timeFrameYesterday);

        setSensorData(hourUsed);
      }
    };

    getHourUsed();
  };

  useEffect(() => {
    if (dataLoadingStates.length === 0) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [dataLoadingStates]);

  // console.log(data);

  useEffect(() => {
    switch (mode) {
      case 'hoursUsedToday':
        hoursUsedTodayHandler();
        break;
      case 'hoursUsedYesterday':
        hoursUsedYesterdayHandler();
        break;
      default:
        break;
    }
  }, [counter]);
  return { data: sensorData, isLoading: isLoading };
};

export default useSensorData;
