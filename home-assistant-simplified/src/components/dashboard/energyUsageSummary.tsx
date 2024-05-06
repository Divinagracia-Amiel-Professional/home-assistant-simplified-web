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

    
    return(
        <div>
            <EnergyUsageGraph user={props.user} historyParams={{}}/>
        </div>
    )
}

export default EnergyUsageSummary