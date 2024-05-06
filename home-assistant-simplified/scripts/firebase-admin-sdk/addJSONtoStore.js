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
     promises.push(admin.firestore().collection('users').doc('8a5552df72bb418283c3a61853a5bf93').collection('devices').doc('eprP3QlOyrzE9RPnqjv2').collection('energy').add(d));
})
Promise.all(promises);


// THIS CODE IS TO MANUALLY INPUT JSON to Firestore using firebase-sdk
// 5V7YQt8SnQ7wvPqUoIZZ AC
// DKbNzr3LlBaD6j8VX0QA Efan
// KSqbShozwXG0e4QShTU2 Monitor
// eprP3QlOyrzE9RPnqjv2 PC
// node addJSONtoStore

