import React, { useState, useEffect, memo, useContext } from "react";
import { HAContext } from "../../BottomNavigation";
import { CircularProgress } from "@mui/material";
import { 
    MenuDownIcon,
    MenuUpIcon,
    AirCon,
    Efan, 
    Monitor, 
    SystemUnit, 
} from "../../../constants/icons";

interface IconParams {
    type: string;
    fill: string;
    dimensions: number;
}

const defaultIconParams : IconParams = {
    type: 'default',
    fill: 'var(--ha-500)',
    dimensions: 100
}

const getIcon = (params: IconParams) => {
    const { type, fill, dimensions } = params

    switch(type){
        case 'AC':
            return <AirCon fill={fill} height={dimensions} width={dimensions}/>
        case 'Efan':
            return <Efan fill={fill} height={dimensions} width={dimensions}/>
        case 'Monitor':
            return <Monitor fill={fill} height={dimensions} width={dimensions}/>
        case 'PC':
            return <SystemUnit fill={fill} height={dimensions} width={dimensions}/>
        default:
            return null
    }
}

// const iconParams : IconParams = {
//     type: props.iconParams.type ? props.iconParams.type : defaultIconParams.type,
//     fill: props.iconParams.fill ? props.iconParams.fill : defaultIconParams.fill,
//     type: props.iconParams.dimensions ? props.iconParams.dimensions : defaultIconParams.dimensions,
// }

const MyApplianceCard = (props: any) => {
    const [ isDetailsExpanded, setIsDetailsExpanded ] = useState<boolean>(false)
    const iconParams : IconParams = {
        type: props.iconParams?.type ? props.iconParams.type : defaultIconParams.type,
        fill: props.iconParams?.fill ? props.iconParams.fill : defaultIconParams.fill,
        dimensions: props.iconParams?.dimensions ? props.iconParams.dimensions : defaultIconParams.dimensions,
    }

    const {appliancesData: energyData} = useContext(HAContext)

    const thisApplianceData = Object.entries(energyData).map(([timeframe, datum]) => {
        const name = props.iconParams.type !== 'Efan' ? props.iconParams.type : 'Electric Fan'

        const thisEnergyDatum = datum ? datum.find(sensor => sensor.name === name).totalkWh : null

        return [timeframe, thisEnergyDatum !== undefined ? thisEnergyDatum : 0]
    })

    const applianceDataObject = Object.fromEntries(thisApplianceData)

    const hasData = energyData.today && energyData.yesterday

    const details = (
        <div
            className='appliance-card-details'
            style={{
                display: isDetailsExpanded ? 'block' : 'none',
            }}
        >
            <div
                className='appliance-card-details-element'
            >
                <p
                    className='details-header poppins-bold'
                    style={{
                        color: 'var(--ha-500)'
                    }}
                >Today</p>
                <p
                    className='details-body poppins-regular'
                    style={{
                        color: 'var(--ha-500)'
                    }}
                >{`${applianceDataObject.today} kWH`}</p>
            </div>
            <div
                className='appliance-card-details-element'
            >
                <p
                    className='details-header poppins-bold'
                    style={{
                        color: 'var(--ha-500)'
                    }}
                >Yesterday</p>
                <p
                    className='details-body poppins-regular'
                    style={{
                        color: 'var(--ha-500)'
                    }}
                >{`${applianceDataObject.yesterday} kWH`}</p>
            </div>
        </div>
    )

    return(
        <div
            className='appliance-card'
            style={{
                // height: isDetailsExpanded ? 'auto' : '30%',
                backgroundColor: 'var(--ha-S50)',
                boxShadow: isDetailsExpanded? '0 0 5px 2px var(--ha-900)' : '0 0 5px 2px var(--ha-S500)'
            }}
        >
            <div
                className='icon'
            >
                {getIcon(iconParams)}
                <p
                    className='poppins-bold card-title-text'
                    style={{
                        color: 'var(--ha-500)'
                    }}
                >{props.entityName ? props.entityName : 'No Device'}</p>
            </div>
                    {
                        hasData ? details : <CircularProgress style={{display: isDetailsExpanded ? 'block' : 'none'}} />
                    }
            <div
                className='appliance-card-menu-down'
                style={{
                    display: isDetailsExpanded ? 'none' : 'block'
                }}
                onClick={() => {
                    setIsDetailsExpanded(prevState => !prevState)
                }}
            >
                <MenuDownIcon color='var(--ha-500)'/>
            </div>
            <div
                className='appliance-card-menu-up'
                style={{
                    display: !isDetailsExpanded ? 'none' : 'block'
                }}
                onClick={() => {
                    setIsDetailsExpanded(prevState => !prevState)
                }}
            >
                <MenuUpIcon color='var(--ha-500)'/>
            </div>
        </div>
    )
}

export default memo(MyApplianceCard)

export {
    getIcon,
    defaultIconParams
}

export type {
    IconParams
}