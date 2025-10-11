/* eslint-disable no-console */
"use client";

// No-op chat provider. Keeps UI stable when chat is disabled.

function notAvailable(message?: string): never {
  throw new Error(message ?? "Chat provider is disabled");
}

export async function initCometChat(): Promise<boolean> {
  // Pretend initialized to let callers proceed and then gracefully show empty UI.
  return true;
}

export async function ensureCometChatUser(_opts: {
  uid: string;
  name?: string;
  avatar?: string;
}) {
  // No-op
  return;
}

export async function loginCometChatUser(_opts: {
  uid: string;
  name?: string;
  avatar?: string;
}) {
  return notAvailable("Chat provider is disabled");
}

export async function logoutCometChatUser() {
  // No-op
  return;
}

// Minimal stub to satisfy runtime references in the widget.
export const CometChat: any = {
  AppSettingsBuilder: class {
    subscribePresenceForAllUsers() { return this; }
    setRegion() { return this; }
    build() { return {}; }
  },
  ConversationsRequestBuilder: class {
    setLimit() { return this; }
    setConversationType() { return this; }
    build() { return { fetchNext: async () => [] }; }
  },
  MessagesRequestBuilder: class {
    setLimit() { return this; }
    setUID() { return this; }
    setGUID() { return this; }
    setCategories() { return this; }
    setTypes() { return this; }
    build() { return { fetchPrevious: async () => [], fetchNext: async () => [] }; }
  },
  TextMessage: class {
    constructor() {}
    getId() { return undefined; }
    getSentAt() { return undefined; }
    getType() { return "text"; }
    getText() { return ""; }
    getSender() { return { getUid: () => "" }; }
  },
  MessageListener: class { constructor() {} },
  RECEIVER_TYPE: { GROUP: "group", USER: "user" },
  addMessageListener: () => {},
  removeMessageListener: () => {},
  sendMessage: async () => notAvailable("Chat provider is disabled"),
  getLoggedinUser: async () => null,
  init: async () => true,
  login: async () => notAvailable("Chat provider is disabled"),
  logout: async () => {},
};

