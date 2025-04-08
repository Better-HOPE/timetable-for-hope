import generateUserKey from "../utils/generateUserKey";
import { getStorage, setStorage } from "./storage";

const generatedUserKey = generateUserKey();

export default async function getUserKey(): Promise<string> {
  if ("TT4H_USER_KEY" in window) {
    await setStorage<string>("userKey", TT4H_USER_KEY);
    return TT4H_USER_KEY;
  }

  throw new Error("User Keyの取得に失敗しました");
}
