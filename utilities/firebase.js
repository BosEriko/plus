import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import env from "./env";

const firebaseConfig = {
  apiKey: env.firebase.apiKey,
  authDomain: env.firebase.authDomain,
  projectId: env.firebase.projectId,
  storageBucket: env.firebase.storageBucket,
  messagingSenderId: env.firebase.messagingSenderId,
  appId: env.firebase.appId,
  measurementId: env.firebase.measurementId,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
