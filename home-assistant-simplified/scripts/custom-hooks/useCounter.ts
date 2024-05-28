import { useState, useEffect } from 'react'

export default function useCounter(init){
    const [ secondsLeft, setSecondsLeft ] = useState(init)

    useEffect(() => {
        if(secondsLeft <= 0){
            setSecondsLeft(init)
        }

        const timeout = setTimeout(() => {
            setSecondsLeft(prevState => prevState - 1)
        }, 1000)

        return () => clearTimeout(timeout)

    }, [init, secondsLeft])

    const setTime = (seconds) => {
        setSecondsLeft(seconds)
    }

    return { secondsLeft, setSecondsLeft }
}