import { SITE_URL } from './config';

export const IOS_APP_STORE_URL =
  process.env.NEXT_PUBLIC_IOS_APP_STORE_URL ||
  'https://apps.apple.com/search?term=Samba+Events';

export const ANDROID_PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_ANDROID_PLAY_STORE_URL ||
  'https://play.google.com/store/apps/details?id=com.sambaevents';

export function ticketShareSchemeUrl(token) {
  return `samba://tickets/share/${encodeURIComponent(token)}`;
}

export function ticketShareUniversalUrl(token) {
  return `${SITE_URL}/tickets/share/${encodeURIComponent(token)}`;
}

export function scannerInviteSchemeUrl(token) {
  return `samba://scanners/join/${encodeURIComponent(token)}`;
}

export function scannerInviteUniversalUrl(token) {
  return `${SITE_URL}/scanners/join/${encodeURIComponent(token)}`;
}
