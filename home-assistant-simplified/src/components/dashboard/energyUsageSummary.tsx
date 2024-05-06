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
import EnergyUsageGraph from "./energyUsageGraph";

const EnergyUsageSummary = (props: any) => {
    const utc = new Date(Date.now())
    const currentYear = utc.getFullYear()
    
    return(
        <div>
            <EnergyUsageGraph user={props.user} type={'summary'}/>
            <p>{currentYear}</p>

        </div>
    )
}

export default EnergyUsageSummary