import React, { useState, useEffect, memo, useContext } from "react";
import { 
    MenuDownIcon,
    MenuUpIcon,
    AirCon,
    Efan, 
    Monitor, 
    SystemUnit, 
} from "../../../constants/icons";
import { getIcon, defaultIconParams, IconParams } from "../card/myAppliancesCard";
import useLatestSensorData from "../../../scripts/custom-hooks/useLatestSensorData";
import useWindowDimensions from "../../../scripts/custom-hooks/useWindowDimensions";
import { UseAllHistoryParams } from "../../../scripts/custom-hooks/useLocalDatabase";
import EnergyUsageGraph from "./energyUsageGraph";
import useSensorData from "../../../scripts/custom-hooks/useSensorData";
import { getHourMinuteFormat } from "../../../scripts/functions/getMDYFormat";
import CircularProgress from '@mui/material/CircularProgress';
import { HAContext } from "../../BottomNavigation";

const InsightsSection = (props: any) => {
    const {usedToday, usedYesterday} = useContext(HAContext)

    const compareUsedHours = (today: any, yesterday: any) => {
        if(usedToday.data && usedYesterday.data){
            const todayHourDecimal = usedToday.data.hours
        } else {
            return null
        }
    }
    
    const displayComparison = (today: any, yesterday: any) => {
        const comparison = compareUsedHours(today, yesterday)

        if(!comparison){
            return ''
        } 
    }
    
    return(
        <div
            className="insights-container"
        >
            <div className="insights-header">
                <p className="energy-usage-summary-title">Insights</p>
            </div>
            <div
                className="insights-section-container"
            >
                <div
                className="insights-section"
                >
                    <p
                        className="insights-section-header"
                    >
                        {/* Today */}
                    </p>
                    <div
                        className="insights-section-body"
                        style={{
                            alignItems: usedToday.isLoading ? 'center' : 'flex-start'
                        }}
                    >
                        {
                                usedToday.data ? <ul
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
                                        
                                        return <li
                                            className="insights-list-item poppins-bold"
                                        >{`${datum.name} has run for ${datum.hoursUsed.hour} hours and ${datum.hoursUsed.minute} minutes today`}</li>
                                    })}
                                </ul> : <CircularProgress />
                        }
                    </div>
                </div>
            </div> 
        </div>
    )
}
export default memo(InsightsSection)