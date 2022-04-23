import { initializeApp } from "firebase/app";

import {
  getFirestore,
  getDoc,
  doc,
  collection,
  setDoc,
} from "firebase/firestore/lite";

import firebaseConfig from "../../firebase.config.json";
import { getStorage, setStorage } from "./storage";

type BackupHistory = { date: number; type: "upload" | "download" } | null;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function write<T>(
  kind: string,
  key: string,
  value: T
): Promise<void> {
  await setDoc(doc(collection(db, kind), key), {
    value: JSON.stringify(value),
  });
  await setLastUpdate(kind, key, "upload");
}

export async function read<T>(kind: string, key: string): Promise<T | null> {
  const value = (await getDoc(doc(collection(db, kind), key))).data()?.value;

  if (!value) {
    throw new Error(
      `指定されたユーザーキーに対応する${kind}はありませんでした`
    );
  }
  await setLastUpdate(kind, key, "download");
  return JSON.parse(value) ?? null;
}

async function setLastUpdate(
  kind: string,
  key: string,
  type: "upload" | "download"
) {
  await setStorage<BackupHistory>(`backUpHistory_${kind}_${key}`, {
    date: Date.now(),
    type,
  });
}

export async function getLastUpdate(
  kind: string,
  key: string
): Promise<BackupHistory> {
  const result = await getStorage<BackupHistory>(
    `backUpHistory_${kind}_${key}`
  );

  if (!result) {
    return null;
  }

  return {
    date: result.date,
    type: result.type,
  };
}
