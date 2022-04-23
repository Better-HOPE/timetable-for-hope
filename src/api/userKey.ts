import generateUserKey from "../utils/generateUserKey";
import { getStorage, setStorage } from "./storage";

const generatedUserKey = generateUserKey();

export default async function getUserKey(): Promise<string> {
  const configuredStorageKey = await getStorage<string>("userKey");

  if (configuredStorageKey && configuredStorageKey !== "") {
    return configuredStorageKey;
  }

  if ("TT4H_USER_KEY" in window) {
    await setStorage<string>("userKey", TT4H_USER_KEY);
    return TT4H_USER_KEY;
  }

  const defaultUserKey = await getStorage<string>("defaultUserKey");

  if (defaultUserKey) {
    return defaultUserKey;
  }

  await setStorage<string>("defaultUserKey", generatedUserKey);
  return generatedUserKey;
}
