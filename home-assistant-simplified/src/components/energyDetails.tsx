import { Column, Group, TimeCard, ButtonCard, SidebarCard, AreaCard } from '@hakit/components';
import { useState, useEffect } from 'react';
import { useHass, useEntity, useHistory } from "@hakit/core";
import { Switches } from './areasIndex'
import { AirCon, Efan, Monitor, SystemUnit, MenuDownIcon, CalendarRangeIcon } from '../../constants/icons'
import { MyApplianceCard } from './card/cardsIndex';
import EnergyUsageGraph from './dashboard/energyUsageGraph';
import useLocalDatabase, { UseAllHistoryParams } from '../../scripts/custom-hooks/useLocalDatabase';
import dayjs, { Dayjs } from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ThemeProvider, createTheme } from '@mui/material';
import { RangeCalendar } from './customComponents/customComponentsIndex';
import Header from './header';

export const calendarTheme = (theme: any) => createTheme({
    ...theme,
    components: {
        ...theme.components,
        MuiPickersToolbar: {
            styleOverrides: {
                root: {
                    color: 'var(--ha-900)',
                    backgroundColor: 'var(--ha-50)', 
                },
                content: {
                    fontFamily: "Poppins",
                    fontWeight: 700,
                    fontStyle: 'normal',
                }   
            }
        },
        MuiPickersCalendarHeader: {
            styleOverrides: {
                label: {
                    color: 'var(--ha-900)',
                    backgroundColor: 'var(--ha-50)',
                    
                },
                switchViewIcon: {
                    color: 'var(--ha-900)',
                    backgroundColor: 'var(--ha-50)',
                },
                labelContainer: {
                    color: 'var(--ha-900)',
                    backgroundColor: 'var(--ha-50)',
                }
            }
        },
        MuiDateCalendar: {
            styleOverrides: {
                root: {
                    color: 'var(--ha-900)',
                    borderRadius: '3px',
                    borderWidth: '1px',
                    borderColor: 'transparent',
                    border: 'px solid',
                    backgroundColor: 'var(--ha-50)',
                }
            }
        },
        MuiDayCalendar: {
            styleOverrides: {
                root: {
                    color: 'var(--ha-500)',
                    backgroundColor: 'var(--ha-50)',
                },
                weekDayLabel: {
                    color: 'var(--ha-500)',
                    fontWeight: 700,
                    backgroundColor: 'var(--ha-50)',
                },
                weekNumberLabel: {
                    color: 'var(--ha-500)',
                    backgroundColor: 'var(--ha-50)',
                }
            }
        },
        MuiPickersDay: {
            styleOverrides: {
                root: {
                    color: 'var(--ha-500)',
                    backgroundColor: 'var(--ha-50)',
                }
            }
        }
    }
})

const DatePickerStyle = {
    layout: {
      sx: {
        color: 'var(--ha-500)',
        borderRadius: '3px',
        borderWidth: '1px',
        borderColor: 'transparent',
        border: 'px solid',
        backgroundColor: 'var(--ha-50)',
      }
    },
    textField: {
        sx: {
          color: '#bbdefb',
          borderRadius: '3px',
          borderWidth: '2px',
          borderColor: '#2196f3',
          border: '1px solid',
          backgroundColor: 'transparent',
          '&.Mui-focused:after': {
            border: '1px solid'
          }
        }
    }
}

const EnergyDetails = (props: any) => {
    const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
    const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
    const [ visibleRange, setVisibleRange ] = useState<boolean>(false)
    // const [clicked, setClicked] = useState<boolean>(false)
    // const [data, setData] = useState<any>({})

    // const timeFrameStart: any = startDate?.format()
    // const timeFrameEnd: string = startDate?.format()

    const toUTC: UseAllHistoryParams = {
        userId: 'test',
        startTime: new Date(startDate?.year(), startDate?.month(), startDate?.date()).toISOString(),
        endTime: new Date(endDate?.year(), endDate?.month(), endDate?.date()).toISOString(),
    }

    console.log(toUTC)

    const displayTimeRange = (startDate: Dayjs, endDate: Dayjs) => {
        const isSameMonth = startDate.month() === endDate.month() 
        const isSameYear = startDate.year() === endDate.year()
        const isSameDay = startDate.format('MMMM D') === endDate.format('MMMM D')
        const sameMonthFormat = `${startDate.format('MMMM D')} - ${endDate.format('D')}`
        const diffYearFormat = `${startDate.format('MMMM D, YYYY')} - ${endDate.format('MMMM D, YYYY')}`
        const defaultFormat = `${startDate.format('MMMM D')} - ${endDate.format('MMMM D')}`
        const sameDayFormat = `${startDate.format('MMMM D')}`
        
        if(!isSameYear){
            return diffYearFormat
        } else if (isSameDay){
            return sameDayFormat
        } else if (isSameMonth){
            return sameMonthFormat
        } else {
            return defaultFormat
        }
    }

    const localDB = useLocalDatabase(toUTC)

    // // useEffect(() => {
    // //     setData(localDB)
    // // }, [localDB])

    return(
        <div
            className='screen-general-container screen-general-centered'
        >
            <RangeCalendar
                value={{
                    start: startDate,
                    end: endDate
                }}
                set={{
                    start: setStartDate,
                    end: setEndDate,
                }}
                modalState={{
                    isVisible: visibleRange,
                    setVisible: setVisibleRange
                }}
                calendar={'start'}
            />
            <Header type={'energy'} />
            <div className='energy-details-content'>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    {/* <div
                        className='date-picker-container'
                    >
                        <ThemeProvider theme={calendarTheme}>
                            <DatePicker
                                label="Start Date"
                                value={startDate}
                                onChange={(newDate) => setStartDate(newDate)}         
                                maxDate={endDate}
                                slotProps={DatePickerStyle}
                            />
                            <DatePicker
                                label="End Date"
                                value={endDate}
                                onChange={(newDate) => setEndDate(newDate)}
                                minDate={startDate}
                                slotProps={DatePickerStyle}
                            />
                        </ThemeProvider>
                    </div> */}
                </LocalizationProvider>
                <div
                    className='time-range-display-container'
                >
                    <div
                        className='time-range-container'
                        
                    >
                        <p
                            className='time-range-text poppins-bold'
                        >{displayTimeRange(startDate, endDate)}</p>
                    </div>
                    <div
                        className='calendar-pressable'
                        onClick={() => {
                            setVisibleRange(true)
                        }}
                        // onTouchStart={() => {
                        //     setClicked(true)
                        // }}
                        // onTouchEnd={() => {
                        //     setClicked(false)
                        // }}
                    >
                        <CalendarRangeIcon size={64} color={'var(--ha-900)'} />
                    </div>
                </div>
                <EnergyUsageGraph historyParams={toUTC} />
            </div>
        </div>
    )
}

export default EnergyDetails

