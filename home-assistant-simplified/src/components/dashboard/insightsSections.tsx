import React, { useState, useEffect, memo, useContext } from 'react';
import { MenuDownIcon, MenuRightIcon } from '../../../constants/icons';
import { getIcon, defaultIconParams, IconParams } from '../card/myAppliancesCard';
import useLatestSensorData from '../../../scripts/custom-hooks/useLatestSensorData';
import useWindowDimensions from '../../../scripts/custom-hooks/useWindowDimensions';
import { UseAllHistoryParams } from '../../../scripts/custom-hooks/useLocalDatabase';
import EnergyUsageGraph from './energyUsageGraph';
import useSensorData from '../../../scripts/custom-hooks/useSensorData';
import { getHourMinuteFormat } from '../../../scripts/functions/getMDYFormat';
import CircularProgress from '@mui/material/CircularProgress';
import { HAContext } from '../../BottomNavigation';
import { doRoundNumber } from '../../../scripts/custom-hooks/useLocalDatabase';

const InsightsSection = (props: any) => {
  const { usedToday, usedYesterday } = useContext(HAContext);
  const [ visibleSection, setVisibleSection ] = useState<any>({
    visibleUsageToday: false,
    visibleEnergyUsage: false,
    visiblePowerUsage: false
  })
  const monthDiff = props.monthDiff ? props.monthDiff : null

  const compareUsedHours = (today: any, yesterday: any) => {
    if (usedToday.data && usedYesterday.data) {
      const todayHourDecimal = usedToday.data.hours;
    } else {
      return null;
    }
  };

  // console.log(usedToday.data)
  // console.log(usedYesterday.data)
  const hasData = usedToday.data && usedYesterday.data

  const handleSectionVisible = (sectionName: string) => {
    setVisibleSection(prevState => {
      return({
        ...prevState,
        [sectionName]: !prevState[sectionName]
      })
    })
  }

  const handleSectionIconChange = (visible: boolean) => {
    switch(visible){
      case true:
        return <MenuDownIcon color='var(--ha-900)' size={32}/>
      default:
        return <MenuRightIcon color='var(--ha-900)' size={32}/>
    }
  }

  const getDiffPowerInsight = () => {
    if(!hasData){
      return null
    } 
    const differenceArr = usedToday.data.map(todayDatum => {
      const yesterdayDatum = usedYesterday.data.find(yesterdayDatum => yesterdayDatum.name === todayDatum.name)
      const todayHourDecimal = todayDatum.hoursUsed.hour + (todayDatum.hoursUsed.minute / 60)
      const yesterdayHourDecimal = yesterdayDatum.hoursUsed.hour + (yesterdayDatum.hoursUsed.minute / 60)

      const difference = todayHourDecimal - yesterdayHourDecimal
      return [todayDatum.name, difference]
    })

    const insightsArr = differenceArr.flatMap(([device, difference]) => {
      const diffVal = getHourMinuteFormat(Math.abs(difference))
      const diffPhrase = difference === 0 ? 'equal' : (
        difference > 0 ? 'greater' : 'less'
      )
      const deviceName = device === 'EFan' ? 'Electric Fan' : device

      const insightSentence = () => {
        switch(diffPhrase){
          case 'greater':
            return `You used ${deviceName} for${diffVal.hour ? ` ${diffVal.hour} hr/s and` : ''} ${diffVal.minute ? `${diffVal.minute} min/s` : ''} more than yesterday`
          case 'less':
            return `You used ${deviceName} for${diffVal.hour ? ` ${diffVal.hour} hr/s and` : ''} ${diffVal.minute ? `${diffVal.minute} min/s` : ''} less than yesterday`
          default:
            return null
        }
      }

      return [insightSentence()]
    })

    return insightsArr.filter(val => val)
  }

  const getDiffInsight = () => {
    const insightsArr = Object.entries(monthDiff).flatMap(([device, difference]) => {
      const diffVal = doRoundNumber(Math.abs(difference), 2)
      const diffPhrase = difference === 0 ? 'equal' : (
        difference > 0 ? 'greater' : 'less'
      )
      const deviceName = device === 'EFan' ? 'Electric Fan' : device

      const insightSentence = () => {
        switch(diffPhrase){
          case 'greater':
            return `Your energy consumption for ${deviceName} is ${diffVal} kWh more than last month`
          case 'less':
            return `Your energy consumption for ${deviceName} is ${diffVal} kWh less than last month`
          default:
            return `Your energy consumption for ${deviceName} is equal to last month`
        }
      }

      return [insightSentence()]
    })

    return insightsArr
  }

  const hasInsights = getDiffInsight() && getDiffPowerInsight()

  const displayComparison = (today: any, yesterday: any) => {
    const comparison = compareUsedHours(today, yesterday);

    if (!comparison) {
      return '';
    }
  };

  return (
    <div className='insights-container'>
      <div className='insights-header'>
        <p className='energy-usage-summary-title'>Insights</p>
      </div>
      <div className='insights-section-container'>
        <div className='insights-section'>
          <p className='insights-section-header'>{/* Today */}</p>
          <div
            className='insights-section-body'
            style={{
              alignItems: usedToday.isLoading ? 'center' : 'flex-start',
            }}
          >
            {hasData && hasInsights ? (
              <>
                <div
                  className='insights-list-header-block'
                  onClick={() => {
                    handleSectionVisible('visibleUsageToday')
                  }}
                >
                  <p className='poppins-bold insights-list-header'>Today</p>
                  {
                    handleSectionIconChange(visibleSection.visibleUsageToday)
                  }
                </div>
                <ul
                  className='poppins-bold'
                  style={{
                    display: visibleSection.visibleUsageToday ? 'block' : 'none'
                  }}
                >
                  {usedToday.data.map(datum => {
                    // let isTodayBigger = null
                    // if(usedYesterday.data){
                    //     const yesterdayDatum = usedYesterday.data.find(yesterdayDatum => yesterdayDatum.name === datum.name)
                    //     const todayHourDecimal = datum.hoursUsed.hour + (datum.hoursUsed.minute / 60)
                    //     const yesterdayHourDecimal = yesterdayDatum.hoursUsed.hour + (yesterdayDatum.hoursUsed.minute / 60)

                    //     isTodayBigger = todayHourDecimal > yesterdayHourDecimal
                    //     console.log(isTodayBigger)
                    // }

                    // if(datum.hoursUsed.hour === 0 && datum.hoursUsed.minute === 0){
                    //     return null
                    // }

                    return (
                      <li className='insights-list-item poppins-bold'>{`${datum.name} has run for ${datum.hoursUsed.hour} hours and ${datum.hoursUsed.minute} minutes today`}</li>
                    );
                  })
                  }
                </ul>
                <div
                  className='insights-list-header-block'
                  onClick={() => {
                    handleSectionVisible('visibleEnergyUsage')
                  }}
                >
                  <p className='poppins-bold insights-list-header'>Energy Usage</p>
                  {
                    handleSectionIconChange(visibleSection.visibleEnergyUsage)
                  }
                </div>
                <ul
                  className='poppins-bold'
                  style={{
                    display: visibleSection.visibleEnergyUsage ? 'block' : 'none'
                  }}
                >
                  
                  {
                    getDiffInsight().map(insight => {
                      return <li className='insights-list-item poppins-bold'>{insight}</li>
                    })
                  }
                </ul>
                <div
                  className='insights-list-header-block'
                  onClick={() => {
                    handleSectionVisible('visiblePowerUsage')
                  }}
                >
                  <p className='poppins-bold insights-list-header'>Power Usage</p>
                  {
                    handleSectionIconChange(visibleSection.visiblePowerUsage)
                  }
                </div>
                <ul
                  className='poppins-bold'
                  style={{
                    display: visibleSection.visiblePowerUsage ? 'block' : 'none'
                  }}
                >
                  {
                    getDiffPowerInsight().map(insight => {
                      return <li className='insights-list-item poppins-bold'>{insight}</li>
                    })
                  }
                </ul>
              </>
            ) : (
              <CircularProgress />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default memo(InsightsSection);
