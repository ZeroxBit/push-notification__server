import express from "express";

import BodyParser from "body-parser";

import * as FirebaseService from "./FirebaseService";
import Expo from "expo-server-sdk";
import { CronJob } from "cron";

const app = express();
const port = 8000;

const expo = new Expo();

const jsonParser = BodyParser.json();
const httpParser = BodyParser.urlencoded({ extended: false });

// Ejecuta el push notifications
new CronJob(
  "*/60 * * * * *",
  async function () {
    const userId = "00000001";
    const { token } = await FirebaseService.getToken("00000001");
    const samples = await FirebaseService.getSamples(userId);
    const mostRecentSample = samples.previousMoistureLevels.pop()!;
    if (mostRecentSample > 570) {
      expo.sendPushNotificationsAsync([
        {
          to: token,
          title: "Titulo de mi push notification",
          body: "Body de mi push notification",
        },
      ]);
    }
  },
  null,
  true,
  "America/New_York"
);

app.post("/registerPushToken", jsonParser, async (req, res) => {
  console.log("registerPushToken");
  const userId = String(req.body.userId);
  const token = String(req.body.token);
  await FirebaseService.saveToken(userId, token);
  res.status(200).send("success");
});

app.post(`/sample`, jsonParser, async (req, res) => {
  const moistureLevel = Number(req.body.moisture);
  const userId = String(req.body.userId);
  FirebaseService.saveSample(moistureLevel, userId);
  res.status(200).send("success");
});

app.get("/analytics", httpParser, async (req, res) => {
  const userId = String(req.query.userId);
  const samples = await FirebaseService.getSamples(userId);
  res.status(200).send(samples);
});

app.listen(port, () => console.log(`Running on Port ${port}`));
