const $ = (id) => document.getElementById(id);
let rows = [],
  categories = [],
  hasRoot = false,
  busy = false,
  valid = false;
const selected = () => rows.filter((r) => r.checked);
function controls() {
  for (const id of ["choose", "demo", "undo"]) $(id).disabled = busy;
  $("scan").disabled = busy || !hasRoot;
  $("open").disabled = busy || !hasRoot;
  $("apply").disabled = busy || !valid || !selected().length;
  $("apply").textContent = selected().length
    ? `Organize ${selected().length} files →`
    : "Organize files →";
  document
    .querySelectorAll("tbody input,tbody select,input[name=engine],#select-all")
    .forEach((e) => (e.disabled = busy));
  $("model").disabled =
    busy || !document.querySelector("input[value=ai]").checked;
}
async function run(message, fn) {
  busy = true;
  controls();
  $("status").textContent = message;
  $("errors").hidden = true;
  try {
    await fn();
  } catch (e) {
    $("status").textContent = e.message;
  } finally {
    busy = false;
    controls();
  }
}
function setRoot(root) {
  if (!root) return;
  hasRoot = true;
  rows = [];
  valid = false;
  render();
  $("folder-title").textContent = root.split(/[\\/]/).pop();
  $("folder-path").textContent = root;
  $("status").textContent =
    "Folder ready. Analyze it to create a sorting plan.";
}
function render() {
  $("files").replaceChildren();
  $("count").textContent = rows.length;
  $("empty").hidden = rows.length > 0;
  $("table-wrap").hidden = !rows.length;
  $("select-wrap").hidden = !rows.length;
  for (const row of rows) {
    const tr = document.createElement("tr");
    const cell = () => {
      const td = document.createElement("td");
      tr.append(td);
      return td;
    };
    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = row.checked;
    check.setAttribute("aria-label", `Select ${row.name}`);
    check.onchange = () => {
      row.checked = check.checked;
      controls();
    };
    cell().append(check);
    cell().textContent = row.name;
    cell().textContent =
      row.size < 1024 ? `${row.size} B` : `${(row.size / 1024).toFixed(1)} KB`;
    const method = cell();
    method.textContent = row.note || row.method;
    const select = document.createElement("select");
    select.setAttribute("aria-label", `Destination for ${row.name}`);
    for (const name of categories) {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name + "/";
      option.selected = name === row.category;
      select.append(option);
    }
    select.onchange = () => (row.category = select.value);
    cell().append(select);
    $("files").append(tr);
  }
  controls();
}
function result(r, verb) {
  $("status").textContent =
    `${verb} ${r.count} files.${r.errors.length ? ` ${r.errors.length} files need attention.` : ""}`;
  if (r.errors.length) {
    $("errors").hidden = false;
    $("errors").open = true;
    $("errors").querySelector("pre").textContent = r.errors.join("\n");
  }
  valid = false;
  rows = [];
  render();
  $("summary").textContent = "Analyze again to create a fresh preview.";
}
$("choose").onclick = () =>
  run("Choosing folder…", async () => setRoot(await window.studio.choose()));
$("demo").onclick = () =>
  run("Creating sample files…", async () =>
    setRoot(await window.studio.demo()),
  );
$("open").onclick = () =>
  run("Opening folder…", async () => {
    const error = await window.studio.open();
    $("status").textContent = error || "Opened in Explorer.";
  });
$("scan").onclick = () =>
  run("Analyzing files… Local AI may take a minute per file.", async () => {
    const data = await window.studio.scan({
      ai: document.querySelector("input[value=ai]").checked,
      model: $("model").value.trim(),
    });
    rows = data.rows.map((r) => ({ ...r, checked: true }));
    categories = data.categories;
    valid = true;
    render();
    $("summary").textContent =
      `${rows.length} files ready for review · ${data.skipped} folders or hidden items skipped`;
    $("status").textContent = rows.length
      ? "Review destinations, then organize."
      : "No eligible files found.";
  });
$("apply").onclick = () =>
  run("Organizing files…", async () =>
    result(
      await window.studio.apply(
        selected().map(({ id, category }) => ({ id, category })),
      ),
      "Organized",
    ),
  );
$("undo").onclick = () =>
  run("Restoring files…", async () =>
    result(await window.studio.undo(), "Restored"),
  );
$("select-all").onchange = () => {
  rows.forEach((r) => (r.checked = $("select-all").checked));
  render();
};
document.querySelectorAll("input[name=engine]").forEach(
  (el) =>
    (el.onchange = () => {
      $("ai-note").textContent = document.querySelector("input[value=ai]")
        .checked
        ? "AI uses a local Ollama model: names and up to 6 KB of TXT, MD, CSV or JSON content. Other formats use names only. Falls back to file type if unavailable."
        : "File-type sorting uses extensions. No AI model is running.";
      controls();
    }),
);
