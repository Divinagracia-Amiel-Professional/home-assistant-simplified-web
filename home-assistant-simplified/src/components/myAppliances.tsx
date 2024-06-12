import { memo } from 'react';
import { MyApplianceCard } from './card/cardsIndex';
import Header from './header';

const MyAppliances = (props: any) => {
  // console.log(sensorEnergyData)

  const appliancesProps = [
    {
      entityName: 'Desktop',
      iconParams: {
        type: 'PC',
      },
    },
    {
      entityName: 'Monitor',
      iconParams: {
        type: 'Monitor',
      },
    },
    {
      entityName: 'Electric Fan',
      iconParams: {
        type: 'Efan',
      },
    },
    {
      entityName: 'AC',
      iconParams: {
        type: 'AC',
      },
    },
  ];

  return (
    <div className='screen-general-container'>
      <Header type={'appliance'} />
      <div className='appliance-group'>
        {appliancesProps.map(appliances => {
          return <MyApplianceCard key={appliances.entityName} entityName={appliances.entityName} iconParams={appliances.iconParams} />;
        })}
      </div>
    </div>
  );
};

export default memo(MyAppliances);
