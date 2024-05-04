import React, { useEffect, useState } from 'react'
import { firestore } from '../firebase'
import { addDoc, collection, getDoc, doc, setDoc } from "@firebase/firestore"


const addUserToFirebase = (currentUser: any) => {
    const id = currentUser.id
    const name = currentUser.name

    useEffect(() => {
        console.log(`pasok\n`)
        if(id){
            const ref = doc(firestore, 'users', id)
            const getUser = async() => {
                const snap = await getDoc(ref)
    
                if(!snap.exists()){
                    console.log('user does not exist')
                    const data = {
                        id: id,
                        name: name
                    }
                   
                    await setDoc(ref, data)
                }
            }
            getUser()
        }
    }, [ currentUser.id ])
}

export default addUserToFirebase

// adding data and subcol, just make the refpath to the subcol

// const data = {
//     entity: 'energy',
//     state: 1.10,
//     last_changed: 'feb6'
// }

// const refCol = collection(firestore, 'users', id, 'history')

// const test = await addDoc(refCol, data)
// console.log(test.id)