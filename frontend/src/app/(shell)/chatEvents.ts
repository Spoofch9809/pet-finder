export const CHAT_OPEN_EVENT = "pf-chat-open";

export type ChatOpenDetail = {
  uid: string;
  name?: string;
  avatar?: string;
};

export function requestChatOpen(detail: ChatOpenDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ChatOpenDetail>(CHAT_OPEN_EVENT, { detail })
  );
}
