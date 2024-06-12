import { useState, useEffect, useMemo, useRef } from 'react';
import { useHass, useEntity, useHistory } from '@hakit/core';
import { TimeFrame } from './useLocalDatabase';
import useCounter from './useCounter';
import { getHourMinuteFormat } from '../functions/getMDYFormat';
import addNotification from '@bdhamithkumara/react-push-notification';

interface TriggerObject {
  device: string | null;
  last_triggered: string | null;
}

const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

// 0
// (2) ['automation.notifcation_for_electric_fan', {…}]
// 1
// (2) ['automation.notif_aircon', {…}]
// 2
// (2) ['automation.notif_pc', {…}]
// 3
// (2) ['automation.notif_monitor', {…}]
// 4
// (2) ['automation.auto_shutoff_for_electric_fan', {…}]
// 5
// (2) ['automation.auto_shutoff_for_aircon', {…}]
// 6
// (2) ['automation.auto_shutoff_for_monitor', {…}]
// 7
// (2) ['automation.auto_shutdown_for_pc', {…}

const changeIDtoName = (id: string) => {
  switch (id) {
    case 'automation.notifcation_for_electric_fan':
      return 'Electric Fan';
    case 'automation.notif_aircon':
      return 'Aircon';
    case 'automation.notif_pc':
      return 'PC';
    case 'automation.notif_monitor':
      return 'Monitor';
    default:
      return 'Shutdown';
  }
};

const useAutomations = () => {
  const [data, setData] = useState<TriggerObject>({
    device: null,
    last_triggered: null,
  });
  const [count, setCount] = useState<number>(0);
  const { getAllEntities, useStore, getUser } = useHass();
  const entities = useStore(store => store.entities);

  const automations = Object.entries(entities).filter(([key, entity]) => {
    return key.includes('automation.notif') || key.includes('automation.auto');
  });

  const automationToObject = Object.fromEntries(automations);

  const triggerEntity = Object.entries(automationToObject).map(([key, entity]) => {
    return [changeIDtoName(key), entity.attributes.last_triggered];
  });

  const triggerStates = triggerEntity.map(([entity, state]) => state);

  const prevTriggerState = usePrevious([...triggerEntity]);

  useEffect(() => {
    setCount(prevCount => prevCount + 1);
    if (data.device && count > 2) {
      const title = data.device.includes('Shutdown') ? `${data.device} has been turned off` : 'Increased Energy Consumption';
      const message = data.device.includes('Shutdown')
        ? `${data.device} has reached its energy cap for the day`
        : `Energy Consumption for ${data.device} increased`;

      addNotification({
        title: title,
        subtitle: title,
        message: message,
        theme: 'light',
        native: true,
      });
    }
  }, [data]);

  useEffect(() => {
    const triggeredState = triggerEntity
      .filter(([currentEntity, currentState]) => {
        return !prevTriggerState?.some(([prevEntity, prevState]) => prevState === currentState);
      })
      .flatMap(value => value);

    console.log('triggered');
    console.log(prevTriggerState);
    console.log(triggeredState);

    if (triggeredState.length) {
      setData({
        device: triggeredState[0],
        last_triggered: triggeredState[1],
      });
    }
  }, [...triggerStates]);
};

export default useAutomations;
