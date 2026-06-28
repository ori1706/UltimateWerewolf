import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

const memory = new Map<string, string>();

function webStorage(): Storage | null {
  if (typeof globalThis.localStorage === 'undefined') return null;
  return globalThis.localStorage;
}

async function getItem(name: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return webStorage()?.getItem(name) ?? memory.get(name) ?? null;
    }
    return await AsyncStorage.getItem(name);
  } catch {
    return memory.get(name) ?? null;
  }
}

async function setItem(name: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      webStorage()?.setItem(name, value);
    } else {
      await AsyncStorage.setItem(name, value);
    }
  } catch {
    memory.set(name, value);
  }
}

async function removeItem(name: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      webStorage()?.removeItem(name);
    } else {
      await AsyncStorage.removeItem(name);
    }
  } catch {
    memory.delete(name);
  }
}

/** Zustand-compatible storage; falls back to memory if native module unavailable. */
export const appStorage: StateStorage = {
  getItem: (name) => getItem(name),
  setItem: (name, value) => setItem(name, value),
  removeItem: (name) => removeItem(name),
};
