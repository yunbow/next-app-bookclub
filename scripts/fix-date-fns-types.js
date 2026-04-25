/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Workaround for date-fns v4 missing .d.ts files.
 * date-fns v4 ships .d.cts but not .d.ts for some modules,
 * which breaks TypeScript with moduleResolution: "bundler".
 * This script copies .d.cts → .d.ts where the .d.ts is missing.
 */
const fs = require("fs");
const path = require("path");

const dateFnsDir = path.join(__dirname, "..", "node_modules", "date-fns");

function fixDir(dir) {
  if (!fs.existsSync(dir)) return;
  let count = 0;
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      count += fixDir(fullPath);
    } else if (file.endsWith(".d.cts")) {
      const dtsPath = fullPath.replace(/\.d\.cts$/, ".d.ts");
      if (!fs.existsSync(dtsPath)) {
        fs.copyFileSync(fullPath, dtsPath);
        count++;
      }
    }
  }
  return count;
}

const fixed = fixDir(dateFnsDir);
if (fixed > 0) {
  console.log(`fix-date-fns-types: created ${fixed} missing .d.ts files`);
}
