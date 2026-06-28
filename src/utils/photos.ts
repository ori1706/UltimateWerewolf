import {
  copyAsync,
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
} from 'expo-file-system/legacy';
import { createId } from './id';

const PHOTOS_DIR = `${documentDirectory}player-photos/`;

export async function ensurePhotosDir(): Promise<void> {
  const info = await getInfoAsync(PHOTOS_DIR);
  if (!info.exists) {
    await makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
  }
}

export async function persistPhotoUri(sourceUri: string): Promise<string> {
  await ensurePhotosDir();
  const ext = sourceUri.split('.').pop()?.split('?')[0] ?? 'jpg';
  const dest = `${PHOTOS_DIR}${createId()}.${ext}`;
  await copyAsync({ from: sourceUri, to: dest });
  return dest;
}
