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

const SwitchCard = (props: any) => {

    return <>
        <div
            className='switch-card'
        >
            <div
                className='switch-card-details'
            >
                <div
                    className='switch-card-details-header'
                >
                    <p
                        className='card-title-text'
                    >Device</p>
                </div>
                <div
                    className='switch-card-details-measurements'
                >
                    <p
                        className='details-header'
                    >A</p>
                    <p
                        className='details-header'
                    >V</p>
                    <p
                        className='details-header'
                    >kWH</p>
                </div>
            </div>
            <div
                className='switch-card-switch-container'
            >
                <Switch />
            </div>
        </div>
    </>
}

export default SwitchCard