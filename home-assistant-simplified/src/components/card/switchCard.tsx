import React, { useState, useEffect } from 'react';
import Switch from '@mui/material/Switch';
import { MenuDownIcon, MenuUpIcon, AirCon, Efan, Monitor, SystemUnit } from '../../../constants/icons';
import { getIcon, defaultIconParams, IconParams } from './myAppliancesCard';
import { IOSSwitch } from '../customComponents/customComponentsIndex';
import { useEntity, useService } from '@hakit/core';

const SwitchCard = (props: any) => {
  const iconParams: IconParams = {
    type: props.iconParams?.type ? props.iconParams.type : defaultIconParams.type,
    fill: props.iconParams?.fill ? props.iconParams.fill : defaultIconParams.fill,
    dimensions: props.iconParams?.dimensions ? props.iconParams.dimensions : defaultIconParams.dimensions,
  };

  const isSocketOn = props.state === 'off';

  const switchEntity = useEntity(props.entityId);

  const onSwitchClick = () => {
    switchEntity.service.toggle();
  };

  const { current, energy, power, voltage } = props.latestSensorData;

  const colorLogic = isSocketOn ? 'var(--ha-500)' : 'var(--ha-S500)';

  const dataLogic = (data: any, unit: string) => {
    if (data === 'unavailable' || data === null || data === undefined) {
      return 'No Data';
    } else {
      return `${data} ${unit}`;
    }
  };

  return (
    <>
      <div
        className='switch-card'
        style={{
          backgroundColor: 'var(--ha-S50)',
          boxShadow: isSocketOn ? '0 0 5px 2px var(--ha-900)' : '0 0 5px 2px var(--ha-S500)',
        }}
      >
        <div className='switch-card-details'>
          <div className='switch-card-details-header'>
            {getIcon({
              ...iconParams,
              fill: colorLogic,
            })}
            <p
              className='card-title-text'
              style={{
                color: colorLogic,
              }}
            >
              {props.entityName ? props.entityName : 'No Device'}
            </p>
          </div>
          <div className='switch-card-details-measurements'>
            <p
              className='details-header'
              style={{
                color: colorLogic,
              }}
            >
              {dataLogic(current, 'A')}
            </p>
            <p
              className='details-header'
              style={{
                color: colorLogic,
              }}
            >
              {dataLogic(voltage, 'V')}
            </p>
            <p
              className='details-header'
              style={{
                color: colorLogic,
              }}
            >
              {dataLogic(energy, 'kWh')}
            </p>
          </div>
        </div>
        <div className='switch-card-switch-container'>
          <IOSSwitch
            checked={isSocketOn}
            onChange={() => {
              onSwitchClick();
            }}
            inputProps={{ 'aria-label': 'controlled' }}
          />
          {/* <p>{JSON.stringify(isSocketOn)}</p> */}
          {/* above <p> is for debug */}
        </div>
      </div>
    </>
  );
};

export default SwitchCard;
