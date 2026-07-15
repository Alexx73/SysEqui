import { createServer } from "node:http";
import { spawn, execFile } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync, unlinkSync, createWriteStream } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import net from "node:net";
import os from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..", "..");
const backendPath = join(projectRoot, "Back_SysEqui");
const frontendPath = join(projectRoot, "Front_SysEqui");
const localStateDir = join(process.env.LOCALAPPDATA || os.tmpdir(), "SysEqui");
const logsDir = join(localStateDir, "ControlNodeLogs");
const statePath = join(localStateDir, "control-node-state.json");
const controlPort = 7331;
const frontendUrl = "http://localhost:5173";

const ports = {
  database: 27017,
  backend: 5000,
  frontend: 5173,
};

const mongoContainerName = "sysequi-mongodb";
const clients = new Set();
let operationRunning = false;

mkdirSync(logsDir, { recursive: true });

function now() {
  return new Date().toLocaleTimeString("es-AR", { hour12: false });
}

function log(message) {
  const line = `[${now()}] ${message}`;
  appendFileSync(join(logsDir, "control.log"), `${line}\n`, "utf8");
  broadcast("log", { line });
}

function broadcast(type, payload) {
  const data = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of clients) client.write(data);
}

function readState() {
  try {
    if (existsSync(statePath)) return JSON.parse(readFileSync(statePath, "utf8"));
  } catch {
    // Estado inválido: se ignora.
  }
  return {};
}

function saveState(state) {
  mkdirSync(dirname(statePath), { recursive: true });
  writeFileSync(statePath, JSON.stringify(state, null, 2), "utf8");
}

function removeState() {
  try {
    if (existsSync(statePath)) unlinkSync(statePath);
  } catch {
    // Best effort.
  }
}

function run(file, args, options = {}) {
  const timeoutMs = options.timeoutMs ?? 10000;
  return new Promise((resolveRun) => {
    const child = execFile(file, args, { windowsHide: true, timeout: timeoutMs }, (error, stdout, stderr) => {
      resolveRun({
        code: error?.code ?? 0,
        signal: error?.signal ?? null,
        stdout: String(stdout || "").trim(),
        stderr: String(stderr || "").trim(),
        timedOut: Boolean(error?.killed),
      });
    });
    child.on("error", (error) => {
      resolveRun({ code: -1, signal: null, stdout: "", stderr: error.message, timedOut: false });
    });
  });
}

async function commandExists(command) {
  const result = await run("where.exe", [command], { timeoutMs: 5000 });
  return result.code === 0;
}

function isPortOpenOnHost(port, host, timeoutMs = 350) {
  return new Promise((resolveOpen) => {
    const socket = new net.Socket();
    let settled = false;
    const done = (value) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolveOpen(value);
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
    socket.connect(port, host);
  });
}

async function isPortOpen(port, timeoutMs = 350) {
  for (const host of ["127.0.0.1", "::1", "localhost"]) {
    if (await isPortOpenOnHost(port, host, timeoutMs)) return true;
  }
  return false;
}

async function waitForPort(port, label, timeoutSeconds) {
  log(`Esperando ${label} en puerto ${port}...`);
  const deadline = Date.now() + timeoutSeconds * 1000;
  while (Date.now() < deadline) {
    if (await isPortOpen(port)) {
      log(`${label} respondió en puerto ${port}.`);
      return;
    }
    await sleep(500);
  }
  throw new Error(`${label} no respondió en el puerto ${port}.`);
}

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

async function dockerInfo() {
  const result = await run("docker.exe", ["info"], { timeoutMs: 6000 });
  return result.code === 0;
}

async function ensureDockerDesktop() {
  log("Verificando Docker Desktop...");
  if (await dockerInfo()) {
    log("Docker ya está listo.");
    return;
  }

  const dockerDesktop = join(process.env.ProgramFiles || "C:\\Program Files", "Docker", "Docker", "Docker Desktop.exe");
  if (!existsSync(dockerDesktop)) throw new Error(`No se encontró Docker Desktop en ${dockerDesktop}`);

  log("Abriendo Docker Desktop...");
  spawn(dockerDesktop, [], { detached: true, stdio: "ignore", windowsHide: false }).unref();

  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    if (await dockerInfo()) {
      log("Docker Desktop está listo.");
      return;
    }
    await sleep(2000);
  }
  throw new Error("Docker Desktop no estuvo listo después de 120 segundos.");
}

async function ensureMongo() {
  log("Verificando contenedor MongoDB...");
  const inspect = await run("docker.exe", ["inspect", "-f", "{{.State.Running}}", mongoContainerName], { timeoutMs: 10000 });
  if (inspect.code !== 0) throw new Error(`No existe el contenedor Docker '${mongoContainerName}' o Docker no está disponible.`);
  if (inspect.stdout === "true") {
    log("MongoDB ya estaba activo.");
    return;
  }

  log("Iniciando MongoDB...");
  const start = await run("docker.exe", ["start", mongoContainerName], { timeoutMs: 30000 });
  if (start.code !== 0) throw new Error(`No se pudo iniciar MongoDB: ${start.stderr || start.stdout}`);
}

function startNpmProcess(cwd, logName) {
  const logPath = join(logsDir, logName);
  const logStream = createWriteStream(logPath, { flags: "a" });
  const child = spawn("cmd.exe", ["/d", "/c", "npm.cmd", "run", "dev"], {
    cwd,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => {
    const text = chunk.toString();
    logStream.write(text);
    for (const line of text.split(/\r?\n/).filter(Boolean)) log(`${logName}: ${line}`);
  });
  child.stderr.on("data", (chunk) => {
    const text = chunk.toString();
    logStream.write(text);
    for (const line of text.split(/\r?\n/).filter(Boolean)) log(`${logName}: ${line}`);
  });
  child.on("exit", (code) => {
    log(`${logName}: proceso finalizado con código ${code ?? "sin código"}.`);
    logStream.end();
  });

  log(`Proceso iniciado PID ${child.pid}. Log: ${logPath}`);
  return child.pid;
}

async function startAll() {
  if (operationRunning) return;
  operationRunning = true;
  try {
    broadcast("operation", { running: true, text: "Iniciando..." });
    broadcast("progress", { value: 5 });
    validateProject();
    log("Iniciando SysEqui...");

    if (!(await commandExists("npm.cmd"))) throw new Error("No se encontró npm.cmd. Instalá Node.js o agregalo al PATH.");
    if (!(await commandExists("docker.exe"))) throw new Error("No se encontró docker.exe. Instalá Docker Desktop o agregalo al PATH.");

    await ensureDockerDesktop();
    broadcast("progress", { value: 25 });

    await ensureMongo();
    broadcast("progress", { value: 38 });
    await waitForPort(ports.database, "MongoDB", 30);

    const state = readState();
    if (!(await isPortOpen(ports.backend))) {
      log("Iniciando backend...");
      state.backendPid = startNpmProcess(backendPath, "backend.log");
    } else {
      log("Backend ya estaba activo.");
    }
    broadcast("progress", { value: 58 });
    await waitForPort(ports.backend, "Backend", 120);

    if (!(await isPortOpen(ports.frontend))) {
      log("Iniciando frontend...");
      state.frontendPid = startNpmProcess(frontendPath, "frontend.log");
    } else {
      log("Frontend ya estaba activo.");
    }
    broadcast("progress", { value: 80 });
    await waitForPort(ports.frontend, "Frontend", 90);

    state.startedAt = new Date().toISOString();
    saveState(state);
    broadcast("progress", { value: 100 });
    log("SysEqui iniciado correctamente.");
  } catch (error) {
    log(`ERROR: ${error.message}`);
    broadcast("error", { message: error.message });
  } finally {
    operationRunning = false;
    broadcast("operation", { running: false, text: "" });
    await sendStatus();
  }
}

async function stopAll() {
  if (operationRunning) return;
  operationRunning = true;
  try {
    broadcast("operation", { running: true, text: "Deteniendo..." });
    broadcast("progress", { value: 10 });
    log("Deteniendo SysEqui...");

    const state = readState();
    await stopProcessTree(state.backendPid);
    await stopProcessTree(state.frontendPid);
    broadcast("progress", { value: 40 });

    await stopPortOwners(ports.backend);
    await stopPortOwners(ports.frontend);
    await stopProjectProcesses(backendPath);
    await stopProjectProcesses(frontendPath);
    broadcast("progress", { value: 65 });

    const inspect = await run("docker.exe", ["inspect", "-f", "{{.State.Running}}", mongoContainerName], { timeoutMs: 8000 });
    if (inspect.code === 0 && inspect.stdout === "true") {
      log("Deteniendo MongoDB...");
      await run("docker.exe", ["stop", mongoContainerName], { timeoutMs: 30000 });
    }

    removeState();
    await waitForPortClosed(ports.backend, "Backend", 10);
    await waitForPortClosed(ports.frontend, "Frontend", 10);
    broadcast("progress", { value: 100 });
    log("SysEqui detenido.");
  } catch (error) {
    log(`ERROR: ${error.message}`);
    broadcast("error", { message: error.message });
  } finally {
    operationRunning = false;
    broadcast("operation", { running: false, text: "" });
    await sendStatus();
  }
}

function validateProject() {
  if (!existsSync(join(backendPath, "package.json"))) throw new Error(`No se encontró el backend en ${backendPath}`);
  if (!existsSync(join(frontendPath, "package.json"))) throw new Error(`No se encontró el frontend en ${frontendPath}`);
}

async function stopProcessTree(pid) {
  if (!pid) return;
  log(`Deteniendo PID ${pid}...`);
  await run("taskkill.exe", ["/PID", String(pid), "/T", "/F"], { timeoutMs: 10000 });
}

async function stopPortOwners(port) {
  const owners = await getPortOwners(port);
  if (owners.length === 0) log(`No se encontraron procesos escuchando en el puerto ${port}.`);
  for (const pid of owners) await stopProcessTree(pid);
}

async function getPortOwners(port) {
  const script = [
    "$ErrorActionPreference='SilentlyContinue'",
    `Get-NetTCPConnection -LocalPort ${port} -State Listen | ` +
    "Select-Object -ExpandProperty OwningProcess -Unique",
  ].join("; ");
  const powershellResult = await run("powershell.exe", ["-NoProfile", "-Command", script], { timeoutMs: 8000 });
  const owners = new Set();

  if (powershellResult.code === 0 && powershellResult.stdout) {
    for (const line of powershellResult.stdout.split(/\r?\n/)) {
      const pid = Number(line.trim());
      if (Number.isInteger(pid) && pid > 0) owners.add(pid);
    }
  }

  if (owners.size > 0) return [...owners];

  const result = await run("netstat.exe", ["-ano", "-p", "tcp"], { timeoutMs: 8000 });
  if (result.code !== 0) return [];
  for (const line of result.stdout.split(/\r?\n/)) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 5 || parts[0].toUpperCase() !== "TCP") continue;
    const localAddress = parts[1];
    const status = parts[3]?.toUpperCase();
    if (!["LISTENING", "ESCUCHANDO"].includes(status)) continue;
    if (!localAddress.endsWith(`:${port}`)) continue;
    const pid = Number(parts[4]);
    if (Number.isInteger(pid) && pid > 0) owners.add(pid);
  }
  return [...owners];
}

async function stopProjectProcesses(projectPath) {
  const escapedPath = projectPath.replaceAll("'", "''");
  const script = [
    "$ErrorActionPreference='SilentlyContinue'",
    "Get-CimInstance Win32_Process | " +
    `Where-Object { $_.CommandLine -like '*${escapedPath}*' -and $_.ProcessId -ne $PID } | ` +
    "Select-Object -ExpandProperty ProcessId -Unique",
  ].join("; ");

  const result = await run("powershell.exe", ["-NoProfile", "-Command", script], { timeoutMs: 10000 });
  if (result.code !== 0 || !result.stdout) return;

  const pids = result.stdout
    .split(/\r?\n/)
    .map((line) => Number(line.trim()))
    .filter((pid) => Number.isInteger(pid) && pid > 0);

  for (const pid of pids) await stopProcessTree(pid);
}

async function waitForPortClosed(port, label, timeoutSeconds) {
  const deadline = Date.now() + timeoutSeconds * 1000;
  while (Date.now() < deadline) {
    if (!(await isPortOpen(port))) {
      log(`${label} quedó apagado.`);
      return;
    }
    await sleep(500);
  }
  throw new Error(`${label} sigue activo en el puerto ${port}.`);
}

async function getStatus() {
  const databaseInspect = await run("docker.exe", ["inspect", "-f", "{{.State.Running}}", mongoContainerName], {
    timeoutMs: 2500,
  });
  const database = databaseInspect.code === 0 && databaseInspect.stdout === "true" && (await isPortOpen(ports.database));
  const backend = await isPortOpen(ports.backend);
  const frontend = await isPortOpen(ports.frontend);
  const state = database && backend && frontend ? "running" : database || backend || frontend ? "partial" : "stopped";
  return { state, database, backend, frontend, operationRunning };
}

async function sendStatus() {
  broadcast("status", await getStatus());
}

function openFrontend() {
  spawn("explorer.exe", [frontendUrl], { detached: true, stdio: "ignore", windowsHide: true }).unref();
}

function openLogsFolder() {
  spawn("explorer.exe", [logsDir], { detached: true, stdio: "ignore", windowsHide: true }).unref();
}

function openControlWindow() {
  const url = `http://localhost:${controlPort}`;
  const browsers = [
    join(process.env.ProgramFiles || "C:\\Program Files", "Microsoft", "Edge", "Application", "msedge.exe"),
    join(process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)", "Microsoft", "Edge", "Application", "msedge.exe"),
    join(process.env.ProgramFiles || "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe"),
    join(process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)", "Google", "Chrome", "Application", "chrome.exe"),
  ];
  const browser = browsers.find(existsSync);
  if (browser) {
    spawn(browser, [`--app=${url}`, "--window-size=660,560"], { detached: true, stdio: "ignore" }).unref();
    return;
  }
  spawn("explorer.exe", [url], { detached: true, stdio: "ignore", windowsHide: true }).unref();
}

function html() {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Control SysEqui</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Segoe UI, Arial, sans-serif; background: #111827; color: #f9fafb; }
    main { width: 100%; max-width: 660px; padding: 18px; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    h1 { margin: 0; color: #facc15; font-size: 28px; }
    #general { font-weight: 700; color: #facc15; }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
    .card { background: #1f2937; border: 1px solid #374151; border-radius: 8px; padding: 10px; }
    .card span { display: block; color: #cbd5e1; font-size: 13px; margin-bottom: 4px; }
    .value { font-weight: 800; color: #f87171; }
    .value.on { color: #4ade80; }
    .buttons { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 12px; }
    button { border: 0; border-radius: 7px; padding: 10px 8px; color: white; font-weight: 700; cursor: pointer; }
    button:disabled { opacity: .45; cursor: not-allowed; }
    .start { background: #16a34a; }
    .stop { background: #dc2626; }
    .open { background: #2563eb; }
    .secondary { background: #4b5563; }
    progress { width: 100%; height: 12px; accent-color: #38bdf8; margin-bottom: 12px; }
    #logs { height: 285px; overflow: auto; white-space: pre-wrap; background: #030712; border: 1px solid #374151; border-radius: 8px; padding: 10px; font: 12px Consolas, monospace; color: #e5e7eb; }
    @media (max-width: 560px) {
      .cards { grid-template-columns: 1fr; }
      .buttons { grid-template-columns: 1fr 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>SysEqui</h1>
      <div id="general">Comprobando...</div>
    </header>
    <section class="cards">
      <div class="card"><span>MongoDB</span><strong id="database" class="value">OFF</strong></div>
      <div class="card"><span>Backend :5000</span><strong id="backend" class="value">OFF</strong></div>
      <div class="card"><span>Frontend :5173</span><strong id="frontend" class="value">OFF</strong></div>
    </section>
    <section class="buttons">
      <button id="start" class="start">Iniciar todo</button>
      <button id="stop" class="stop">Detener todo</button>
      <button id="front" class="open">Abrir frontend</button>
      <button id="logsBtn" class="secondary">Abrir logs</button>
      <button id="close" class="secondary">Cerrar</button>
    </section>
    <progress id="progress" value="0" max="100"></progress>
    <section id="logs"></section>
  </main>
  <script>
    const $ = (id) => document.getElementById(id);
    const source = new EventSource('/events');
    const setOnline = (id, on) => { $(id).textContent = on ? 'ON' : 'OFF'; $(id).classList.toggle('on', on); };
    const setBusy = (busy) => {
      $('start').disabled = busy;
      $('stop').disabled = busy;
      $('front').disabled = busy;
      $('logsBtn').disabled = busy;
      $('close').disabled = busy;
    };
    const post = (path) => fetch(path, { method: 'POST' });
    $('start').onclick = () => post('/api/start');
    $('stop').onclick = () => post('/api/stop');
    $('front').onclick = () => post('/api/open-frontend');
    $('logsBtn').onclick = () => post('/api/open-logs');
    $('close').onclick = async () => { await post('/api/shutdown'); window.close(); };
    source.addEventListener('status', (event) => {
      const s = JSON.parse(event.data);
      setOnline('database', s.database);
      setOnline('backend', s.backend);
      setOnline('frontend', s.frontend);
      $('general').textContent = s.state === 'running' ? 'En ejecución' : s.state === 'partial' ? 'Inicio parcial' : 'Detenido';
      $('general').style.color = s.state === 'running' ? '#4ade80' : s.state === 'partial' ? '#facc15' : '#f87171';
      if (!s.operationRunning) {
        $('start').disabled = s.state === 'running';
        $('stop').disabled = s.state === 'stopped';
        $('front').disabled = !s.frontend;
        $('logsBtn').disabled = false;
        $('close').disabled = false;
      }
    });
    source.addEventListener('operation', (event) => {
      const op = JSON.parse(event.data);
      setBusy(op.running);
      if (op.text) $('general').textContent = op.text;
    });
    source.addEventListener('progress', (event) => $('progress').value = JSON.parse(event.data).value);
    source.addEventListener('log', (event) => {
      const logs = $('logs');
      logs.textContent += JSON.parse(event.data).line + '\\n';
      logs.scrollTop = logs.scrollHeight;
    });
    source.addEventListener('error', (event) => alert(JSON.parse(event.data).message));
  </script>
</body>
</html>`;
}

const server = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/api/status") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(await getStatus()));
    return;
  }

  if (req.url === "/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    clients.add(res);
    req.on("close", () => clients.delete(res));
    res.write(`event: log\ndata: ${JSON.stringify({ line: `[${now()}] Panel conectado.` })}\n\n`);
    res.write(`event: status\ndata: ${JSON.stringify(await getStatus())}\n\n`);
    return;
  }

  if (req.method === "POST" && req.url === "/api/start") {
    startAll();
    res.writeHead(202).end();
    return;
  }
  if (req.method === "POST" && req.url === "/api/stop") {
    stopAll();
    res.writeHead(202).end();
    return;
  }
  if (req.method === "POST" && req.url === "/api/open-frontend") {
    openFrontend();
    res.writeHead(204).end();
    return;
  }
  if (req.method === "POST" && req.url === "/api/open-logs") {
    openLogsFolder();
    res.writeHead(204).end();
    return;
  }
  if (req.method === "POST" && req.url === "/api/shutdown") {
    res.writeHead(204).end();
    setTimeout(() => process.exit(0), 250);
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html());
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE" && process.argv.includes("--open")) {
    openControlWindow();
    process.exit(0);
  }
  console.error(error);
  process.exit(1);
});

server.listen(controlPort, "127.0.0.1", async () => {
  log(`Control Node iniciado en http://localhost:${controlPort}`);
  if (process.argv.includes("--open")) openControlWindow();
  await sendStatus();
  setInterval(sendStatus, 2500).unref();
});
