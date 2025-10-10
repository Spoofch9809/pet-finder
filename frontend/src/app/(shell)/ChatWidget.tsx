"use client";

import * as React from "react";
import styles from "./ChatWidget.module.css";
import { useStore } from "./Store";
import { usersAPI, type User as BackendUser } from "../services/api";
import {
  CometChat,
  loginCometChatUser,
  logoutCometChatUser,
  ensureCometChatUser,
} from "../../lib/cometchat";
import {
  CHAT_OPEN_EVENT,
  type ChatOpenDetail,
} from "./chatEvents";

type ChatStatus = "idle" | "loading" | "ready" | "error";

type Peer = {
  uid: string;
  name: string;
  type: "user" | "group";
  avatar?: string;
};

const MESSAGE_BATCH_SIZE = 40;

function sanitizeIdPart(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    if (Number.isFinite(value)) return String(value);
    return null;
  }
  const str = String(value).trim();
  if (!str) return null;
  const sanitized = str.replace(/[^a-zA-Z0-9_.-]/g, "");
  return sanitized || null;
}

function getUidForUser(user: BackendUser | null | undefined): string | null {
  if (!user) return null;

  const fromId =
    sanitizeIdPart(user.user_id) ??
    sanitizeIdPart((user as any)?.id); // fallback for different shape
  if (fromId) return `pf_user_${fromId}`;

  const fromUsername = sanitizeIdPart(user.username);
  if (fromUsername) return `pf_user_${fromUsername}`;

  if (user.email) {
    const sanitizedEmail = user.email.replace(/[^a-zA-Z0-9]/g, "");
    if (sanitizedEmail) return `pf_user_${sanitizedEmail}`;
  }

  const fromName = sanitizeIdPart(
    `${user.firstname ?? ""}${user.lastname ?? ""}`.trim()
  );
  if (fromName) return `pf_user_${fromName}`;

  return null;
}

function getDisplayName(user: BackendUser | null | undefined): string {
  if (!user) return "Pet Finder user";
  const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim();
  return fullName || user.username || user.email || "Pet Finder user";
}

function formatTime(epochSeconds?: number | null) {
  if (!epochSeconds) return "";
  const date = new Date(epochSeconds * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatWidget() {
  const { authUser, isAuthenticated } = useStore();
  const [isOpen, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState<ChatStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [conversations, setConversations] = React.useState<
    CometChat.Conversation[]
  >([]);
  const [contacts, setContacts] = React.useState<BackendUser[]>([]);
  const [contactsLoaded, setContactsLoaded] = React.useState(false);
  const [loadingConversations, setLoadingConversations] = React.useState(false);
  const [loadingContacts, setLoadingContacts] = React.useState(false);
  const [activePeer, setActivePeer] = React.useState<Peer | null>(null);
  const [messages, setMessages] = React.useState<CometChat.BaseMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = React.useState(false);
  const [messageDraft, setMessageDraft] = React.useState("");
  const [hasMoreMessages, setHasMoreMessages] = React.useState(false);
  const [pendingPeer, setPendingPeer] = React.useState<Peer | null>(null);
  const [expanded, setExpanded] = React.useState(false);
  const messagesListRef = React.useRef<HTMLDivElement | null>(null);

  const messagesRequestRef =
    React.useRef<CometChat.MessagesRequest | null>(null);
  const activePeerRef = React.useRef<Peer | null>(null);
  const listenerIdRef = React.useRef<string | null>(null);
  const shouldAutoScrollRef = React.useRef(true);

  const currentUid = React.useMemo(
    () => getUidForUser(authUser),
    [authUser]
  );
  const currentName = React.useMemo(
    () => getDisplayName(authUser),
    [authUser]
  );

  React.useEffect(() => {
    activePeerRef.current = activePeer;
  }, [activePeer]);

  const scrollMessagesToBottom = React.useCallback(() => {
    const container = messagesListRef.current;
    if (!container) return;
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, []);

  React.useEffect(() => {
    const container = messagesListRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = container;
      const nearBottom = scrollTop + clientHeight >= scrollHeight - 32;
      shouldAutoScrollRef.current = nearBottom;
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [activePeer, isOpen]);

  React.useEffect(() => {
    if (!isOpen || !activePeer) return;
    if (!shouldAutoScrollRef.current) return;
    scrollMessagesToBottom();
  }, [messages, scrollMessagesToBottom, isOpen, activePeer]);

  const fetchConversations = React.useCallback(async () => {
    const request = new CometChat.ConversationsRequestBuilder()
      .setLimit(30)
      .setConversationType("user")
      .build();
    return request.fetchNext();
  }, []);

  const refreshConversations = React.useCallback(async () => {
    try {
      const items = await fetchConversations();
      setConversations(items);
    } catch (err) {
      console.warn("Failed to refresh conversations", err);
    }
  }, [fetchConversations]);

  React.useEffect(() => {
    if (!isAuthenticated) {
      setStatus("idle");
      setOpen(false);
      setConversations([]);
      setContacts([]);
      setContactsLoaded(false);
      setActivePeer(null);
      setMessages([]);
      setMessageDraft("");
      setHasMoreMessages(false);
      setPendingPeer(null);
      if (listenerIdRef.current) {
        CometChat.removeMessageListener(listenerIdRef.current);
        listenerIdRef.current = null;
      }
      logoutCometChatUser();
    }
  }, [isAuthenticated]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ChatOpenDetail>).detail;
      if (!detail?.uid) return;

      if (!isAuthenticated || !currentUid) {
        setError("Please sign in to use chat.");
        setOpen(true);
        setPendingPeer(null);
        return;
      }

      const peer: Peer = {
        uid: detail.uid,
        name: detail.name ?? detail.uid,
        avatar: detail.avatar,
        type: "user",
      };

      if (detail.uid === currentUid) {
        setOpen(true);
        setActivePeer(peer);
        setPendingPeer(null);
        return;
      }

      setOpen(true);
      setPendingPeer(peer);
    };

    window.addEventListener(CHAT_OPEN_EVENT, handler as EventListener);
    return () =>
      window.removeEventListener(CHAT_OPEN_EVENT, handler as EventListener);
  }, [currentUid, isAuthenticated]);

  React.useEffect(() => {
    if (!isOpen) return;
    if (status === "ready") return;

    if (!isAuthenticated || !authUser || !currentUid) {
      setStatus("error");
      setError("Please sign in to use chat.");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setError(null);

    loginCometChatUser({
      uid: currentUid,
      name: currentName,
    })
      .then(() => {
        if (cancelled) return;
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error("CometChat login failed", err);
        setStatus("error");
        setError(
          err instanceof Error ? err.message : "Failed to initialize chat."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, status, isAuthenticated, authUser, currentUid, currentName]);

  React.useEffect(() => {
    if (!isOpen || status !== "ready") return;
    setLoadingConversations(true);
    let cancelled = false;

    fetchConversations()
      .then((items) => {
        if (cancelled) return;
        setConversations(items);
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn("Failed to load conversations", err);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingConversations(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, status, fetchConversations]);

  React.useEffect(() => {
    if (!isOpen || status !== "ready" || contactsLoaded) return;
    setLoadingContacts(true);
    let cancelled = false;

    usersAPI
      .list()
      .then((users) => {
        if (cancelled) return;
        const filtered = users.filter((user) => {
          const uid = getUidForUser(user);
          return uid && uid !== currentUid;
        });
        setContacts(filtered);
        setContactsLoaded(true);
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn("Failed to load users for chat", err);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingContacts(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, status, contactsLoaded, currentUid]);

  const loadMessagesForPeer = React.useCallback(async (peer: Peer) => {
    setLoadingMessages(true);
    setHasMoreMessages(false);
    messagesRequestRef.current = null;

    try {
      const builder = new CometChat.MessagesRequestBuilder()
        .setLimit(MESSAGE_BATCH_SIZE);

      if (peer.type === "group") {
        builder.setGUID(peer.uid);
      } else {
        builder.setUID(peer.uid);
      }

      const req = builder.build();
      messagesRequestRef.current = req;
      const batch = await req.fetchPrevious();
      const ordered = [...batch].reverse();
      shouldAutoScrollRef.current = true;
      setMessages(ordered);
      setHasMoreMessages(batch.length === MESSAGE_BATCH_SIZE);
    } catch (err) {
      console.warn("Failed to load messages", err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const ensurePeerReady = React.useCallback(
    async (peer: Peer) => {
      try {
        await ensureCometChatUser({
          uid: peer.uid,
          name: peer.name,
          avatar: peer.avatar,
        });
      } catch (err) {
        console.warn("Failed to ensure peer in CometChat", err);
      }
      setActivePeer(peer);
      shouldAutoScrollRef.current = true;
      await loadMessagesForPeer(peer);
      await refreshConversations();
    },
    [loadMessagesForPeer, refreshConversations]
  );

  React.useEffect(() => {
    if (!pendingPeer || !isOpen || status !== "ready") return;
    let cancelled = false;

    ensurePeerReady(pendingPeer).finally(() => {
      if (!cancelled) {
        setPendingPeer(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [pendingPeer, isOpen, status, ensurePeerReady]);

  const handleLoadOlderMessages = React.useCallback(async () => {
    if (!messagesRequestRef.current) return;
    try {
      shouldAutoScrollRef.current = false;
      const more = await messagesRequestRef.current.fetchPrevious();
      if (more.length === 0) {
        setHasMoreMessages(false);
        return;
      }
      const ordered = [...more].reverse();
      setMessages((prev) => [...ordered, ...prev]);
      if (more.length < MESSAGE_BATCH_SIZE) {
        setHasMoreMessages(false);
      }
      requestAnimationFrame(() => {
        shouldAutoScrollRef.current = true;
      });
    } catch (err) {
      console.warn("Failed to load more messages", err);
    }
  }, []);

  const handleSelectConversation = React.useCallback(
    async (conversation: CometChat.Conversation) => {
      const withEntity = conversation.getConversationWith() as
        | CometChat.User
        | CometChat.Group
        | undefined;
      if (!withEntity) return;

      if (conversation.getConversationType() === "group") {
        const peer: Peer = {
          uid: (withEntity as CometChat.Group).getGuid(),
          name:
            (withEntity as CometChat.Group).getName() ||
            (withEntity as CometChat.Group).getGuid(),
          type: "group",
        };
        await ensurePeerReady(peer);
      } else {
        const peer: Peer = {
          uid: (withEntity as CometChat.User).getUid(),
          name:
            (withEntity as CometChat.User).getName() ||
            (withEntity as CometChat.User).getUid(),
          type: "user",
          avatar: (withEntity as CometChat.User).getAvatar(),
        };
        await ensurePeerReady(peer);
      }
    },
    [ensurePeerReady]
  );

  const handleSelectContact = React.useCallback(
    async (user: BackendUser) => {
      const uid = getUidForUser(user);
      if (!uid) return;
      const peer: Peer = {
        uid,
        name: getDisplayName(user),
        type: "user",
      };
      try {
        await ensurePeerReady(peer);
      } catch (err) {
        console.warn("Failed to ensure contact user on CometChat", err);
      }
    },
    [ensurePeerReady]
  );

  const handleSendMessage = React.useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const text = messageDraft.trim();
      if (!text || !activePeer) return;

      const receiverType =
        activePeer.type === "group"
          ? CometChat.RECEIVER_TYPE.GROUP
          : CometChat.RECEIVER_TYPE.USER;

      const message = new CometChat.TextMessage(
        activePeer.uid,
        text,
        receiverType
      );

      try {
        const sent = await CometChat.sendMessage(message);
        shouldAutoScrollRef.current = true;
        setMessages((prev) => [...prev, sent]);
        setMessageDraft("");

        await refreshConversations();
      } catch (err) {
        console.error("Failed to send message", err);
      }
    },
    [messageDraft, activePeer, refreshConversations]
  );

  React.useEffect(() => {
    if (status !== "ready" || !currentUid) return;
    const listenerId = `pf-chat-${currentUid}`;
    listenerIdRef.current = listenerId;

    const listener = new CometChat.MessageListener({
      onTextMessageReceived: async (message: CometChat.TextMessage) => {
        await refreshConversations();

        const currentPeer = activePeerRef.current;
        if (!currentPeer) return;

        const isForActiveConversation =
          message.getReceiverType() === "user" &&
          ((message.getSender()?.getUid() === currentPeer.uid &&
            message.getReceiverId() === currentUid) ||
            (message.getSender()?.getUid() === currentUid &&
              message.getReceiverId() === currentPeer.uid));

        if (isForActiveConversation) {
          shouldAutoScrollRef.current = true;
          setMessages((prev) => [...prev, message]);
        }
      },
    });

    CometChat.addMessageListener(listenerId, listener);

    return () => {
      CometChat.removeMessageListener(listenerId);
      listenerIdRef.current = null;
    };
  }, [status, currentUid, refreshConversations]);

  const lastMessagePreview = React.useCallback(
    (conversation: CometChat.Conversation) => {
      const last = conversation.getLastMessage?.();
      if (!last) return "No messages yet";
      if (
        typeof (last as CometChat.TextMessage).getText === "function" &&
        last.getCategory?.() === "message" &&
        last.getType?.() === "text"
      ) {
        return (last as CometChat.TextMessage).getText();
      }
      return `[${last.getType?.() || "message"}]`;
    },
    []
  );

  const messagesToRender = messages;

  return (
    <div
      className={`${styles.widget} ${
        expanded ? styles.widgetExpanded : styles.widgetCompact
      }`}
    >
      {!isOpen ? (
        <button className={styles.toggleButton} onClick={() => setOpen(true)}>
          <i className="bi bi-chat-dots-fill" />
          Chat
        </button>
      ) : (
        <div
          className={`${styles.panel} ${expanded ? styles.panelExpanded : ""}`}
        >
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <strong>Messages</strong>
              <span>
                {status === "ready"
                  ? "Chat with other pet lovers"
                  : status === "loading"
                    ? "Connecting..."
                    : "Unavailable"}
              </span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                className={styles.expandButton}
                onClick={() => setExpanded((prev) => !prev)}
                title={expanded ? "Shrink chat" : "Expand chat"}
                type="button"
              >
                <i className={`bi ${expanded ? "bi-arrows-angle-contract" : "bi-arrows-fullscreen"}`} />
              </button>
              <button
                className={styles.closeButton}
                onClick={() => setOpen(false)}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>
          </div>
          {status === "error" ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <>
              <div className={styles.body}>
                <aside className={styles.section}>
                  <div className={styles.listHeader}>Recent</div>
                  {loadingConversations ? (
                    <div className={styles.loader}>Loading conversations...</div>
                  ) : (
                    <div className={styles.list}>
                      {conversations.length === 0 && (
                        <div className={styles.emptyState}>
                          No conversations yet.
                        </div>
                      )}
                      {conversations.map((conversation) => {
                        const withEntity = conversation.getConversationWith() as
                          | CometChat.User
                          | undefined;
                        if (!withEntity) return null;
                        const uid = withEntity.getUid();
                        const isActive =
                          activePeer?.uid === uid &&
                          activePeer.type === "user";
                        return (
                          <button
                            key={conversation.getConversationId()}
                            className={`${styles.listItem} ${
                              isActive ? styles.listItemActive : ""
                            }`}
                            onClick={() =>
                              handleSelectConversation(conversation)
                            }
                          >
                            <span className={styles.listItemTitle}>
                              {withEntity.getName() || uid}
                            </span>
                            <span className={styles.listItemSubtitle}>
                              {lastMessagePreview(conversation)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className={styles.listHeader}>People</div>
                  {loadingContacts ? (
                    <div className={styles.loader}>Loading users...</div>
                  ) : (
                    <div className={styles.list}>
                      {contacts.map((user) => {
                        const uid = getUidForUser(user);
                        if (!uid) return null;
                        const isActive =
                          activePeer?.uid === uid &&
                          activePeer.type === "user";
                        return (
                          <button
                            key={uid}
                            className={`${styles.listItem} ${
                              isActive ? styles.listItemActive : ""
                            }`}
                            onClick={() => handleSelectContact(user)}
                          >
                            <span className={styles.listItemTitle}>
                              {getDisplayName(user)}
                            </span>
                            <span className={styles.listItemSubtitle}>
                              Start chat
                            </span>
                          </button>
                        );
                      })}
                      {contacts.length === 0 && (
                        <div className={styles.emptyState}>
                          Invite more users to start chatting.
                        </div>
                      )}
                    </div>
                  )}
                </aside>

                <section className={styles.messagesSection}>
                  <div className={styles.messagesHeader}>
                    <h3>{activePeer?.name ?? "Pick someone to chat"}</h3>
                    {activePeer && (
                      <span className={styles.listItemSubtitle}>
                        UID: {activePeer.uid}
                      </span>
                    )}
                  </div>
                  <div className={styles.messagesList} ref={messagesListRef}>
                    {loadingMessages ? (
                      <div className={styles.loader}>Loading messages...</div>
                    ) : activePeer ? (
                      <>
                        {hasMoreMessages && (
                          <button
                            type="button"
                            className={styles.loadMore}
                            onClick={handleLoadOlderMessages}
                          >
                            Load previous messages
                          </button>
                        )}
                        {messagesToRender.length === 0 && (
                          <div className={styles.emptyState}>
                            Say hello to start the conversation.
                          </div>
                        )}
                        {messagesToRender.map((msg) => {
                          const senderUid = msg.getSender?.()?.getUid?.();
                          const isMine = senderUid === currentUid;
                          const text =
                            (msg as CometChat.TextMessage).getText?.() ??
                            `[${msg.getType?.() || "message"}]`;

                          return (
                            <div
                              key={`${msg.getId?.() ?? msg.getSentAt?.()}-${
                                msg.getSentAt?.() ?? Math.random()
                              }`}
                              className={`${styles.messageBubble} ${
                                isMine ? styles.messageMine : ""
                              }`}
                            >
                              <span>{text}</span>
                              <span className={styles.messageMeta}>
                                {isMine ? "You" : senderUid} -{" "}
                                {formatTime(msg.getSentAt?.())}
                              </span>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <div className={styles.emptyState}>
                        Select a conversation to start chatting.
                      </div>
                    )}
                  </div>
                  <div className={styles.composer}>
                    <form
                      onSubmit={handleSendMessage}
                      className={styles.composerForm}
                    >
                      <input
                        className={styles.composerInput}
                        placeholder={
                          activePeer
                            ? "Type a message..."
                            : "Select a user to start the chat"
                        }
                        value={messageDraft}
                        onChange={(event) =>
                          setMessageDraft(event.currentTarget.value)
                        }
                        disabled={!activePeer}
                      />
                      <button
                        className={styles.composerButton}
                        type="submit"
                        disabled={!activePeer || !messageDraft.trim()}
                      >
                        Send
                      </button>
                    </form>
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
