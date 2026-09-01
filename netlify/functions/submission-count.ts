import { getStore } from "@netlify/blobs";

const STORE_NAME = "canina";
const COUNT_KEY = "submission-count";

type CountEntry = {
  count?: unknown;
};

const jsonResponse = (body: object, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

const normalizeCount = (count: unknown) =>
  typeof count === "number" && Number.isFinite(count)
    ? Math.max(0, Math.floor(count))
    : 0;

const readCount = async () => {
  const store = getStore(STORE_NAME);
  const entry = (await store.get(COUNT_KEY, {
    consistency: "strong",
    type: "json",
  })) as CountEntry | null;

  return normalizeCount(entry?.count);
};

const writeCount = async (count: number) => {
  const store = getStore(STORE_NAME);
  await store.setJSON(COUNT_KEY, { count });
  return count;
};

export default async (request: Request) => {
  if (request.method === "GET") {
    return jsonResponse({ count: await readCount() });
  }

  if (request.method === "POST") {
    const nextCount = (await readCount()) + 1;
    return jsonResponse({ count: await writeCount(nextCount) });
  }

  if (request.method === "PUT") {
    try {
      const data = (await request.json()) as CountEntry;
      return jsonResponse({ count: await writeCount(normalizeCount(data.count)) });
    } catch {
      return jsonResponse({ error: "Invalid submission count" }, { status: 400 });
    }
  }

  return jsonResponse({ error: "Method not allowed" }, { status: 405 });
};
