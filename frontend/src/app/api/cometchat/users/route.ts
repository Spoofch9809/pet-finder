import { NextRequest, NextResponse } from "next/server";

type EnsureUserPayload = {
  uid?: string;
  name?: string;
  avatar?: string;
};

const appId = process.env.NEXT_PUBLIC_COMETCHAT_APP_ID;
const region = process.env.NEXT_PUBLIC_COMETCHAT_REGION;
const restKey = process.env.COMETCHAT_REST_API_KEY;

function assertConfig() {
  if (!appId || !region || !restKey) {
    throw new Error("CometChat server credentials are not configured");
  }
}

export async function POST(request: NextRequest) {
  let safeAppId: string;
  let safeRegion: string;
  let safeRestKey: string;
  try {
    assertConfig();
    safeAppId = appId as string;
    safeRegion = region as string;
    safeRestKey = restKey as string;
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }

  let payload: EnsureUserPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const uid = payload.uid?.trim();
  if (!uid) {
    return NextResponse.json({ message: "uid is required" }, { status: 400 });
  }

  const url = `https://${safeAppId}.api-${safeRegion}.cometchat.io/v3/users`;
  console.log("[cometchat] ensure user request", {
    uid,
    hasName: Boolean(payload.name),
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      appId: safeAppId,
      apiKey: safeRestKey,
    },
    body: JSON.stringify({
      uid,
      name: payload.name ?? uid,
      avatar: payload.avatar,
    }),
  });

  const rawBody = await response.text();
  let parsedBody: any = null;
  try {
    parsedBody = rawBody ? JSON.parse(rawBody) : null;
  } catch (error) {
    // ignore parse failure; raw body will be used in message
  }

  const alreadyExists =
    (response.status === 409 || response.status === 400) &&
    (parsedBody?.error?.code === "ERR_UID_ALREADY_EXISTS" ||
      parsedBody?.data?.code === "ERR_UID_ALREADY_EXISTS");

  if (response.ok || alreadyExists) {
    return NextResponse.json(
      {
        success: true,
        status: response.status,
        data: parsedBody ?? null,
        note: alreadyExists ? "uid-already-exists" : "created",
      },
      { status: 200 }
    );
  }

  const message =
    parsedBody?.data?.message ||
    parsedBody?.message ||
    (rawBody ? String(rawBody) : "") ||
    response.statusText ||
    "Unknown error";

  console.error("[cometchat] failed to create user", {
    status: response.status,
    body: parsedBody ?? rawBody,
  });

  return NextResponse.json({ message }, { status: response.status });
}
