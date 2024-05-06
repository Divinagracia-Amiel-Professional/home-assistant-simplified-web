import React, { useEffect, useState } from 'react'
import { firestore } from '../firebase'
import { addDoc, collection, getDoc, getDocs, doc, setDoc, where, query } from "@firebase/firestore"

interface UseHistoryParams {
    userId: string,
    device: string,
    startTime: string,
    endTime: string,
}

const useSensorHistory = (props: UseHistoryParams) => {
    const [ data, setData ] = useState<any>([])

    useEffect(() => {
        console.log(`pasok\n`)
        if(props.userId && props.device){
            const deviceColRef = collection(firestore, 'users', props.userId, 'devices')
            const deviceQuery = query(deviceColRef, where("name", "==", props.device));
            console.log(deviceQuery)
            const getDevice = async() => {
                const querySnap = await getDocs(deviceQuery)
    
                querySnap.forEach((doc) => {
                    console.log(doc?.id, " => ", doc?.data());
                    if(doc.id){
                        const historyColRef = collection(firestore, 'users', props.userId, 'devices', doc.id, 'energy')
                        const historyQuery = query(historyColRef, where("last_changed", ">=", props.startTime), where("last_changed", "<=", props.endTime));
                        const getHistory = async() => {
                            const querySnap = await getDocs(historyQuery)
                            const arr: any[] = []

                            querySnap.forEach((doc) => {
                                arr.push(doc.data())
                            })

                            setData(arr)
                            console.log(data)
                        }
                        getHistory()
                    }
                })
            }
            getDevice()
        }
    }, [ props.device, props.userId ])
}

export default useSensorHistory
export type {
    UseHistoryParams
}