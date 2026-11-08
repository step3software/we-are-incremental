import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const files = new Map([
  ["/", ["../index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["../index.html", "text/html; charset=utf-8"]],
  ["/src/main.js", ["../src/main.js", "text/javascript; charset=utf-8"]],
  ["/src/game.js", ["../src/game.js", "text/javascript; charset=utf-8"]],
  ["/src/viral.js", ["../src/viral.js", "text/javascript; charset=utf-8"]],
  ["/src/storage.js", ["../src/storage.js", "text/javascript; charset=utf-8"]],
  ["/src/styles.css", ["../src/styles.css", "text/css; charset=utf-8"]]
]);

const port = Number(process.env.PORT || 5173);
const server = createServer(async (request, response) => {
  let path;
  try {
    path = new URL(request.url || "/", "http://localhost").pathname;
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }
  const file = files.get(path);
  if (!file) {
    response.writeHead(404).end("Not found");
    return;
  }
  try {
    const data = await readFile(new URL(file[0], import.meta.url));
    response.writeHead(200, { "Content-Type": file[1], "Cache-Control": "no-store" });
    response.end(data);
  } catch {
    response.writeHead(500).end("Unable to serve file");
  }
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write("We Are Incremental: http://127.0.0.1:" + server.address().port + "\n");
});
