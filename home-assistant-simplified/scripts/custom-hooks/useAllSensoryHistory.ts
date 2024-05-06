import React, { useEffect, useState } from 'react'
import { firestore } from '../firebase'
import { addDoc, collection, getDoc, getDocs, doc, setDoc, where, query } from "@firebase/firestore"

interface UseAllHistoryParams {
    userId: string,
    startTime: string,
    endTime: string,
}

const useAllSensorHistory = (props: UseAllHistoryParams) => {
    const [ data, setData ] = useState<any>([])

    useEffect(() => {
        console.log(`pasok\n`)
        if(props.userId){
            const deviceColRef = collection(firestore, 'users', props.userId, 'devices')
            const getDevice = async() => {
                const querySnap = await getDocs(deviceColRef)
                const arr: any[] = []
    
                querySnap.forEach((doc) => {
                    console.log(doc?.id, " => ", doc?.data());
                    if(doc.id){
                        const historyColRef = collection(firestore, 'users', props.userId, 'devices', doc.id, 'energy')
                        const historyQuery = query(historyColRef, where("last_changed", ">=", props.startTime), where("last_changed", "<=", props.endTime));
                        const getHistory = async() => {
                            const querySnap = await getDocs(historyQuery)
                            
                            querySnap.forEach((doc) => {
                                arr.push(doc.data())
                            })  
                        }
                        getHistory()
                    }
                })

                setData(arr)
                console.log(data)
            }
            getDevice()
        }
    }, [ props.userId ])

    return data
}

export default useAllSensorHistory
export type {
    UseAllHistoryParams
}