import { ACEnergy, PCEnergy, MonitorEnergy, EFanEnergy } from "../../assets/sensorData/sensorDataIndex";
import React, { useEffect, useState } from 'react'
import useAllSensorHistory, { UseAllHistoryParams } from './useAllSensoryHistory'
import _, { fill } from 'lodash'
import getMDYFormat, { getMDYFormatGetFunctions, getHoursFormat, getHoursFromNumber } from '../functions/getMDYFormat'

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const getMonthName = (num: number) => {
    const month = monthNames[num]

    return month
}

const doRoundtoFixed = (num: number, decPlaces: number) => {
    const rounded = parseFloat(num.toFixed(2))

    return rounded
}

const doRoundNumber = (num: number, decPlaces: number) => {
    const rounded = (Math.round((num + Number.EPSILON) * (10 ** decPlaces)) / (10 ** decPlaces))

    return rounded
}
/*
    parseTimeStamp()
        - parses datestring to Date Object
*/

const parseTimestamp = (timestamp: string) => new Date(timestamp);

/*
    getNearestPrevData()
        - Gets the nearest previous data from the start of the data that is within the timeframe set by the user
        - is used to compute the difference kwh of the state of the first data of the timeframe-bound array if the state is also an hour-interval state value  
*/

const getNearestPrevData = (index: any, data: any) => {
    let currentIndex = index

    while((data[currentIndex].state === 'unavailable' || data[currentIndex].state === 0) && currentIndex >= 0){
        currentIndex--
    }

    if(currentIndex === -1){
        return null
    }
    // const toArray = [
    //     new Date(data[currentIndex].last_changed).getHours(),
    //     data[currentIndex].state
    // ]

    return data[currentIndex].state
}

/* 
    checkEndDate()
        - checks whether the data from ha-formatted data is above the end timeFrame set by the user(default set to year on dashboard page)
*/

const checkEndDate = (stateTime: any, timeFrame: any) => {
    const timeFrameSeconds = timeFrame.end.getTime()
    const logic = stateTime > timeFrameSeconds

    return logic
}

/* 
    checkStartDate()
        - checks whether the data from ha-formatted data is above the start timeFrame set by the user(default set to year on dashboard page)
*/

const checkStartDate = (stateTime: any, timeFrame: any) => {
    const timeFrameSeconds = timeFrame.start.getTime()

    //const logic data range (startTime - 1) day to Endtime
    //-1 day for the case wherein data interval is hours and kwh difference is needed to be calculated

    const logic = stateTime >= timeFrameSeconds

    return logic
}

/* 
    createEmptyDayArr 
        - created an empty object with all the days within the timeframe as keys 
        - this is to ensure that the array is in the exact 24hour section in the graph
*/

const createEmptyDayArr = (timeframe: any) => { 
    const difference = (timeframe.end.getTime() - timeframe.start.getTime()) / (1000 * 60 * 60 * 24)
    console.log(`day difference ${difference}`)
    // const daySeconds = 1000 * 60 * 60 * 24
    // let startSeconds = timeframe.start.getTime() - daySeconds
    
    // console.log(new Date(startSeconds).getDate())

    // const dayValuePairs = Array.from({ length: differenceInDays === 0 ? 1 : differenceInDays }, (_, index) => {
    //     startSeconds = startSeconds + daySeconds
    //     return [(new Date(startSeconds).getDate().toString()), []] 
    // });

    // const toObject = Object.fromEntries(dayValuePairs)
    
    // return toObject
}

/*

*/

const createEmptyMonthArr = (timeframe: any) => {
    const difference = (new Date(timeframe.end.getFullYear(), timeframe.end.getMonth(), 1).getTime() - new Date(timeframe.start.getFullYear(), timeframe.start.getMonth(), 1).getTime()) / (1000 * 60 * 60 * 24 * 30.437)
    console.log(`month difference ${difference}`)
    const differenceInDays = (timeframe.end.getTime() - timeframe.start.getTime()) / (1000 * 60 * 60 * 24)
    console.log(`day difference ${differenceInDays}`)

    let currentMonth = new Date(timeframe.start.getFullYear(), timeframe.start.getMonth() - 1, 1).getMonth()
    let currentDay = timeframe.start

    const monthValuePairs = Array.from({ length: Math.round(difference) + 1 }, (_, index) => {
        let dayArr = []
        currentMonth = new Date(new Date(currentMonth).getFullYear(), currentMonth + 1, 1).getMonth()
        while(currentDay.getMonth() === currentMonth && currentDay.getTime() <= timeframe.end.getTime()){
            dayArr.push([
                currentDay.getDate().toString(), {}
            ])
            currentDay = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate() + 1)
        }

        const toObject = Object.fromEntries(dayArr)
        
        return ([currentMonth, toObject])
    });

    const toObject = Object.fromEntries(monthValuePairs)

    return toObject
} 

const createEmptyYearArr = (timeframe: any) => {
    const startYear = new Date(timeframe.start).getTime()
    const endYear = new Date(timeframe.end).getTime()
    const differenceInYears = new Date(endYear).getFullYear() - new Date(startYear).getFullYear()

    let counter = new Date(startYear).getFullYear() - 1

    const monthsArray = Array.from({ length: 12 }, (_, index) => [index, []]);

    const yearValuePairs = Array.from({ length: differenceInYears === 0 ? 1 : differenceInYears }, (_, index) => {
        counter++
        return [(new Date(counter, 0, 1).getFullYear().toString()), Object.fromEntries(monthsArray)] 
    });

    const toObject = Object.fromEntries(yearValuePairs)

    return toObject
}

const groupByHours = async(timeframe: any, data: any[], name: string, differenceInDays: number) => {
    const hoursArr = <any>[]
    // const toBeFilledDayArr = createEmptyDayArr(timeframe, differenceInDays)
    const toBeFilledMonthArr = createEmptyMonthArr(timeframe)

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

    console.log(hoursArr)

    if(hoursArr.length === 0){
        return null
    }

    const indexOfFirstData = hoursArr[0].index

    const nearestPrevData = getNearestPrevData(indexOfFirstData, data)

    console.log(`nearest data: ${JSON.stringify(nearestPrevData)}`)

    const groupedByMonth = _.groupBy(hoursArr, (({time}) => time.month))

    // console.log(groupedByMonth)
    
    const groupedByDay = Object.entries(groupedByMonth).map(([key, byMonth]) => {
        if(byMonth.length === 0){
            return ([])
        }

        const grouped = _.groupBy(byMonth, ({time}) => time.day)

        const toArray = Object.entries(grouped).map(([key, value]) => {
            return value
        })

        return [key, grouped]
    })

    // console.log(groupedByDay)

    const groupedByHour = groupedByDay.map(([key, byDay]) => {
        if(Object.keys(byDay).length === 0){
            return ([])
        }
        
        const grouped = Object.entries(byDay).map(([key, value]) => {
            if(value.length === 0){
                return ([])
            }

            const grouped = _.groupBy(value, ({time}) => time.hour)
            return ([
                key, grouped
            ])
        })

        const toObject = Object.fromEntries(grouped)

        return [key, toObject]
    })

    const groupedByHourObject = Object.fromEntries(groupedByHour)

    // console.log(JSON.stringify(groupedByHourObject))
    console.log(JSON.stringify(toBeFilledMonthArr))

    Object.entries(groupedByHourObject).forEach(([key, value]) => {
        // toBeFilledMonthArr[key] = value

        Object.entries(value).forEach(([dayKey, dayValue]) => {
            toBeFilledMonthArr[key][dayKey] = dayValue
        })
    })

    console.log(JSON.stringify(toBeFilledMonthArr))

    //-------------------------------------------------

    const kwhConsumed = Object.entries(toBeFilledMonthArr).map(([monthKey, monthVal], monthIndex, monthArr) => {
        let hadMonthChange = false
        if(Object.keys(monthVal).length === 0){
            return [monthKey, {}]
        }
    
        const dayArr = Object.entries(monthVal).map(([dayKey, dayVal], dayIndex, dayArr) => {
            if(Object.keys(dayVal).length ===  0){
                return [dayKey, []]
            }
            
            const hourArr = Object.entries(dayVal).map(([hourKey, hourVal], hourIndex, hourArr) => {
                let lastItemIndex = hourVal.length - 1
                let firstItemIndex = 0
                let hourInterval;

                const ifMonthChangeRange = parseInt(hourKey) <= 23 && parseInt(hourKey) > 20

                if (hourVal.length === 1 && ifMonthChangeRange && dayKey === '1' && !hadMonthChange){
                    if(hourVal[0].state !== 'unavailable' || hourVal[0].state !== 0){
                        hadMonthChange = true
                        return [
                            hourKey, hourVal[0].state, hourInterval = false
                        ]
                    } 
                } else if (hourVal.length === 1){
                    return [
                        hourKey, hourVal[0].state, hourInterval = true  
                    ] 
                } 

                while(hourVal[firstItemIndex].state === 'unavailable' || hourVal[firstItemIndex].state === 0){
                    firstItemIndex++
                }

                while(hourVal[lastItemIndex].state === 'unavailable' || hourVal[firstItemIndex].state === 0){
                    lastItemIndex--
                }

                // if(dayKey === '1' && ifMonthChangeRange && !hadMonthChange){
                //     if(hourVal[0].state !== 'unavailable' || hourVal[0].state !== 0){
                //         hadMonthChange = true
                //         return [
                //             hourKey, hourVal[0].state, hourInterval = false
                //         ]
                //     }
                // }

                const firstStateVal = hourVal[firstItemIndex].state
                const lastStateVal = hourVal[lastItemIndex].state
                const kwh = lastStateVal - firstStateVal

                return (
                    [
                        hourKey, kwh, hourInterval = false
                    ]
                )
            }) 

            return [dayKey, hourArr]
        })

        const toObject = Object.fromEntries(dayArr)

        return [monthKey, toObject]
    })

    const kwhConsumedObject = Object.fromEntries(kwhConsumed)

    console.log(kwhConsumedObject)

    const removeMonthKeys = Object.entries(kwhConsumedObject).map(([monthKey, monthVal], monthIndex, monthArr) => {
            if(Object.keys(monthVal).length === 0){
                return [monthKey, {}]
            }
        
            const dayArr = Object.entries(monthVal).map(([dayKey, dayVal], dayIndex, dayArr) => {
                if(dayVal.length ===  0){
                    return [dayKey, []]
                }
                
                const hourArr = dayVal.map((hourVal, hourIndex, hourArr) => {
                    return hourVal
                }) 
    
                return [dayKey, hourArr]
            })
    
            // const toObject = Object.fromEntries(dayArr)
    
        return dayArr
    })

    const regroupDays = [].concat(...removeMonthKeys)

    // console.log(regroupDays)

    const filledkwHArr = regroupDays.map(([key, dayArr]) => {
        const defaultHourInterval = false
        const toBeFilledArray = Array.from({ length: 24 }, (_, index) => [index, 0, defaultHourInterval]);
        const modifiedDayArr = dayArr

        modifiedDayArr.forEach(([hourString, val, hourInterval]) => {
            // console.log([hourString, val, hourInterval])
            const parsed = parseInt(hourString)
            toBeFilledArray[parsed][1] = val
            toBeFilledArray[parsed][2] = hourInterval
        })

        return toBeFilledArray
    })

    const joinedTimeValue = [].concat(...filledkwHArr)

    let prevVal = nearestPrevData
    const computeKwh = joinedTimeValue.map(([hour, data, isHourInterval], index, arr) => {
        const formatHour = getHoursFromNumber(hour)
        const noVal = data === 0 || data === 'unavailable'
        if(hour === 22 && arr[index - 1][2] === false && prevVal >= data && !noVal){ // case for monthChange on first arr
            prevVal = arr[index - 1][1]
            const difference = data - prevVal
            prevVal = data
            return [formatHour, difference]
        } else if(isHourInterval && !noVal){
            const difference = data - prevVal
            prevVal = data
            return [formatHour, difference]
        } else {
            return [formatHour, data]
        }
    })

    console.log(joinedTimeValue)
    // console.log(computeKwh)

    const slice = computeKwh.slice(0, ((differenceInDays) * 24))

    return slice
}

const groupByDays = async(timeframe: any, data: any[], name: string) => {
    const daysArr = []   
}

const groupByMonths = async(timeframe: any, data: any[], name: string) => {
    const toBeFilledYearArray = createEmptyYearArr(timeframe)
    // console.log(emptyYearArray)
    
    const monthsArr = <any>[]
    const timeframeCopy = timeframe.start

    console.log(timeframe)

    data.every((val, index, arr) => {
        const stateTime = {
            hour: parseTimestamp(val.last_changed).getHours(),
            day: parseTimestamp(val.last_changed).getDate(),
            month: parseTimestamp(val.last_changed).getMonth(),
            year: parseTimestamp(val.last_changed).getFullYear()
        }

        const parsedToSeconds = parseTimestamp(val.last_changed).getTime()
        // console.log(`
        //     state time: ${stateTime} 
        //     timeframe end: ${timeframe.end} 
        //     isStateTimeMoreThanTimeframeEnd: ${stateTime < timeframe.end}
        // `)

        const modifiedTimeFrame = {
            start: timeframe.start,
            end: timeframe.end
        }

        if(checkEndDate(parsedToSeconds, modifiedTimeFrame)){
            return false
        }

        const monthsData = {
            name: name,
            time: {
                last_changed: val.last_changed,
                hour: stateTime.hour,
                day: stateTime.day,
                month: stateTime.month,
                year: stateTime.year,
            },
            state: val.state
        }

        if(stateTime.month >= timeframe.start.getMonth()){
            monthsArr.push(monthsData)
        }

        return true
    })

    console.log(monthsArr)

    const indexOfFirstData = monthsArr[0].index

    // const nearestPrevData = getNearestPrevData(indexOfFirstData, data)

    const groupedByYears = _.groupBy(monthsArr, (({time}) => time.year))

    const groupedByMonths = Object.entries(groupedByYears).map(([key, yearVal]) => {
        const grouped = _.groupBy(yearVal, (({time}) => time.month))

        return [key, grouped]
    })

    const groupedByMonthsObj = Object.fromEntries(groupedByMonths)

    console.log(toBeFilledYearArray)
    console.log(groupedByMonthsObj)

    Object.entries(groupedByMonthsObj).forEach(([yearKey, yearVal]) => {
        Object.entries(yearVal).forEach(([monthKey, monthVal]) => {
            toBeFilledYearArray[yearKey][monthKey] = monthVal
        })
    })

    // Object.entries(_.groupBy(monthVal, ({time}) => time.day)).map(([key, val]) => ([key, val]))

    console.log(toBeFilledYearArray)

    const kwhConsumed = Object.entries(toBeFilledYearArray).map(([yearKey, yearVal], yearIndex, yearArr) => {
        const newMonthsArr = []
        const yearLength = yearArr.length
        // console.log(Object.entries(yearArr[0][1])[2][1])

        const computed = Object.entries(yearVal).map(([monthKey, monthVal], monthIndex, monthArr) => {
            if(monthVal.length === 0){
                return []
            }
        
            let lastItemIndex = monthVal.length - 1
            let firstItemIndex = 0
            let accumulator = 0
            let prevState = monthVal[firstItemIndex].state;
            // let isAccumulatorReset = false

            while(monthVal[firstItemIndex].state === 'unavailable'){
                console.log(firstItemIndex)
                firstItemIndex++
            }

            prevState = monthVal[firstItemIndex].state
            
            console.log(monthVal[firstItemIndex].name)
            console.log(monthVal[firstItemIndex].time.month.toString())
            // console.log('prevState ' + prevState)
            // console.log('acc ' + accumulator)

            
            monthVal.every((item, index, arr) => {
                const noVal = item.state === 0 || item.state === 'unavailable'
                // console.log(noVal)
                // console.log('stateNow' + item.state)
                // console.log('prev' + prevState)
                if(index === 0 || noVal){
                    // console.log('noval')
                    return true
                } else if(!noVal && item.state < prevState) {
                    console.log('reset')
                    console.log(`${item.state}`)
                    console.log(`${prevState}`)
                    const diffPrevToCurrent = Math.abs(item.state - prevState)
                    const diffZeroToCurrent = Math.abs(0 - item.state)

                    if(diffZeroToCurrent < diffPrevToCurrent){
                        accumulator = accumulator + item.state
                    } else {
                        accumulator = accumulator + (prevState - item.state)
                    }
                    // if(Math.abs([itemState - prevState]))
                    // accumulator = accumulator + item.state
                    prevState = item.state
                    return true
                } else {
                    const difference = item.state - prevState
                    
                    accumulator = accumulator + difference
                    prevState = item.state
                    return true
                }

            })

            console.log(doRoundNumber(accumulator, 2))

            return [getMonthName(parseInt(monthKey)), doRoundNumber(accumulator, 2)]
        })

        return computed
    })

    const decomposeYear = [].concat(...kwhConsumed)

    const removeEmptyArray = decomposeYear.filter(arr => arr.length > 0)

    return removeEmptyArray
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
                    const monthTimeframe = {
                        start: parsedTimeframe.start,
                        end: new Date(parsedTimeframe.end.getFullYear(), parsedTimeframe.end.getMonth() + 1, 0, 23, 59, 59)
                    }
                    allSensors[key] = await groupByMonths(monthTimeframe, item, key, differenceInDays)
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

//---------------------------------------------------------------------

//     const filledkwHArr = Object.entries(regroupDays).map(([key, value]) => {
//         const toBeFilledArray = Array.from({ length: 24 }, (_, index) => [index, 0]);
//         const dayArr = value

//         dayArr.forEach(([hour, value, hourInterval]) => {
//             toBeFilledArray[hour][1] = value;
//             toBeFilledArray
//         });
// })

    // const filledkwHArr = computeKwh.map(item => {
    //     const toBeFilledArray = Array.from({ length: 24 }, (_, index) => [index, 0]);
    //     const dayArr = item

    //     dayArr.forEach(([hour, value]) => {
    //         toBeFilledArray[hour][1] = value;
    //     });

    //     return toBeFilledArray
    // })

    // console.log('filledkWh: ')
    // console.log(filledkwHArr)

    // const joined = [].concat(...filledkwHArr)
    
    // const formattedTime = joined.map(item => ([
    //     getHoursFromNumber(item[0]), item[1] 
    // ]))

    // console.log(formattedTime)

    // console.log(regroupDays)

    // const computeKwh = Object.entries(kwhConsumedObject).map(([monthKey, monthVal], monthIndex, monthArr) => {
    //     if(Object.keys(monthVal).length === 0){
    //         return [monthKey, {}]
    //     }
    
    //     const dayArr = Object.entries(monthVal).map(([dayKey, dayVal], dayIndex, dayArr) => {
    //         if(dayVal.length ===  0){
    //             return [dayKey, []]
    //         }
            
    //         const hourArr = dayVal.map((hourVal, hourIndex, hourArr) => {
    //             if(hourVal[2] === false){
    //                 return [hourVal[0], hourVal[1]]
    //             } else if ((dayIndex === 0 && hourIndex === 0 && monthIndex === 0) ){
    //                 // const prevData = nearestPrevData
    //                 // const currentData = hourData
    
    //                 // const difference = hourData[1] - nearestPrevData
    
    //                 // return [hourData[0], difference]
    //             }
    //         }) 

    //         return [dayKey, hourArr]
    //     })

    //     const toObject = Object.fromEntries(dayArr)

    //     return [monthKey, toObject]
    // })

    //-------------------------------------------------------------------

    // const computeKwh = kwhConsumed.map((item, parentIndex, parentArr) => {
    //     if(item.length < 1){
    //         console.log('pasok empty arr')
    //         return ([])
    //     }

    //     console.log(`item ${parentIndex}`)
    //     console.log(item)

    //     const kwhPerHour = item.map((hourData, index, arr) => {
    //         if(hourData[2] === false){
    //             return [hourData[0], hourData[1]]
    //         } else if ((parentIndex === 0 && index === 0) || (parentIndex > 0 && parentArr[parentIndex - 1].length < 1 && index === 0)){
                
    //             const prevData = nearestPrevData
    //             const currentData = hourData

    //             const difference = hourData[1] - nearestPrevData

    //             return [hourData[0], difference]
    //         } else if(index === 0 && parentIndex > 0){
    //             const currentData = hourData
    //             let prevArrLastIndex = parentArr[parentIndex - 1].length

    //             while(parentArr[parentIndex - 1][prevArrLastIndex - 1][1] === 'unavailable' || parentArr[parentIndex - 1][prevArrLastIndex - 1][1] === 0){
    //                 prevArrLastIndex--
    //             }

    //             const prevArrayData = parentArr[parentIndex - 1][prevArrLastIndex - 1]
    //             const difference = currentData[1] - prevArrayData[1]

    //             return [hourData[0], difference]
    //         } else if(index > 0 && (hourData[1] !== 'unavailable' || hourData[1] !== 0)){
    //             let prevStateIndex = index - 1

    //             while(prevStateIndex >= 0 && (arr[prevStateIndex][1] === 'unavailable' || arr[prevStateIndex][1] === 0)){
    //                 if(prevStateIndex === -1){
    //                     return []
    //                 }
    //                 console.log('value ay 0')
    //                 prevStateIndex--
    //             }

    //             // console.log(prevStateIndex)
    //             const prevData = arr[prevStateIndex][1]
    //             const currentData = hourData[1]
    //             const difference = currentData - prevData

    //             // console.log(prevState)
    //             return [hourData[0], difference]
    //         } else {
    //             const prevData = nearestPrevData
    //             const currentData = hourData
    //             const difference = hourData[1] - nearestPrevData

    //             return [hourData[0], difference]
    //         }
    //     })

    //     return kwhPerHour
    // })

    // console.log(groupedByHour)
    // const groupedByDay = _.groupBy(hoursArr, ({time}) => time.day)

    // Object.entries(groupedByDay).map(([key, value]) => {
    //     toBeFilledDayArr[key] = value
    // })

    // // console.log(toBeFilledDayArr)

    // const byHour = Object.entries(toBeFilledDayArr).map(([key, byDay]) => {
    //     if(byDay.length > 0){
    //         const groupByHours = _.groupBy(byDay, ({time}) => time.hour)

    //         return groupByHours
    //     }
    //     else{
    //         return ([])
    //     }
    // })

    // // console.log(groupedByDay)
    // // console.log(byHour)

    // const kwhConsumed = byHour.map(item => {
    //     return (
    //         Object.entries(item).map(([key, value]) => {
    //             if(value.length > 0){
    //                 let lastItemIndex = value.length - 1
    //                 let firstItemIndex = 0
    //                 let hourInterval
                    
    //                 if(value.length === 1){
    //                     return([
    //                         parseInt(key), value[0].state, hourInterval = true
    //                     ])
    //                 }

    //                 while(value[firstItemIndex].state === 'unavailable' || value[firstItemIndex].state === 0){
    //                     firstItemIndex++
    //                 }

    //                 while(value[lastItemIndex].state === 'unavailable' || value[firstItemIndex].state === 0){
    //                     lastItemIndex--
    //                 }

    //                 const firstStateVal = value[firstItemIndex].state
    //                 const lastStateVal = value[lastItemIndex].state
    //                 const kwh = lastStateVal - firstStateVal

    //                 console.log(getHoursFormat(value[firstItemIndex].time.last_changed))
    //                 console.log(new Date(value[firstItemIndex].time.last_changed))
    //                 return (
    //                     [
    //                         parseInt(key), kwh, hourInterval = false
    //                     ]
    //                 )
    //             } else {
    //                 return ([])
    //             }
    //         })
    //     )
    // })

    // console.log(kwhConsumed)

    // // compute if hourInterval
    // const computeKwh = kwhConsumed.map((item, parentIndex, parentArr) => {
    //     if(item.length < 1){
    //         console.log('pasok empty arr')
    //         return ([])
    //     }

    //     console.log(`item ${parentIndex}`)
    //     console.log(item)

    //     const kwhPerHour = item.map((hourData, index, arr) => {
    //         if(hourData[2] === false){
    //             return [hourData[0], hourData[1]]
    //         } else if ((parentIndex === 0 && index === 0) || (parentIndex > 0 && parentArr[parentIndex - 1].length < 1 && index === 0)){
                
    //             const prevData = nearestPrevData
    //             const currentData = hourData

    //             const difference = hourData[1] - nearestPrevData

    //             return [hourData[0], difference]
    //         } else if(index === 0 && parentIndex > 0){
    //             const currentData = hourData
    //             let prevArrLastIndex = parentArr[parentIndex - 1].length

    //             while(parentArr[parentIndex - 1][prevArrLastIndex - 1][1] === 'unavailable' || parentArr[parentIndex - 1][prevArrLastIndex - 1][1] === 0){
    //                 prevArrLastIndex--
    //             }

    //             const prevArrayData = parentArr[parentIndex - 1][prevArrLastIndex - 1]
    //             const difference = currentData[1] - prevArrayData[1]

    //             return [hourData[0], difference]
    //         } else if(index > 0 && (hourData[1] !== 'unavailable' || hourData[1] !== 0)){
    //             let prevStateIndex = index - 1

    //             while(prevStateIndex >= 0 && (arr[prevStateIndex][1] === 'unavailable' || arr[prevStateIndex][1] === 0)){
    //                 if(prevStateIndex === -1){
    //                     return []
    //                 }
    //                 console.log('value ay 0')
    //                 prevStateIndex--
    //             }

    //             // console.log(prevStateIndex)
    //             const prevData = arr[prevStateIndex][1]
    //             const currentData = hourData[1]
    //             const difference = currentData - prevData

    //             // console.log(prevState)
    //             return [hourData[0], difference]
    //         } else {
    //             const prevData = nearestPrevData
    //             const currentData = hourData
    //             const difference = hourData[1] - nearestPrevData

    //             return [hourData[0], difference]
    //         }
    //     })

    //     return kwhPerHour
    // })

    // // console.log('computeKwh: ')
    // // console.log(computeKwh)

    // const filledkwHArr = computeKwh.map(item => {
    //     const toBeFilledArray = Array.from({ length: 24 }, (_, index) => [index, 0]);
    //     const dayArr = item

    //     dayArr.forEach(([hour, value]) => {
    //         toBeFilledArray[hour][1] = value;
    //     });

    //     return toBeFilledArray
    // })

    // // console.log('filledkWh: ')
    // // console.log(filledkwHArr)

    // const joined = [].concat(...filledkwHArr)
    
    // const formattedTime = joined.map(item => ([
    //     getHoursFromNumber(item[0]), item[1] 
    // ]))

    // console.log(formattedTime)

//-------------------------------------------]

    // while(monthVal[firstItemIndex].state === 'unavailable' || monthVal[firstItemIndex].state === 0){
    //     firstItemIndex++
    // }
        
    // monthVal.every((item, index, arr) => {
    //     if(index === 0){
    //         return true
    //     }
    //     if (item.state !== 0 && item.state !== 'unavailable' && (item.state < arr[index - 1].state)){ //accumulates state differences when accumulation of kwH resets
    //         const stateBeforeReset = arr[index - 1].state
    //         const firstItemOfIteration = arr[firstItemIndex].state
    //         const kwh = stateBeforeReset - firstItemOfIteration
    //         accumulator = accumulator + kwh + item.state
    //         firstItemIndex = index
    //         return false
    //     } else {
    //         return true
    //     }
    // })

    // while(monthVal[lastItemIndex].state === 'unavailable' || monthVal[firstItemIndex].state === 0){
    //     lastItemIndex--
    // }

    // let firstStateVal = monthVal[firstItemIndex].state
    // let lastStateVal = monthVal[lastItemIndex].state

    // if(monthIndex + 1 < 12 && monthArr[monthIndex + 1].length > 0){
    //     const nextMonthArr = monthArr[monthIndex + 1][1]
    //     nextMonthArr.every((item, index, arr) => {
    //         // console.log(item)
    //         const hasNoVal = item.state === 0 || item.state === 'unavailable'
    //         if((item.time.hour >= 20 || item.time.day > 1) && !hasNoVal){
    //             lastStateVal = item.state
    //             return false
    //         } 
    //         return true
    //     })
    // } else if (yearIndex + 1 < yearLength && yearArr[yearIndex + 1].length > 0){
    //     const nextMonthArr = Object.entries(yearArr[yearIndex + 1][1])[0][1]
    //     if(nextMonthArr.length > 0){
    //         nextMonthArr.every((item, index, arr) => {
    //             const hasNoVal = item.state === 0 || item.state === 'unavailable'
    //             if((item.time.hour >= 20 || item.time.day > 1) && !hasNoVal){
    //                 lastStateVal = item.state
    //                 return false
    //             } 
    //             return true
    //         })
    //     }
    // }  

    // console.log(`first: ${firstStateVal}`)
    // console.log(`last: ${lastStateVal}`)

    // const kwh = (lastStateVal - firstStateVal) + accumulator

    // console.log(`kwh: ${kwh}`)

    // return [ monthKey, kwh ]