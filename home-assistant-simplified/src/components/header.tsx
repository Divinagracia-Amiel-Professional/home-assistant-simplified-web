import React, { useState, useEffect } from 'react';

const Header = (props: any) => {
  const type = props?.type;
  const data = props?.data;

  return (
    <div className='screen-header'>
      <Content type={type} data={data} />
    </div>
  );
};

export default Header;

const Content = (props: any) => {
  const type = props.type;
  const data = props.data;
  var name;

  switch (type) {
    case 'energy':
      name = 'Energy';
      break;
    case 'appliance':
      name = 'My Appliances';
      break;
    default:
      name = null;
  }

  switch (type) {
    case 'dashboard':
      return (
        <div className='dashboard-header dashboard-margin'>
          <p className='dashboard-header-subtitle poppins-regular'>{data.date}</p>
          <p className='dashboard-header-title poppins-bold'>Hello, {data.user}</p>
        </div>
      );
    case 'switches':
      return (
        <div className='dashboard-header switches-header-margin'>
          <p className='dashboard-header-title switches-title poppins-bold'>
            <span className='title-emphasis'>{data.numOfRunning}</span> out of {data.numOfDevices}
          </p>
          <p className='dashboard-header-subtitle poppins-regular'>Running Sockets</p>
        </div>
      );
    default:
      return (
        <div className='dashboard-header dashboard-margin'>
          <p className='dashboard-header-title poppins-bold'>{name}</p>
        </div>
      );
  }
};
