const groupByMonth = (sensorData: any) => {
  const date = new Date(sensorData[1].voltage.entityHistory[1]?.lu * 1000);

  // console.log(sensorData[1].voltage.entityHistory)
};

export default groupByMonth;
