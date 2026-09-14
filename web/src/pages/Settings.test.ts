import { describe, expect, it } from "vitest";
import { modelCardStatus } from "./Settings";

describe("model card status", () => {
  it("prefers a fresh test result over a stale save confirmation", () => {
    // #698：测完显示的一直是 "Saved"，分不清这一句说的是保存还是测试
    expect(
      modelCardStatus(
        { ok: true, message: "Reachable and authenticated (OK)" },
        null,
        { error: null, saved: true },
      ),
    ).toEqual({
      kind: "note",
      tone: "text-ok",
      text: "Reachable and authenticated (OK)",
    });
  });

  it("surfaces a failed test instead of the previous save state", () => {
    expect(
      modelCardStatus(
        { ok: false, message: "Not configured" },
        null,
        { error: null, saved: true },
      ),
    ).toEqual({ kind: "note", tone: "text-danger", text: "Not configured" });
  });

  it("reports a transport-level test failure rather than going quiet", () => {
    // 从前请求本身没通时卡上什么都不说，旧的 "Saved" 还贴着
    expect(
      modelCardStatus(null, "Network Error", { error: null, saved: true }),
    ).toEqual({ kind: "note", tone: "text-danger", text: "Network Error" });
  });

  it("keeps save errors and confirmations when nothing was tested", () => {
    expect(
      modelCardStatus(null, null, { error: "401 Unauthorized", saved: false }),
    ).toEqual({
      kind: "note",
      tone: "text-danger",
      text: "401 Unauthorized",
    });
    expect(
      modelCardStatus(null, null, { error: null, saved: true }),
    ).toEqual({ kind: "saved" });
  });

  it("stays silent when nothing happened yet", () => {
    expect(
      modelCardStatus(null, null, { error: null, saved: false }),
    ).toEqual({ kind: "idle" });
  });
});
