"use client";

// Chat plugin entrypoint with env-driven provider selection.
// Supported values: "cometchat" (default), "none"

const providerName = (process.env.NEXT_PUBLIC_CHAT_PROVIDER || "cometchat")
  .toString()
  .trim()
  .toLowerCase();

type ProviderMod = typeof import("./providers/cometchat");

let cachedImpl: ProviderMod | null = null;

async function getImpl(): Promise<ProviderMod> {
  if (cachedImpl) return cachedImpl;
  if (providerName === "none") {
    cachedImpl = await import("./providers/none");
  } else {
    cachedImpl = await import("./providers/cometchat");
  }
  return cachedImpl!;
}

export const CHAT_PROVIDER = (providerName === "none" ? "none" : "cometchat") as const;

export async function initCometChat() {
  const impl = await getImpl();
  return impl.initCometChat();
}

export async function ensureCometChatUser(opts: { uid: string; name?: string; avatar?: string }) {
  const impl = await getImpl();
  return impl.ensureCometChatUser(opts);
}

export async function loginCometChatUser(opts: { uid: string; name?: string; avatar?: string }) {
  const impl = await getImpl();
  return impl.loginCometChatUser(opts);
}

export async function logoutCometChatUser() {
  try {
    const impl = await getImpl();
    return await impl.logoutCometChatUser();
  } catch {
    // Ignore provider errors during logout
    return;
  }
}

export const CometChat: any = new Proxy(
  {},
  {
    get(_t, prop) {
      if (!cachedImpl) {
        throw new Error("Chat provider not loaded yet. Call loginCometChatUser/initCometChat first.");
      }
      const val = (cachedImpl as any).CometChat?.[prop as any];
      return val;
    },
  }
);
