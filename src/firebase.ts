import * as admin from "firebase-admin";

const serviceAccount = require("../firebase-admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://oferta-3caf7.appspot.com",
});

export const storage = admin.storage();
