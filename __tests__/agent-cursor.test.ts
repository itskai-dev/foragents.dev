import { decodeCursor, encodeCursor, isNewerThanCursor } from "@/lib/agentCursor";

describe("agentCursor", () => {
  test("encode/decode roundtrip", () => {
    const cur = encodeCursor({ t: "2026-02-01T00:00:00.000Z", ids: ["a", "b"] });
    const decoded = decodeCursor(cur);
    expect(decoded?.t).toBe("2026-02-01T00:00:00.000Z");
    expect(decoded?.ids).toEqual(["a", "b"]);
  });

  test("decode invalid returns null", () => {
    expect(decodeCursor("not-base64")).toBeNull();
    expect(decodeCursor(null)).toBeNull();
  });

  test("isNewerThanCursor compares timestamp then ids", () => {
    const cursor = { t: "2026-02-01T00:00:00.000Z", ids: ["seen"] };

    expect(
      isNewerThanCursor({
        itemPublishedAt: "2026-02-01T00:00:01.000Z",
        itemId: "x",
        cursor,
      })
    ).toBe(true);

    expect(
      isNewerThanCursor({
        itemPublishedAt: "2026-01-31T23:59:59.000Z",
        itemId: "x",
        cursor,
      })
    ).toBe(false);

    // Same timestamp, id not in seen list -> new
    expect(
      isNewerThanCursor({
        itemPublishedAt: "2026-02-01T00:00:00.000Z",
        itemId: "new",
        cursor,
      })
    ).toBe(true);

    // Same timestamp, id already seen -> not new
    expect(
      isNewerThanCursor({
        itemPublishedAt: "2026-02-01T00:00:00.000Z",
        itemId: "seen",
        cursor,
      })
    ).toBe(false);
  });
});
