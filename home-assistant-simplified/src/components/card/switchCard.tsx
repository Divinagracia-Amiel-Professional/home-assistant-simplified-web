import React, { useState, useEffect } from "react";
import Switch from '@mui/material/Switch';
import { 
    MenuDownIcon,
    MenuUpIcon,
    AirCon,
    Efan, 
    Monitor, 
    SystemUnit, 
} from "../../../constants/icons";
import { getIcon, defaultIconParams, IconParams } from "./myAppliancesCard";
import { IOSSwitch } from "../customComponents/customComponentsIndex";
import { useEntity, useService } from "@hakit/core";

const SwitchCard = (props: any) => {
    const iconParams : IconParams = {
        type: props.iconParams?.type ? props.iconParams.type : defaultIconParams.type,
        fill: props.iconParams?.fill ? props.iconParams.fill : defaultIconParams.fill,
        dimensions: props.iconParams?.dimensions ? props.iconParams.dimensions : defaultIconParams.dimensions,
    } 

    const isSocketOn = props.state === 'off'

    const switchEntity = useEntity(props.entityId)

    const onSwitchClick = () => {
        switchEntity.service.toggle()
    }

    const {current, energy, power, voltage} = props.latestSensorData

    return <>
        <div
            className='switch-card'
            style={{
                backgroundColor: 'var(--ha-S50)'
            }}
        >
            <div
                className='switch-card-details'
            >
                <div
                    className='switch-card-details-header'
                >
                    {getIcon(iconParams)}
                    <p
                        className='card-title-text'
                        style={{
                            color: 'var(--ha-500)'
                        }}
                    >{props.entityName ? props.entityName : 'No Device'}</p>
                </div>
                <div
                    className='switch-card-details-measurements'
                >
                    <p
                        className='details-header'
                        style={{
                            color: 'var(--ha-500)'
                        }}
                    >{current ? `${current} A` : 'NA'}</p>
                    <p
                        className='details-header'
                        style={{
                            color: 'var(--ha-500)'
                        }}
                    >{voltage ? `${voltage} V` : 'NA'}</p>
                    <p
                        className='details-header'
                        style={{
                            color: 'var(--ha-500)'
                        }}
                    >{energy ? `${energy} kWH` : 'NA'}</p>
                </div>
            </div>
            <div
                className='switch-card-switch-container'
            >
                <IOSSwitch 
                    checked={isSocketOn}
                    onChange={() => {
                        onSwitchClick()
                    }}
                    inputProps={{ 'aria-label': 'controlled' }}
                />
                {/* <p>{JSON.stringify(isSocketOn)}</p> */} 
                {/* above <p> is for debug */}
            </div>
        </div>
    </>
}

export default SwitchCard