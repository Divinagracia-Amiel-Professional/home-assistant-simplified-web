import React from 'react';

const SystemUnit = (props: any) => {
  const color = props.strokeColor ? props.strokeColor : 'black';
  const fill = props.fill ? props.fill : 'none';
  const scale = props.scale ? props.scale : 1;

  const def_width = 800;
  const def_height = 800;

  const width = props.width ? props.width : def_width;
  const height = props.height ? props.height : def_height;

  const x = width * scale;
  const y = height * scale;

  return (
    <svg xmlns='http://www.w3.org/2000/svg' width={x} height={y} viewBox={`0 0 ${def_width} ${def_height}`} fill='none'>
      <path
        fill-rule='evenodd'
        clip-rule='evenodd'
        d='M571.083 779.367V20.6965C571.083 9.29751 561.814 0 550.378 0H251.035C239.599 0 230.361 9.29751 230.361 20.6965V779.335C230.361 790.734 239.599 800 251.035 800H550.378C561.782 800 571.052 790.734 571.083 779.367ZM529.704 41.2975H271.677V758.671H529.704V41.2975ZM296.62 221.58H504.729V189.453H296.62V221.58ZM296.62 242.531H504.729V274.722H296.62V242.531ZM296.811 96.796H504.602V167.578H296.811V96.796ZM296.62 295.642H504.729V327.737H296.62V295.642ZM404.067 601.855C440.955 601.855 470.867 572.02 470.867 535.021C470.867 498.181 440.955 468.219 404.067 468.219C367.147 468.219 337.203 498.149 337.203 535.021C337.203 571.988 367.115 601.855 404.067 601.855ZM404.035 492.322C427.64 492.322 446.753 511.491 446.753 535.021C446.753 558.583 427.64 577.688 404.035 577.688C380.399 577.688 361.286 558.583 361.286 535.021C361.286 511.459 380.399 492.322 404.035 492.322Z'
        fill={fill}
      />
    </svg>
  );
};

export default SystemUnit;
