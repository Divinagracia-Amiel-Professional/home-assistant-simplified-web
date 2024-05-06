import { Column, Group, TimeCard, ButtonCard } from '@hakit/components';
import { useState, useEffect } from 'react';
import { useHass, useEntity, useHistory } from "@hakit/core";
import { VictoryBar } from 'victory';
import useSensorHistory, { UseHistoryParams } from '../../../scripts/custom-hooks/useSensorHistory';



const EnergyUsageGraph = (props: any) => {
    const [ historyParams, setHistoryParams ] = useState<UseHistoryParams>()

    const exampleParam: UseHistoryParams = {
        userId: props.user,
        device: 'EFan',
        startTime: '2024-04-25T02:00:00.000Z',
        endTime: '2024-04-30T02:00:00.000Z',
    }

    useSensorHistory(exampleParam)

    return <div>

    </div>
}

export default EnergyUsageGraph