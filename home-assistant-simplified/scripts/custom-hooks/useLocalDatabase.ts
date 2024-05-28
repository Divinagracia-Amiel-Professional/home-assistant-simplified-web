import { ACEnergy, PCEnergy, MonitorEnergy, EFanEnergy } from "../../assets/sensorData/sensorDataIndex";
import React, { useEffect, useState } from 'react'
import useAllSensorHistory, { UseAllHistoryParams } from './useAllSensoryHistory'
import _, { fill } from 'lodash'
import getMDYFormat, { getMDYFormatGetFunctions, getHoursFormat, getHoursFromNumber } from '../functions/getMDYFormat'

export interface UseAllHistoryParams {
    userId: string,
    startTime: string,
    endTime: string,
    isSummary?: boolean
}

export interface TimeFrame {
    start: Date,
    end: Date
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

const parseTimestamp = (timestamp: string | number) => new Date(timestamp);

/*
    getNearestPrevData()
        - Gets the nearest previous data from the start of the data that is within the timeframe set by the user
        - is used to compute the difference kwh of the state of the first data of the timeframe-bound array if the state is also an hour-interval state value  
*/

const getNearestPrevData = (index: any, data: any) => {
    let currentIndex = index - 1

    if(currentIndex < 0){
        return 0
    }

    while((currentIndex >= 0 && (data[currentIndex].state === 0) || data[currentIndex].state === 'unavailable')){
        currentIndex--
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

const checkEndDate = (stateTime: any, timeFrame: TimeFrame) => {
    const timeFrameSeconds = timeFrame.end.getTime()
    const logic = stateTime > timeFrameSeconds

    return logic
}

/* 
    checkStartDate()
        - checks whether the data from ha-formatted data is above the start timeFrame set by the user(default set to year on dashboard page)
*/

const checkStartDate = (stateTime: any, timeFrame: TimeFrame) => {
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

const nestedGrouping = (seq: any, keys: any) => {
    if (!keys.length)
        return seq;
    var first = keys[0];
    var rest = keys.slice(1);
    return _.mapValues(_.groupBy(seq, first), function (value) { 
        return nestedGrouping(value, rest)
    });
}

const createEmptyYearArr = (timeframe: TimeFrame) => {
    const startYear = new Date(timeframe.start).getTime()
    const endYear = new Date(timeframe.end).getTime()
    const differenceInYears = new Date(endYear).getFullYear() - new Date(startYear).getFullYear()

    let counter = new Date(startYear).getFullYear() - 1

    const yearValuePairs = Array.from({ length: differenceInYears === 0 ? 1 : differenceInYears }, (_, index) => {
        counter++
        const monthsArray = Array.from({ length: 12 }, (_, index) => {
            const lastDayInCurrentMonth = new Date(counter, index + 1, 0).getDate()
                const daysArray = Array.from({ length: lastDayInCurrentMonth}, (_, index) => [index + 1, []])
            return [index, Object.fromEntries(daysArray)]
        });
        return [(new Date(counter, 0, 1).getFullYear().toString()), Object.fromEntries(monthsArray)] 
    });

    const toObject = Object.fromEntries(yearValuePairs)

    return toObject
}

const getTotalKwH = (data: any, prevState: any) => {
    if(!data.length){
        return 0
    }

    let firstItemIndex = 0
    // if(prevState === null){
    //     prevState = nearestPrevData
    // }

    while(data[firstItemIndex].state === 'unavailable'){
        firstItemIndex++
    }

    var isfirstItemStateZero = data[firstItemIndex].state === 0

    console.log(`nearest prevData: ${prevState}`)
    const computeTotalKwh = data.reduce((partialSum, entity, index, arr) => {
        const currentState = entity.state

        if(currentState === 'unavailable' || !currentState){
            return partialSum
        }
        else if (currentState < prevState){
            const diffPrevToCurrent = Math.abs(currentState - prevState)
            const diffZeroToCurrent = Math.abs(0 - currentState)

            if(diffZeroToCurrent < diffPrevToCurrent){
                prevState = currentState
                return partialSum + currentState
            } else {
                const difference = prevState - currentState
                prevState = currentState
                return partialSum + difference
            }
        } else {
            const difference = currentState - prevState
            prevState = currentState
            return partialSum + difference
        }

    }, 0)

    return {total: doRoundNumber(computeTotalKwh, 2), prevState: doRoundNumber(prevState, 2)}
}

const groupByYearsObject = (data: any, timeframe: TimeFrame, name: string) => {
    const toBeFilledYearArray = createEmptyYearArr(timeframe)
    const yearArr = <any>[]

    console.log(timeframe)
    
    data.every((val, index, arr) => {
        const stateTime = {
            hour: parseTimestamp(val.last_changed).getHours(),
            day: parseTimestamp(val.last_changed).getDate(),
            month: parseTimestamp(val.last_changed).getMonth(),
            year: parseTimestamp(val.last_changed).getFullYear()
        }

        const parsedToSeconds = parseTimestamp(val.last_changed).getTime()

        const modifiedTimeFrame = {
            start: timeframe.start,
            end: timeframe.end
        }

        if(checkEndDate(parsedToSeconds, modifiedTimeFrame)){
            return false
        }

        const monthsData = {
            name: name,
            index: index,
            time: {
                last_changed: val.last_changed,
                hour: stateTime.hour,
                day: stateTime.day,
                month: stateTime.month,
                year: stateTime.year,
            },
            state: val.state
        }

        const stateTimeString = {
            hour: stateTime.hour.toString(),
            day: stateTime.day.toString(),
            month: stateTime.month.toString(),
            year: stateTime.year.toString()
        }

        if(checkStartDate(parsedToSeconds, modifiedTimeFrame)){
            yearArr.push(monthsData)
        }

        return true
    })

    console.log(`name: ${name}`)
    console.log(yearArr)

    const yearArrNoUnavail = yearArr.filter(entity => entity.state !== 'unavailable')

    if(yearArrNoUnavail.length === 0){
        console.log('null')
        return null
    }

    const indexOfFirstData = yearArr[0].index

    const nearestPrevData = getNearestPrevData(indexOfFirstData, data)

    const byYear = (state: any) => {
        return state.time.year
    }

    const byMonth = (state: any) => {
        return state.time.month
    }

    const byDay = (state: any) => {
        return state.time.day
    }

    const byHour = (state: any) => {
        return state.time.hour
    }

    const grouped = nestedGrouping(yearArrNoUnavail, [byYear, byMonth, byDay, byHour])

    console.log(grouped)

    Object.entries(grouped).forEach(([yearKey, yearVal]) => {
        Object.entries(yearVal).forEach(([monthKey, monthVal]) => {
            Object.entries(monthVal).forEach(([dayKey, dayVal]) => {
                toBeFilledYearArray[yearKey][monthKey][dayKey] = dayVal
            })
        })
    })

    return {
        grouped: toBeFilledYearArray,
        notFilledGroup: grouped,
        nearestPrevData: nearestPrevData
    }
}

const groupByHours = async(timeframe: TimeFrame, data: any[], name: string, differenceInDays: number) => {
    if(!groupByYearsObject(data, timeframe, name)){
        return 0
    }

    const groupedByYears = groupByYearsObject(data, timeframe, name)?.grouped
    const nearestPrevData = groupByYearsObject(data, timeframe, name)?.nearestPrevData
    const timeFrameDates = {
        start: new Date(timeframe.start).getDate(),
        end: new Date(timeframe.end).getDate()
    }

    if(!groupedByYears){
        return null
    }

    const removeEmpty = Object.entries(groupedByYears).flatMap(([yearKey, yearVal]) => {
        const removedEmptyDay = Object.entries(yearVal).map(([monthKey, monthVal]) => {
            if(![].concat(...Object.values(monthVal)).length){
                return null
            } else {
                return Object.entries(monthVal).map(([key, val]) => ([parseInt(key), val]))
            }  
        })

        const removedEmptyMonth = removedEmptyDay.filter(item => item)
        
        return removedEmptyMonth
    })

    const trimMonth = removeEmpty.map((month, index, arr) => {
        const arrLength = arr.length
        const monthCopy = month

        if(arrLength !== 1){
            if(index === 0){
                return month?.filter(dayItem => {return(dayItem[0] >= timeFrameDates.start)})
            }else{
                return month?.filter(dayItem => {return(dayItem[0] <= timeFrameDates.end)})
            }
        } else {
            return month?.filter(dayItem => {return(dayItem[0] >= timeFrameDates.start && dayItem[0] <= timeFrameDates.end)})
        }
    })

    const flatMonth = trimMonth.flatMap(month => {
        const days = month.map(dayItem => {

            if(!dayItem.length){
                return []
            }
            
            const toArray = Object.entries(dayItem[1]).map(([key, val]) => ([
                key, val
            ]))

            return toArray
        })

        return days
    })

    const toFlatMapAllValues = flatMonth.flatMap(monthArr => {
        const flatDay = monthArr.flatMap(hours => hours[1])

        return flatDay
    })

    console.log(toFlatMapAllValues)

    const filledDayArr = flatMonth.flatMap(dayArr => {
        const toBeFilledArray = Array.from({ length: 24 }, (_, index) => [index, 0]);
        const modifiedDayArr = dayArr
        
        modifiedDayArr.forEach(([key, val]) => {
            toBeFilledArray[key][1] = val
        })

        return toBeFilledArray
    })

    console.log(`nearest Data: ${nearestPrevData}`)
    console.log(filledDayArr)

    let firstItem;
    let prevState = null;
    const computeKwh = filledDayArr.map((item, index, arr) => {
        if(!item[1]){
            return [getHoursFromNumber(item[0]), 0]
        }
 
        if(item[1].length === 1 && prevState === null){ //firstItemCase is an hourInterval
            const currentState = item[1][0].state 
            if(prevState === null){
                prevState = nearestPrevData 
            }
            const difference = currentState - prevState
            prevState = currentState
            return [getHoursFromNumber(item[0]), difference]
        } else if (item[1].length > 1){ //when hourArray has 5 minute intervals
            let accumulator = 0
            let firstItemIndex = 0
            if(prevState === null){
                prevState = nearestPrevData
            }
            // let prevState;

            while(item[1][firstItemIndex].state === 'unavailable'){
                console.log(firstItemIndex)
                firstItemIndex++
            }

            prevState = item[1][firstItemIndex].state

            item[1].every((hourItem, hourIndex, hourArr) => {
                const noVal = hourItem.state === 0 || hourItem.state === 'unavailable'

                if(index === 0 || noVal){
                    return true
                } else if(!noVal && hourItem.state < prevState){
                    const diffPrevToCurrent = Math.abs(hourItem.state - prevState)
                    const diffZeroToCurrent = Math.abs(0 - hourItem.state)

                    if(diffZeroToCurrent < diffPrevToCurrent){
                        accumulator = accumulator + hourItem.state
                    } else {
                        accumulator = accumulator + (prevState - hourItem.state)
                    }
                    // if(Math.abs([itemState - prevState]))
                    // accumulator = accumulator + item.state
                    prevState = hourItem.state
                    return true
                } else {
                    const difference = hourItem.state - prevState
                    accumulator = accumulator + difference
                    prevState = hourItem.state
                    return true
                }
            }) 

            return [getHoursFromNumber(item[0]), accumulator] 

        } else { //when hourInterval
            const noVal = item[1][0].state === 0 || item[1][0].state === 'unavailable'
            let accumulator = 0
            const currentState = item[1][0].state
            
            if(!noVal && currentState < prevState){
                const diffPrevToCurrent = Math.abs(currentState - prevState)
                const diffZeroToCurrent = Math.abs(0 - currentState)

                if(diffZeroToCurrent < diffPrevToCurrent){
                    accumulator = accumulator + currentState
                } else {
                    accumulator = accumulator + (prevState - currentState)
                }
                // if(Math.abs([itemState - prevState]))
                // accumulator = accumulator + item.state
                prevState = currentState
                return [getHoursFromNumber(item[0]), accumulator]
            } else {
                const difference = currentState - prevState
                prevState = currentState
                return [getHoursFromNumber(item[0]), difference]
            }
        }
    })

    console.log(toFlatMapAllValues)
    console.log(computeKwh)
    
    const computeTotalKwh = getTotalKwH(toFlatMapAllValues, nearestPrevData)

    console.log(computeTotalKwh)

    if(!computeKwh.length){
        return 0
    }

    const sliced = computeKwh.slice(0, ((differenceInDays) * 24))

    return {arr: sliced, total: computeTotalKwh}
}

const groupByDays = async(timeframe: TimeFrame, data: any[], name: string) => {
    if(!groupByYearsObject(data, timeframe, name)){
        return 0
    }

    const {
        grouped: groupedByYears,
        nearestPrevData
    } = groupByYearsObject(data, timeframe, name)

    const timeFrameDates = {
        start: new Date(timeframe.start).getDate(),
        end: new Date(timeframe.end).getDate()
    }

    const timeFrameTime = {
        start: new Date(timeframe.start).getTime(),
        end: new Date(timeframe.end).getTime()
    }

    const removeEmpty = Object.entries(groupedByYears).flatMap(([yearKey, yearVal]) => {
        const removedEmptyDay = Object.entries(yearVal).map(([monthKey, monthVal]) => {
            // if(![].concat(...Object.values(monthVal)).length){
            //     return [monthKey, monthVal]
            // } 
            // else {
                const flatMonth = Object.entries(monthVal).map(([dayKey, dayVal]) => {
                    const toArray = Object.values(dayVal).flatMap((hourVal) => Object.values(hourVal))

                    // const monthDateFormat = `${getMonthName(parseInt(monthKey))} ${dayKey}`

                    return [new Date(parseInt(yearKey), parseInt(monthKey), parseInt(dayKey)), toArray]
                })

                return flatMonth
            // }  
        })

        // const removedEmptyMonth = removedEmptyDay.filter(item => item)
        
        return removedEmptyDay
    })

    // console.log(removeEmpty)

    const trimMonth = removeEmpty.map((month, index, arr) => {
        const arrLength = arr.length
        const monthCopy = month
        
        return month?.filter(dayItem => {return(dayItem[0].getTime() >= timeFrameTime.start && dayItem[0].getTime() < timeFrameTime.end)})
    })

    console.log(trimMonth)

    const toReformatDate = trimMonth.flatMap((monthItem, index, yearArr) => {
        const monthItemFormatted = monthItem?.map(([dayDate, dayVal], dayIndex, dayArr) => {
            const date = dayDate.getDate()
            const checkVal = dayVal.length ? dayVal : 0

            if(date === 1){
                return [`${getMonthName(dayDate.getMonth())} ${dayDate.getDate()}`, checkVal]
            } else {
                return [`${dayDate.getDate()}`, checkVal]
            }
        })

        return monthItemFormatted
    })

    console.log(toReformatDate)

    const toFlatMapAllValues = toReformatDate.flatMap(([dayKey, dayVal]) => dayVal)

    console.log(toFlatMapAllValues)

    let prevState = null
    const computeKwh = toReformatDate.map(([dayKey, dayVal], index, arr) => {
        if(!dayVal){
            return [dayKey, dayVal]
        }

        if(dayVal.length === 1 && prevState === null){
            const currentState = dayVal[0].state
            if(prevState === null){
                prevState = nearestPrevData 
            }
            const difference = currentState - prevState
            prevState = currentState
            return [dayKey, difference]
        } else if (dayVal.length > 1){
            let accumulator = 0
            let firstItemIndex = 0
            // if(prevState === null){
            //     prevState = nearestPrevData
            // }

            // while(dayVal[firstItemIndex].state === 'unavailable'){
            //     console.log(firstItemIndex)
            //     firstItemIndex++
            // }

            // prevState = dayVal[firstItemIndex].state

            dayVal.every((hourItem, hourIndex, hourArr) => {
                const noVal = hourItem.state === 0 || hourItem.state === 'unavailable'

                if(index === 0 || noVal){
                    return true
                } else if(!noVal && hourItem.state < prevState){
                    const diffPrevToCurrent = Math.abs(hourItem.state - prevState)
                    const diffZeroToCurrent = Math.abs(0 - hourItem.state)

                    if(diffZeroToCurrent < diffPrevToCurrent){
                        accumulator = accumulator + hourItem.state
                    } else {
                        accumulator = accumulator + (prevState - hourItem.state)
                    }
                    // if(Math.abs([itemState - prevState]))
                    // accumulator = accumulator + item.state
                    prevState = hourItem.state
                    return true
                } else {
                    const difference = hourItem.state - prevState
                    accumulator = accumulator + difference
                    prevState = hourItem.state
                    return true
                } 
            })

            // const {
            //     total: totalKwh,
            //     prevState: returnedPrev
            // } = getTotalKwH(dayVal, null)
            
            // prevState = returnedPrev

            return [dayKey, accumulator]
        } else {
            const noVal = dayVal[0].state === 0 || dayVal[0].state === 'unavailable'
            let accumulator = 0
            const currentState = dayVal[0].state
            
            if(!noVal && currentState < prevState){
                const diffPrevToCurrent = Math.abs(currentState - prevState)
                const diffZeroToCurrent = Math.abs(0 - currentState)

                if(diffZeroToCurrent < diffPrevToCurrent){
                    accumulator = accumulator + currentState
                } else {
                    accumulator = accumulator + (prevState - currentState)
                }
                // if(Math.abs([itemState - prevState]))
                // accumulator = accumulator + item.state
                prevState = currentState
                return [dayKey, accumulator]
            } else {
                const difference = currentState - prevState
                prevState = currentState
                return [dayKey, difference]
            }
        }
    })
  
    const computeTotalKwh = getTotalKwH(toFlatMapAllValues, nearestPrevData)

    // const computeTotalTest = computeKwh.reduce((partialSum, [dayKey, dayVal]) => partialSum + dayVal, 0)

    // console.log(computeTotalTest)

    console.log(computeTotalKwh)

    return {arr: computeKwh, total: computeTotalKwh}
}

const groupByMonths = async(timeframe: TimeFrame, data: any[], name: string, isSummary: boolean) => {
    if(!groupByYearsObject(data, timeframe, name)){
        return 0
    }

    const {
        grouped: groupedByYears,
        nearestPrevData
    } = await groupByYearsObject(data, timeframe, name)

    const flatMapped = Object.entries(groupedByYears).map(([yearKey, yearVal]) => {
        const flatMonth = Object.entries(yearVal).map(([monthKey, monthVal]) => {
            const flatDay = Object.entries(monthVal).flatMap(([dayKey, dayVal]) => {
                const flatHours = Object.values(dayVal).flatMap(hourArr => hourArr)

                return flatHours
            })
            return [monthKey, flatDay]
        })
        
        const toObject = Object.fromEntries(flatMonth)

        return [yearKey, toObject]
    })

    const flatMappedObject = Object.fromEntries(flatMapped)

    const toFlatMapAllValues = Object.values(flatMappedObject).flatMap(yearVal => {
        const flatMonth = Object.values(yearVal).flatMap(monthVal => monthVal)

        return flatMonth
    })

    const kwhConsumed = Object.entries(flatMappedObject).map(([yearKey, yearVal], yearIndex, yearArr) => {
        const newMonthsArr = []
        const yearLength = yearArr.length
        // console.log(Object.entries(yearArr[0][1])[2][1])

        const computed = Object.entries(yearVal).map(([monthKey, monthVal], monthIndex, monthArr) => {
            if(monthVal.length === 0){
                return [parseInt(monthKey), 0]
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

            return [parseInt(monthKey), doRoundNumber(accumulator, 2)]
        })

        return computed
    })

    console.log(kwhConsumed)

    const computeTotalKwh = getTotalKwH(toFlatMapAllValues, nearestPrevData)

    const removeNotIncludedMonths = kwhConsumed.map((monthArr, index, yearArr) => {
        console.log(timeframe.start.getMonth())
        console.log(timeframe.end)
        if(yearArr.length > 1){
            const startIndex = 0
            const endIndex = yearArr.length - 1

            if(index === startIndex){
                return monthArr.filter((monthItem, index, monthArr) => index >= timeframe.start.getMonth())
            } else if(index === endIndex){
                return monthArr.filter((monthItem, index, monthArr) => index <= timeframe.end.getMonth())
            } else {
                return monthArr
            }
        } else {
            return monthArr.filter((monthItem, index, monthArr) => {
                console.log(monthItem)
                return (index >= timeframe.start.getMonth() && index <= timeframe.end.getMonth())
            })
        }
    })

    console.log(removeNotIncludedMonths)

    const decomposeYear = [].concat(...removeNotIncludedMonths)

    const removedFormatted = decomposeYear.map(([month, val]) => ([getMonthName(month), val]))

    const monthsArray = Array.from({ length: 12 }, (_, index) => [index, 0]);
    
    decomposeYear.forEach(item => {
        if(item.length){
            monthsArray[item[0]][1] = item[1]
        }
    })

    const monthsArrayFormatted = monthsArray.map(([month, val]) => ([getMonthName(month), val]))

    return {
        arr: isSummary ? monthsArrayFormatted : removedFormatted,
        total: computeTotalKwh
    }
}

const useLocalDatabase = (props: UseAllHistoryParams) => {
    if(!props){
        return null
    }

    const [ data, setData ] = useState({})
    const parsed = {
        AC: JSON.parse(JSON.stringify(ACEnergy)).default,
        PC: JSON.parse(JSON.stringify(PCEnergy)).default,
        Monitor: JSON.parse(JSON.stringify(MonitorEnergy)).default,
        EFan: JSON.parse(JSON.stringify(EFanEnergy)).default
    }

    const isSummary = props.isSummary ? props.isSummary : false

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

                const parsedTimeframe: TimeFrame = {
                    start: parseTimestamp(timeFrame.start),
                    end: parseTimestamp(parseTimestamp(timeFrame.end).getTime() + (1000 * 60 * 60 * 24))
                }

                const differenceInDays = ((parsedTimeframe.end.getTime() - parsedTimeframe.start.getTime()) / (1000 * 60 * 60 * 24))

                // console.log(differenceInDays)
                // console.log(parsedTimeframe)

                const hourDayTimeFrame: TimeFrame = {
                    start: parseTimestamp(timeFrame.start),
                    end: differenceInDays ? parseTimestamp(parseTimestamp(timeFrame.end).getTime() + (1000 * 60 * 60 * 24)) : parseTimestamp(timeFrame.start)
                }

                if(differenceInDays <= 3){
                    console.log('pasok hours')
                    allSensors[key] = await groupByHours(hourDayTimeFrame, item, key, differenceInDays)
                } else if (differenceInDays <= 36){
                    console.log('pasok days')
                    allSensors[key] = await groupByDays(hourDayTimeFrame, item, key)
                } else {
                    const monthTimeframe: TimeFrame = {
                        start: new Date(parsedTimeframe.start.getFullYear(), parsedTimeframe.start.getMonth(), 1, 0, 0, 0),
                        end: new Date(parsedTimeframe.end.getFullYear(), parsedTimeframe.end.getMonth() + 1, 0, 23, 59, 59)
                    }
                    allSensors[key] = await groupByMonths(monthTimeframe, item, key, isSummary)
                }
            });

            setData(allSensors)
        }

        groupByTimeframe()

        console.log(data)
    }, [ props?.userId, props?.startTime, props?.endTime ])

    return data
}

export default useLocalDatabase