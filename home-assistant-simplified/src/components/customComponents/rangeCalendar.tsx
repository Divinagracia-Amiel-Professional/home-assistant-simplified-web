import React, { useState, useEffect } from 'react';
import { Modal, Dialog } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { calendarTheme } from '../energyDetails';
import { ThemeProvider } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const RangeCalendar = (props: any) => {
  const [currentCalendar, setCurrentCalendar] = useState<string>('start');

  const values = {
    start: props.value.start ? props.value.start : dayjs(),
    end: props.value.end ? props.value.end : dayjs(),
  };

  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  console.log(currentCalendar);

  const handleClose = () => {
    setCurrentCalendar('start');
    const isSameValues = startDate === values.start && endDate === values.end;
    if (!isSameValues) {
      props.set.start(startDate ? startDate : values.start);
      props.set.end(endDate ? endDate : values.end);
    }
    props.modalState.setVisible(false);
  };

  const displayTime = () => {
    const start = startDate ? startDate : values.start;
    const end = endDate ? endDate : values.end;
    const toDisplayDate = currentCalendar === 'start' ? start : end;

    return toDisplayDate?.format('MMMM D, YYYY');
  };

  return (
    <Modal
      open={props.modalState.isVisible}
      onClose={() => {
        handleClose();
      }}
      sx={{ overflowY: 'scroll' }}
      keepMounted={false}
    >
      <div className='date-range-container'>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <ThemeProvider theme={calendarTheme}>
            <div className='date-range-header'>
              <p className='date-range-header-label poppins-regular'>{`SELECT ${currentCalendar.toUpperCase()} DATE`}</p>
              <p className='date-range-header-text poppins-bold'>{displayTime()}</p>
            </div>
            <div
              style={{
                display: currentCalendar === 'start' ? 'flex' : 'none',
              }}
            >
              <DateCalendar
                value={startDate ? startDate : values.start}
                onChange={newDate => {
                  setStartDate(newDate);
                }}
                maxDate={endDate ? endDate : values.end}
              />
            </div>
            <div
              style={{
                display: currentCalendar === 'end' ? 'flex' : 'none',
              }}
            >
              <DateCalendar
                value={endDate ? endDate : values.end}
                onChange={newDate => {
                  setEndDate(newDate);
                }}
                minDate={startDate ? startDate : values.start}
              />
            </div>
            <Buttons type={currentCalendar} setType={setCurrentCalendar} handleClose={handleClose} />
          </ThemeProvider>
        </LocalizationProvider>
      </div>
    </Modal>
  );
};

export default RangeCalendar;

const Buttons = (props: any) => {
  const onNextHandler = () => {
    if (props.type === 'end') {
      props.handleClose();
    } else {
      props.setType('end');
    }
  };

  const onGoBackHandler = () => {
    props.setType('start');
  };

  return (
    <div className='date-range-buttons-container'>
      <div
        className='date-range-button'
        style={{
          display: props.type === 'start' ? 'none' : 'flex',
        }}
        onClick={() => {
          onGoBackHandler();
        }}
      >
        <p className='date-range-button-text poppins-regular'>Go Back</p>
      </div>
      <div
        className='date-range-button'
        onClick={() => {
          onNextHandler();
        }}
      >
        <p className='date-range-button-text poppins-bold'>{props.type === 'start' ? 'Next' : 'OK'}</p>
      </div>
    </div>
  );
};

/* props: 
    modalState: {
        isVisible: 
        setVisible:
    },
    value: {
        start: ,
        end: ,
    }, 
    set: {
       start: ,
       end:  
    }
*/
