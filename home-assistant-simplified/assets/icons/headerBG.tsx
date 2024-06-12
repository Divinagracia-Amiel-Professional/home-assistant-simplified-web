import React from 'react';

const HeaderBG = (props: any) => {
  const color = props.strokeColor ? props.strokeColor : 'black';
  const fill = props.fill ? props.fill : 'none';
  const scale = props.scale ? props.scale : 1;

  const def_width = 946;
  const def_height = 625;

  const width = props.width ? props.width : def_width;
  const height = props.height ? props.height : def_height;

  const x = width * scale;
  const y = height * scale;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={x}
      height={y}
      viewBox={`0 0 ${def_width} ${def_height}`}
      fill='none'
      preserveAspectRatio='none'
    >
      <path
        d='M0 0H946C946 0 946 121.5 946 200C887 315.5 616 624.5 308 624.5C173.5 624.5 40.5005 506 0 418.5C0.000495911 280 0 0 0 0Z'
        fill={fill}
      />
    </svg>
  );
};

export default HeaderBG;
