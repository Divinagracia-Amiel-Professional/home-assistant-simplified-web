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

const DevicesCards = (props: any) => {
    const windowDimensions = useWindowDimensions()

    const iconSizeLogic = windowDimensions.width >= 1000 ? 100 : (
        windowDimensions.width >= 360 ? 75 : 50
    )

    const latestSensorData = useLatestSensorData()

    const destructuredData = [
        {
            name: 'AC',
            type: 'AC',
            data: latestSensorData.data[0].energy
        },
        {
            name: 'Efan',
            type: 'Efan',
            data: latestSensorData.data[1].energy
        },
        {
            name: 'Desktop',
            type: 'SystemUnit',
            data: latestSensorData.data[2].energy
        },
        {
            name: 'Monitor',
            type: 'Monitor',
            data: latestSensorData.data[3].energy
        },
    ]

    return (
        <div
            className="device-card-group"
        >
            {
                destructuredData.map(item => {
                    return <DeviceCard 
                        iconParams={{
                            type: item.type,
                            dimensions: iconSizeLogic
                        }}
                        name={item.name}
                        value={item.data}
                    />
                })
            }
        </div>
    )
}

const DeviceCard = (props: any) => {
    const iconParams : IconParams = props.iconParams
    const deviceInfo = {
        name: props.name ? props.name : 'Unknown Device',
        value: props.value !== 'unavailable' ? parseFloat(props.value).toFixed(2) : 'NA' 
        // value: props.value ? props.value : 'unavailable'
    }

    return (
        <div
            className='device-card'
            style={{
                backgroundColor: 'var(--ha-S50)'
            }}
        >
            <p
                className="details-header"
            >{deviceInfo.name}</p>
            {getIcon({
                ...defaultIconParams,
                ...iconParams
            })}
            <div
                className="device-value-container"
            >
                <p
                    className="device-value-text"
                >{deviceInfo.value}</p>
                <p
                    className="details-header device-unit"
                >kWH</p>
            </div> 
        </div>
    )
}

export default DevicesCards
