import React, { useState, useEffect } from "react";
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

const EnergyUsageSummary = (props: any) => {
    const utc = new Date(Date.now())
    const currentYear = utc.getFullYear()

    const historyParams: UseAllHistoryParams = {
        userId: props.user,
        startTime: '2024-01-01T00:00:00.000+08:00',
        endTime: '2024-12-31T00:00:00.000+08:00',
        isSummary: true
    }
    
    return(
        <div
            className="energy-usage-summary-container"
        >
            <p
                className="energy-usage-summary-title"
            >Energy Usage Summary</p>
            <div
                className="energy-usage-summary-section"
            >
                <p>{currentYear}</p>
                <EnergyUsageGraph historyParams={historyParams}/>
            </div>
        </div>
    )
}

export default EnergyUsageSummary