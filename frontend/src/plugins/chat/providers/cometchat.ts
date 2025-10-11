/* eslint-disable no-console */
"use client";

// CometChat provider with SSR-safe lazy loading.
// Avoids top-level importing of the SDK (which touches window).

// Use a loose type to avoid SDK ESM/CJS interop issues during type-checking
type CometChatType = any;

const appId = process.env.NEXT_PUBLIC_COMETCHAT_APP_ID;
const region = process.env.NEXT_PUBLIC_COMETCHAT_REGION;
const authKey = process.env.NEXT_PUBLIC_COMETCHAT_AUTH_KEY;

let sdk: CometChatType | null = null;
let sdkPromise: Promise<CometChatType> | null = null;
let initPromise: Promise<boolean> | null = null;

function assertEnv(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(`Missing CometChat env var: ${key}`);
  }
  return value;
}

async function loadSDK(): Promise<CometChatType> {
  if (sdk) return sdk;
  if (!sdkPromise) {
    if (typeof window === "undefined") {
      throw new Error("CometChat SDK can only be loaded in the browser");
    }
    sdkPromise = import("@cometchat/chat-sdk-javascript").then((m: any) => m.CometChat as CometChatType);
  }
  sdk = await sdkPromise;
  return sdk;
}

export async function initCometChat() {
  if (!initPromise) {
    const CometChat = await loadSDK();
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
  const CometChat = await loadSDK();

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
    // If chat was never initialized in this session, skip logout to avoid SDK errors.
    if (!initPromise) {
      return;
    }

    const CometChat = await loadSDK();

    // Guard: if there is no logged-in user, nothing to do.
    const loggedIn = await CometChat.getLoggedinUser().catch(() => null);
    if (!loggedIn) {
      return;
    }

    await CometChat.logout();
  } catch (error) {
    // Swallow errors on logout; widget cleanup should not crash the UI.
    console.warn("CometChat logout failed", error);
  }
}

// Export a lazy proxy that surfaces the SDK after initCometChat has run.
// This lets callers keep using `CometChat.*` without top-level importing the SDK.
export const CometChat: any = new Proxy(
  {},
  {
    get(_target, prop) {
      if (!sdk) {
        throw new Error(
          "CometChat SDK not loaded yet. Call loginCometChatUser() or initCometChat() first."
        );
      }
      const value = (sdk as any)[prop as any];
      return value;
    },
  }
);
