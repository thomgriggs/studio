import fs from "node:fs/promises";
import path from "node:path";

const root = process.argv[2];
if (!root) throw new Error("Pass the Westbrooke project directory.");

const snapshots = path.join(root, "public", "snapshots");
const manifest = JSON.parse(await fs.readFile(path.join(snapshots, "manifest.json"), "utf8"));
const prefix = "/westbrookeplacehoa/concept1";

const rewriteLinks = (html) => html
  .replace(/href="\/(file|account|payments)\//g, 'href="https://www.westbrookeplacehoa.com/$1/')
  .replace(/href="\/p\//g, `href="${prefix}/p/`)
  .replace(/href="\/"/g, `href="${prefix}/"`);

for (const item of manifest) {
  const snapshot = await fs.readFile(path.join(snapshots, `${item.key}.html`), "utf8");
  const route = item.path;
  const outputDir = route === "/" ? root : path.join(root, route.slice(1));
  await fs.mkdir(outputDir, { recursive: true });

  const studioMeta = route === "/"
    ? `\n    <meta name="studio:project" content="Westbrooke Place HOA">\n    <meta name="studio:description" content="Authenticated HOA Express staging mirror and CSS design lab.">`
    : "";
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow,noarchive,nosnippet">${studioMeta}
    <title>${item.title.replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</title>
    <link rel="stylesheet" href="https://www.westbrookeplacehoa.com/static/css/main.ce945624.css">
    <link rel="stylesheet" href="${prefix}/custom-css/hoa-custom.css">
    <script defer src="${prefix}/local-interactions.js"></script>
  </head>
  <body>
    ${rewriteLinks(snapshot)}
  </body>
</html>
`;
  await fs.writeFile(path.join(outputDir, "index.html"), html);
}

console.log(`Generated ${manifest.length} current HOA Express routes.`);
