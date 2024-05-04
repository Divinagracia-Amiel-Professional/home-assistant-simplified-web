import { initializeApp } from "firebase-admin/app";
import admin from 'firebase-admin'
import * as serviceAccount from '/Users/Amiel Divinagracia/Desktop/App Development/serviceAccount.json' assert { type: 'json' }
import { 
    ACEnergy,
    PCEnergy,
    MonitorEnergy,
    EFanEnergy
} from "../../assets/sensorData/sensorDataIndex.js";

// const serviceAccount = require('./home-assistant-simplifie-d154a-firebase-adminsdk-zry87-f02e69dcae.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount.default)
});

const data = JSON.parse(JSON.stringify(PCEnergy));
// const data = ACEnergy

const promises = [];
const dataArray = data.default;

dataArray.forEach(d => {
     promises.push(admin.firestore().collection('users').doc('FzZnmzdJNkBZSOcJLkgp').collection('devices').doc('Og05fJCdZcVcbmVs7M1V').collection('energy').add(d));
})
Promise.all(promises);


//THIS CODE IS TO MANUALLY INPUT CSV 

