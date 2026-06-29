import {
  copyAsync,
  deleteAsync,
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
} from 'expo-file-system/legacy';
import { createId } from './id';

const PHOTOS_DIR = `${documentDirectory}player-photos/`;
const ROSTERS_DIR = `${documentDirectory}saved-rosters/`;

export async function ensurePhotosDir(): Promise<void> {
  const info = await getInfoAsync(PHOTOS_DIR);
  if (!info.exists) {
    await makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
  }
}

async function ensureRostersDir(): Promise<void> {
  const info = await getInfoAsync(ROSTERS_DIR);
  if (!info.exists) {
    await makeDirectoryAsync(ROSTERS_DIR, { intermediates: true });
  }
}

export async function persistPhotoUri(sourceUri: string): Promise<string> {
  await ensurePhotosDir();
  const ext = sourceUri.split('.').pop()?.split('?')[0] ?? 'jpg';
  const dest = `${PHOTOS_DIR}${createId()}.${ext}`;
  await copyAsync({ from: sourceUri, to: dest });
  return dest;
}

export async function persistRosterPlayerPhoto(
  rosterId: string,
  playerId: string,
  sourceUri: string
): Promise<string> {
  await ensureRostersDir();
  const rosterDir = `${ROSTERS_DIR}${rosterId}/`;
  const dirInfo = await getInfoAsync(rosterDir);
  if (!dirInfo.exists) {
    await makeDirectoryAsync(rosterDir, { intermediates: true });
  }

  const ext = sourceUri.split('.').pop()?.split('?')[0] ?? 'jpg';
  const dest = `${rosterDir}${playerId}.${ext}`;
  await copyAsync({ from: sourceUri, to: dest });
  return dest;
}

export async function deleteRosterPhotos(rosterId: string): Promise<void> {
  const rosterDir = `${ROSTERS_DIR}${rosterId}/`;
  const info = await getInfoAsync(rosterDir);
  if (info.exists) {
    await deleteAsync(rosterDir, { idempotent: true });
  }
}
