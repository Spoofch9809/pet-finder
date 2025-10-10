/* eslint-disable no-console */
"use client";

import { CometChat } from "@cometchat/chat-sdk-javascript";

const appId = process.env.NEXT_PUBLIC_COMETCHAT_APP_ID;
const region = process.env.NEXT_PUBLIC_COMETCHAT_REGION;
const authKey = process.env.NEXT_PUBLIC_COMETCHAT_AUTH_KEY;

let initPromise: Promise<boolean> | null = null;

function assertEnv(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(`Missing CometChat env var: ${key}`);
  }
  return value;
}

export async function initCometChat() {
  if (!initPromise) {
    const safeAppId = assertEnv(appId, "NEXT_PUBLIC_COMETCHAT_APP_ID");
    const safeRegion = assertEnv(region, "NEXT_PUBLIC_COMETCHAT_REGION");
    const appSettings = new CometChat.AppSettingsBuilder()
      .subscribePresenceForAllUsers()
      .setRegion(safeRegion)
      .build();
    initPromise = CometChat.init(safeAppId, appSettings);
  }
  return initPromise;
}

export async function ensureCometChatUser(opts: {
  uid: string;
  name?: string;
  avatar?: string;
}) {
  const { uid, name, avatar } = opts;
  if (!uid || !uid.trim()) {
    throw new Error("Failed to ensure CometChat user: UID is required.");
  }
  if (process.env.NODE_ENV !== "production") {
    console.debug("[cometchat] ensure user", { uid, name });
  }
  const response = await fetch("/api/cometchat/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uid, name, avatar }),
  });

  if (!response.ok) {
    const message = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    const friendlyMessage =
      `Failed to ensure CometChat user: ${message?.message ?? "unknown error"}`
        .trim();
    console.error("[cometchat] ensure user failed", friendlyMessage);
    throw new Error(friendlyMessage);
  }
}

export async function loginCometChatUser(opts: {
  uid: string;
  name?: string;
  avatar?: string;
}) {
  if (!opts.uid || !opts.uid.trim()) {
    throw new Error("CometChat login requires a non-empty UID.");
  }
  const safeAuthKey = assertEnv(authKey, "NEXT_PUBLIC_COMETCHAT_AUTH_KEY");

  await initCometChat();

  const loggedIn = await CometChat.getLoggedinUser().catch(() => null);
  if (loggedIn && loggedIn.getUid?.() === opts.uid) {
    return loggedIn;
  }

  if (loggedIn) {
    await CometChat.logout();
  }

  await ensureCometChatUser(opts);

  return CometChat.login(opts.uid, safeAuthKey);
}

export async function logoutCometChatUser() {
  try {
    await CometChat.logout();
  } catch (error) {
    console.warn("CometChat logout failed", error);
  }
}

export { CometChat };
