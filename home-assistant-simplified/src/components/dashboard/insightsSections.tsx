import React, { useState, useEffect, memo } from "react";
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

const InsightsSection = (props: any) => {
    const HADB = useSensorData('hoursUsedYesterday')

    console.log(HADB)
    const time = `${new Date(1716825927.518 * 1000)} - ${new Date(1716911997.349663 * 1000)}`
    
    return(
        <div
            className="insights-container"
        >
            <p>{time}</p>
            {/* <p>insights</p> */}
        </div>
    )
}

export default memo(InsightsSection)