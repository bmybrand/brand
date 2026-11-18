const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "_next", "static", "chunks");
let n = 0;

for (const name of fs.readdirSync(dir)) {
  if (!name.endsWith(".js")) continue;
  const p = path.join(dir, name);
  let t = fs.readFileSync(p, "utf8");
  const before = t;

  t = t.replace(/unoptimized:!1/g, "unoptimized:!0");

  // Replace default next/image loader return with raw src
  t = t.replace(
    /return`\$\{e\.path\}\?url=\$\{encodeURIComponent\(t\)\}&w=\$\{[a-z]\}&q=\$\{[a-z]\}\$\{t\.startsWith\("\/"\)&&[a-z]\?`&dpl=\$\{[a-z]\}`:""\}`/g,
    "return t"
  );

  if (t !== before) {
    fs.writeFileSync(p, t);
    n++;
    console.log("patched", name);
  }
}

console.log("patched files", n);
