import { initializeApp } from "firebase/app";

import { getDatabase, ref, set, get, child } from "firebase/database";

const firebaseConfig = {
  apiKey: "apiKey",
  authDomain: "authDomain",
  projectId: "projectId",
  storageBucket: "storageBucket",
  messagingSenderId: "messagingSenderId",
  appId: "appId",
};

export const _ = initializeApp(firebaseConfig);
const db = getDatabase();
const dbRef = ref(db);

export const saveToken = async (userId: string, token: string) => {
  const values = (await get(child(dbRef, `userTokens/${userId}/`))).val() ?? {};
  const payload = { ...values, token };
  set(ref(db, `userTokens/${userId}/`), payload);
};

export const getToken = async (userId: string) => {
  const values = (await get(child(dbRef, `userTokens/${userId}`))).val();
  return values ?? {};
};

export const saveSample = async (moistureLevel: number, userId: string) => {
  set(ref(db, `users/${userId}/${Date.now().toString()}`), {
    moisture: moistureLevel,
  });
};

export const getSamples = async (userId: string) => {
  const values = (await get(child(dbRef, `users/${userId}/`))).val();
  console.log("values", values);
  const moistureReadings = Object.values(values) as { moisture: number }[];
  const readings = moistureReadings.map((reading) => reading.moisture);

  return {
    currentMoistureLevel: readings[readings.length - 1],
    previousMoistureLevels: readings,
  };
};
