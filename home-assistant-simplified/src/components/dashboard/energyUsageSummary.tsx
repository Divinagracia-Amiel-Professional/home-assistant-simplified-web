import React, { useState, useEffect, memo } from 'react';
import { MenuDownIcon, MenuUpIcon, AirCon, Efan, Monitor, SystemUnit } from '../../../constants/icons';
import { getIcon, defaultIconParams, IconParams } from '../card/myAppliancesCard';
import useLatestSensorData from '../../../scripts/custom-hooks/useLatestSensorData';
import useWindowDimensions from '../../../scripts/custom-hooks/useWindowDimensions';
import { UseAllHistoryParams } from '../../../scripts/custom-hooks/useLocalDatabase';
import EnergyUsageGraph from './energyUsageGraph';
import InsightsSection from './insightsSections';
import useLocalDatabase from '../../../scripts/custom-hooks/useLocalDatabase';

const EnergyUsageSummary = (props: any) => {
  const utc = new Date(Date.now());
  const currentYear = utc.getFullYear();
  const currentMonth = utc.getMonth()
  const prevMonth = new Date(currentYear, utc.getMonth() - 1, utc.getDate(), 1, 0, 0, 0).getMonth()

  console.log(`${currentMonth} ${prevMonth}`)

  const historyParams: UseAllHistoryParams = {
    userId: props.user,
    startTime: new Date(utc.getFullYear(), 0, 1, 0, 0, 0).toISOString(),
    endTime: new Date(utc.getFullYear(), 11, 30, 23, 59, 59).toISOString(),
    isSummary: true,
  };

  const HADB = useLocalDatabase(historyParams);

  const getPrevCurrentMonthDiff = Object.entries(HADB).map(([device, value]) => {
    const currentMonthVal = value.arr[currentMonth][1]
    const prevMonthVal = value.arr[prevMonth][1]

    const difference = currentMonthVal - prevMonthVal
    return [device, difference]
  })

  const diffObject = Object.fromEntries(getPrevCurrentMonthDiff)

  return (
    <div className='energy-usage-summary-container'>
      <p
        className='energy-usage-summary-title'
        style={{
          paddingLeft: 30,
        }}
      >
        Energy Usage Summary
      </p>
      <div className='energy-usage-summary-section'>
        <p className='energy-usage-summary-section-title poppins-bold'>Energy Consumed In {currentYear}</p>
        <EnergyUsageGraph historyParams={historyParams} />
        <InsightsSection monthDiff={diffObject} />
      </div>
    </div>
  );
};

export default memo(EnergyUsageSummary);
