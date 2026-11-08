import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

test("development server serves JS modules with a valid JavaScript MIME type", { timeout: 15000 }, async t => {
  const cwd = fileURLToPath(new URL("../", import.meta.url));
  const child = spawn(process.execPath, ["scripts/serve.mjs"], {
    cwd,
    env: { ...process.env, PORT: "0" },
    stdio: ["ignore", "pipe", "pipe"]
  });
  t.after(() => child.kill());

  let errors = "";
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", chunk => { errors += chunk; });

  const port = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Server did not start: " + errors)), 8000);
    const fail = error => { clearTimeout(timer); reject(error); };
    child.once("error", fail);
    child.once("exit", code => fail(new Error("Server exited with code " + code + ": " + errors)));
    child.stdout.setEncoding("utf8");
    let output = "";
    child.stdout.on("data", chunk => {
      output += chunk;
      const match = output.match(/http:\/\/127\.0\.0\.1:(\d+)/);
      if (!match) return;
      clearTimeout(timer);
      resolve(Number(match[1]));
    });
  });

  const origin = "http://127.0.0.1:" + port;
  for (const pathname of ["/src/main.js", "/src/game.js", "/src/storage.js", "/src/viral.js", "/src/skills.js"]) {
    const response = await fetch(origin + pathname);
    assert.equal(response.status, 200, pathname + " must be served");
    assert.match(response.headers.get("content-type") || "", /^text\/javascript\b/,
      pathname + " must have a JavaScript content type");
    assert.ok((await response.text()).length > 0, pathname + " must have a nonempty body");
  }

  const missing = await fetch(origin + "/src/does-not-exist.js");
  assert.equal(missing.status, 404, "server must not expose arbitrary filesystem paths");
});
