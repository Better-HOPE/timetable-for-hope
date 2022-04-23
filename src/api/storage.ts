import { browser } from "webextension-polyfill-ts";

export async function setStorage<T>(key: string, value: T): Promise<void> {
  if (["firefox", "chromium"].includes(TARGET)) {
    await browser.storage.local.set({ [key]: value });
    return;
  }
  localStorage.setItem(`tt4h_${key}`, JSON.stringify(value));
}

export async function getStorage<T>(key: string): Promise<T | null> {
  if (["firefox", "chromium"].includes(TARGET)) {
    return (await browser.storage.local.get(key))[key];
  }

  return JSON.parse(localStorage.getItem(`tt4h_${key}`) ?? "null");
}
