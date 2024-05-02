import React, { useCallback, useState } from 'react';
import { useHass } from '@hakit/core';
import { FabCard } from '@hakit/components';

type DateFormat = {
  dateTime: string;
  date: string;
};

interface CalendarEvent {
  start: DateFormat;
  end: DateFormat;
  summary: string;
  location?: string;
  description?: string;
  uid?: string;
  recurrence_id?: string;
  rrule?: string;
}

interface Response {
  data: any;
  status: string
}

type Attributes = {
    friendly_name: string;
    unit_of_measurement: string
}

interface History {
    attributes?: Attributes;
    entity_id?: string;
    last_changed: string;
    last_updated?: string;
    state: Number;
}

const CallApiExample = () => {
    const { callApi } = useHass();
    const [res, setRes] = useState<Response>();
    const retrieveCalendarEvents = useCallback(() => {
      (async() => {
        const response = await callApi<CalendarEvent[]>('/calendars/calendar.google_calendar?start=2023-09-30T14:00:00.000Z&end=2023-11-11T13:00:00.000Z');
        setRes(response);
      })()
    }, [callApi]);
    return <>
      <FabCard icon="mdi:view-module" onClick={retrieveCalendarEvents} />
      {res?.data?.length ? `There is ${res.data.length} events!` : 'No events'}
    </>
  }

///history/period?filter_entity_id=sensor.temperature
///history/period/2023-09-04T00:00:00+02:00?filter_entity_id=sensor.temperature,sensor.kitchen_temperature&minimal_response
///history/period/2024-02-01T00:00:00+08:00?end_time=2024-03-31T00:00:00+08:00&filter_entity_id=sensor.esphometest_1_power&minimal_response
//api request: /history/period/2021-09-04T00%3A00%3A00%2B02%3A00?end_time=2023-09-04T00%3A00%3A00%2B02%3A00&filter_entity_id=sensor.temperature
// id: sensor.esphometest_1_power


const useSensorHistory = (sensorName: any) => {
  const { callApi } = useHass();
    const [res, setRes] = useState<Response>();
    const name = sensorName;
    const retrieveSensorHistory = useCallback(() => {
      (async() => {
        const response = await callApi<CalendarEvent[]>(`/history/period/2024-02-01T00:00:00+08:00?&filter_entity_id=${name}&minimal_response`);
        setRes(response);
      })()
    }, [callApi]);
    retrieveSensorHistory();
    return { res }
}

export type {
  DateFormat,
  Attributes,
  CalendarEvent,
  Response,
  History
}

export {
  CallApiExample,
  useSensorHistory
}
