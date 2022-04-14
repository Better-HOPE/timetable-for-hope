import { browser } from "webextension-polyfill-ts";

export async function setStorage<T>(key: string, value: T): Promise<void> {
  await browser.storage.local.set({ [key]: value });
}

export async function getStorage<T>(key: string): Promise<T> {
  return (await browser.storage.local.get(key))[key];
}
