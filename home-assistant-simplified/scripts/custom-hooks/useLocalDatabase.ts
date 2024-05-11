import { ACEnergy, PCEnergy, MonitorEnergy, EFanEnergy } from "../../assets/sensorData/sensorDataIndex";
import React, { useEffect, useState } from 'react'
import useAllSensorHistory, { UseAllHistoryParams } from './useAllSensoryHistory'
import _, { fill } from 'lodash'
import getMDYFormat, { getMDYFormatGetFunctions, getHoursFormat, getHoursFromNumber } from '../functions/getMDYFormat'

const parseTimestamp = (timestamp: string) => new Date(timestamp);

const getNearestPrevData = (index: any, data: any) => {
    let currentIndex = index

    while(data[currentIndex].state === 'unavailable' || data[currentIndex].state === 0){
        currentIndex--
    }

    // const toArray = [
    //     new Date(data[currentIndex].last_changed).getHours(),
    //     data[currentIndex].state
    // ]

    return data[currentIndex].state
}

const checkEndDate = (stateTime: any, timeFrame: any) => {
    const timeFrameSeconds = timeFrame.end.getTime()
    const logic = stateTime > timeFrameSeconds

    return logic
}

const checkStartDate = (stateTime: any, timeFrame: any) => {
    const timeFrameSeconds = timeFrame.start.getTime()

    //const logic data range (startTime - 1) day to Endtime
    //-1 day for the case wherein data interval is hours and kwh difference is needed to be calculated

    const logic = stateTime >= timeFrameSeconds

    return logic
}

const createEmptyDayArr = (timeframe: any, differenceInDays: number) => { 
    const daySeconds = 1000 * 60 * 60 * 24
    let startSeconds = timeframe.start.getTime() - daySeconds
    
    console.log(new Date(startSeconds).getDate())

    const dayValuePairs = Array.from({ length: differenceInDays }, (_, index) => {
        startSeconds = startSeconds + daySeconds
        return [(new Date(startSeconds).getDate().toString()), []] 
    });

    const toObject = Object.fromEntries(dayValuePairs)
    
    return toObject
}

const groupByHours = async(timeframe: any, data: any[], name: string, differenceInDays: number) => {
    const hoursArr = <any>[]
    const toBeFilledDayArr = createEmptyDayArr(timeframe, differenceInDays)

    // console.log(toBeFilledDayArr)

    console.log(timeframe)

    data.every((val, index, arr) => {
        // const dataParams = {
        //     val: val,
        //     index: index,
        //     arr: arr
        // }

        const stateTime = {
            hour: parseTimestamp(val.last_changed).getHours(),
            day: parseTimestamp(val.last_changed).getDate(),
            month: parseTimestamp(val.last_changed).getMonth(),
        }

        const parsedToSeconds = parseTimestamp(val.last_changed).getTime()

        // console.log(`
        //     state time: ${val.last_changed} 
        //     timeframe start: ${timeframe.start}
        //     timeframe end: ${timeframe.end} 
        //     isStateTimeMoreThanTimeframeEnd: ${stateTime.hour > timeframe.end.getHours()}
        //     checkEnd: ${checkEndDate(parsedToSeconds, timeframe)}
        //     checkStart: ${checkStartDate(parsedToSeconds, timeframe)}
        // `)

        // console.log(val.last_changed)
    
        if(checkEndDate(parsedToSeconds, timeframe)){
            // console.log('pumapasok')
            return false
        }

        const hoursData = {
            name: name,
            index: index,
            time: {
                last_changed: val.last_changed,
                hour: stateTime.hour,
                day: stateTime.day,
                month: stateTime.month,
            },
            state: val.state
        }

        if(checkStartDate(parsedToSeconds, timeframe)){
            hoursArr.push(hoursData)
        }

        return true
    })

    if(hoursArr.length === 0){
        return null
    }

    const indexOfFirstData = hoursArr[0].index

    const nearestPrevData = getNearestPrevData(indexOfFirstData, data)

    console.log(`nearest data: ${JSON.stringify(nearestPrevData)}`)

    const groupedByDay = _.groupBy(hoursArr, ({time}) => time.day)

    Object.entries(groupedByDay).map(([key, value]) => {
        toBeFilledDayArr[key] = value
    })

    // console.log(toBeFilledDayArr)

    const byHour = Object.entries(toBeFilledDayArr).map(([key, byDay]) => {
        if(byDay.length > 0){
            const groupByHours = _.groupBy(byDay, ({time}) => time.hour)

            return groupByHours
        }
        else{
            return ([])
        }
    })

    // console.log(groupedByDay)
    // console.log(byHour)

    const kwhConsumed = byHour.map(item => {
        return (
            Object.entries(item).map(([key, value]) => {
                if(value.length > 0){
                    let lastItemIndex = value.length - 1
                    let firstItemIndex = 0
                    let hourInterval
                    
                    if(value.length === 1){
                        return([
                            parseInt(key), value[0].state, hourInterval = true
                        ])
                    }

                    while(value[firstItemIndex].state === 'unavailable' || value[firstItemIndex].state === 0){
                        firstItemIndex++
                    }

                    while(value[lastItemIndex].state === 'unavailable' || value[firstItemIndex].state === 0){
                        lastItemIndex--
                    }

                    const firstStateVal = value[firstItemIndex].state
                    const lastStateVal = value[lastItemIndex].state
                    const kwh = lastStateVal - firstStateVal

                    console.log(getHoursFormat(value[firstItemIndex].time.last_changed))
                    console.log(new Date(value[firstItemIndex].time.last_changed))
                    return (
                        [
                            parseInt(key), kwh, hourInterval = false
                        ]
                    )
                } else {
                    return ([])
                }
            })
        )
    })

    console.log(kwhConsumed)

    // compute if hourInterval
    const computeKwh = kwhConsumed.map((item, parentIndex, parentArr) => {
        if(item.length < 1){
            console.log('pasok empty arr')
            return ([])
        }

        // console.log(item)

        const kwhPerHour = item.map((hourData, index, arr) => {
            if(hourData[2] === false){
                return [hourData[0], hourData[1]]
            } else if(index > 0 && (hourData[1] !== 'unavailable' || hourData[1] !== 0)){
                let prevStateIndex = index - 1

                while(prevStateIndex >= 0 && (arr[prevStateIndex][1] === 'unavailable' || arr[prevStateIndex][1] === 0)){
                    console.log('value ay 0')
                    prevStateIndex--
                }

                // console.log(prevStateIndex)
                const prevData = arr[prevStateIndex][1]
                const currentData = hourData[1]
                const difference = currentData - prevData

                // console.log(prevState)
                return [hourData[0], difference]
            } else if (parentIndex > 0 && parentArr[parentIndex - 1].length < 1 && index === 0){
                const prevData = nearestPrevData
                const currentData = hourData

                const difference = hourData[1] - nearestPrevData

                return [hourData[0], difference]
            } else if(index === 0 && parentIndex > 0){
                const currentData = hourData
                let prevArrLastIndex = parentArr[parentIndex - 1].length

                while(parentArr[parentIndex - 1][prevArrLastIndex - 1][1] === 'unavailable' || parentArr[parentIndex - 1][prevArrLastIndex - 1][1] === 0){
                    prevArrLastIndex--
                }

                const prevArrayData = parentArr[parentIndex - 1][prevArrLastIndex - 1]
                const difference = currentData[1] - prevArrayData[1]

                return [hourData[0], difference]
            } else {
                const prevData = nearestPrevData
                const currentData = hourData
                const difference = hourData[1] - nearestPrevData

                return [hourData[0], difference]
            }
        })

        return kwhPerHour
    })

    // console.log('computeKwh: ')
    // console.log(computeKwh)

    const filledkwHArr = computeKwh.map(item => {
        const toBeFilledArray = Array.from({ length: 24 }, (_, index) => [index, 0]);
        const dayArr = item

        dayArr.forEach(([hour, value]) => {
            toBeFilledArray[hour][1] = value;
        });

        return toBeFilledArray
    })

    // console.log('filledkWh: ')
    // console.log(filledkwHArr)

    const joined = [].concat(...filledkwHArr)
    
    const formattedTime = joined.map(item => ([
        getHoursFromNumber(item[0]), item[1] 
    ]))

    console.log(formattedTime)

    return hoursArr
}

const groupByDays = async(timeframe: any, data: any[], name: string) => {
    const daysArr = []   
}

const groupByMonths = async(timeframe: any, data: any[], name: string) => {
    const monthsArr = <any>[]
    const timeframeCopy = timeframe.start

    console.log(timeframe)

    data.every((val, index, arr) => {
        const stateTime = parseTimestamp(val.last_changed)
        console.log(`
            state time: ${stateTime} 
            timeframe end: ${timeframe.end} 
            isStateTimeMoreThanTimeframeEnd: ${stateTime < timeframe.end}
        `)

        if(stateTime > timeframe.end){
            return false
        }

        const monthsData = {
            name: name,
            month: stateTime.getMonth(),
            state: val.state
        }

        if(stateTime.getMonth() >= timeframe.start.getMonth()){
            monthsArr.push(monthsData)
        }

        return true
    })

    return monthsArr
}

const useLocalDatabase = (props: UseAllHistoryParams) => {
    const [ data, setData ] = useState({})
    const parsed = {
        AC: JSON.parse(JSON.stringify(ACEnergy)).default,
        PC: JSON.parse(JSON.stringify(PCEnergy)).default,
        Monitor: JSON.parse(JSON.stringify(MonitorEnergy)).default,
        EFan: JSON.parse(JSON.stringify(EFanEnergy)).default
    }

    // console.log(parsed)

    const timeFrame = {
        start: props?.startTime,
        end: props?.endTime
    };
    
    useEffect(() => {
        const allSensors = {} 
        // Function to parse ISO 8601 timestamp and return date object
        
        const groupByTimeframe = async() => {
            Object.entries(parsed).forEach(async([key, item]) => {
                // Filter data within the specified time frame

                const parsedTimeframe = {
                    start: parseTimestamp(timeFrame.start),
                    end: parseTimestamp(timeFrame.end)
                }

                const differenceInDays = ((parsedTimeframe.end.getTime() - parsedTimeframe.start.getTime()) / (1000 * 60 * 60 * 24))

                console.log(differenceInDays)
                console.log(parsedTimeframe)

                if(differenceInDays <= 3){
                    console.log('pasok hours')
                    allSensors[key] = await groupByHours(parsedTimeframe, item, key, differenceInDays)
                } else if (differenceInDays <= 36){
                    console.log('pasok days')
                    allSensors[key] = await groupByDays(parsedTimeframe, item, key, differenceInDays)
                    
                } else {
                    allSensors[key] = await groupByMonths(parsedTimeframe, item, key, differenceInDays)
                }
                
            });

            setData(allSensors)
        }

        groupByTimeframe()

        console.log(data)
    }, [ props?.userId ])

    return data
}

export default useLocalDatabase

// allSensors[key] = value

// Object.entries(parsed).forEach(([key, item]) => {
//     const grouped = {
//         hourInterval: <any>[],
//         minuteInterval: <any>[]
//     }

//     item.forEach((val, index, arr) => {  
//         const currentValDate = new Date(val?.last_changed)
//         const lastValDate = new Date(arr[index - 1]?.last_changed)
//         const nowTime = currentValDate.getTime()
//         const prevTime = lastValDate.getTime()
//         const difference = nowTime - prevTime
       
//         if(difference){
//             const hours = difference / 3600000
            
//             if(hours >= 1){
//                 grouped.hourInterval.push(val)
//             } else {
//                 grouped.minuteInterval.push(val)
//             }
//         }
//     })

//     allSensors[key] = grouped
// });


// previous Data
// const grouped = {
//     hourInterval: <any>[],
//     minuteInterval: <any>[]
// }

// let prevTime: any = null;

// item.forEach((val, index, arr) => {  
//     const currentTime = new Date(val?.last_changed).getTime();
//     if (prevTime) {
//         const difference = (currentTime - prevTime) / (1000 * 60); // Difference in minutes

//         if (difference >= 60) {
//             grouped.hourInterval.push(val);
//         } else {
//             grouped.minuteInterval.push(val);
//         }
//     } else {
//         grouped.hourInterval.push(val)
//     }
//     prevTime = currentTime;
// })

// allSensors[key] = grouped
// });


// by intevals nextTime - currentTime
// const groupByIntervals = async() => {
//     Object.entries(parsed).forEach(([key, item]) => {
//         const grouped = {
//             hourInterval: <any>[],
//             minuteInterval: <any>[]
//         }

//         let currentTime: any = new Date(item[0].last_changed).getTime()

//         item.forEach((val, index, arr) => {  
//             const nextTime = new Date(arr[index + 1]?.last_changed).getTime();

//             const difference = (nextTime - currentTime) / (1000 * 60); // Difference in minutes

//             if (difference >= 60) {
//                 grouped.hourInterval.push(val);
//             } else {
//                 grouped.minuteInterval.push(val);
//             }
            
//             currentTime = nextTime;
//         })

//         allSensors[key] = grouped
//     });

//     console.log(allSensors)
// }

// groupByIntervals()

// const groupedArray = byDay.reduce((acc, obj) => {
        //     const found = acc.find((item: any) => item[0]?.time.hour === obj.time.hour)

        //     if(found){
        //         found.push(obj)
        //     }else{
        //         acc.push([obj])
        //     }

        //     return acc
        // }, [])

        // return([
        //     ...groupedArray
        // ])