import fs from "node:fs/promises";
import path from "node:path";

const root = process.argv[2];
if (!root) throw new Error("Pass the Westbrooke project directory.");

const snapshots = path.join(root, "public", "snapshots");
const manifest = JSON.parse(await fs.readFile(path.join(snapshots, "manifest.json"), "utf8"));
const footer = await fs.readFile(path.join(snapshots, "footer.html"), "utf8");
const prefix = "/westbrookeplacehoa";

const rewriteLinks = (html) => html
  .replaceAll('href="/p/', `href="${prefix}/p/`)
  .replaceAll('href="/"', `href="${prefix}/"`)
  .replace(/href="\/(file|account|payments)\//g, 'href="https://www.westbrookeplacehoa.com/$1/');

for (const item of manifest) {
  const snapshot = await fs.readFile(path.join(snapshots, `${item.key}.html`), "utf8");
  const outputDir = item.route === "/" ? root : path.join(root, item.route.slice(1));
  await fs.mkdir(outputDir, { recursive: true });

  const studioMeta = item.route === "/"
    ? `\n    <meta name="studio:project" content="Westbrooke Place HOA">\n    <meta name="studio:description" content="Authenticated HOA Express staging mirror and CSS design lab.">`
    : "";
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow,noarchive,nosnippet">${studioMeta}
    <title>${item.title.replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</title>
    <link rel="stylesheet" href="https://cdn-common.hoa-express.com/stylesheets/templates/13.css?r=b0d0a21815adea8081e0246f793ec8a7">
    <link rel="stylesheet" href="${prefix}/custom-css/hoa-custom.css">
    <script defer src="${prefix}/local-interactions.js"></script>
  </head>
  <body>
    ${rewriteLinks(snapshot)}
    ${rewriteLinks(footer)}
  </body>
</html>
`;
  await fs.writeFile(path.join(outputDir, "index.html"), html);
}

console.log(`Generated ${manifest.length} static Studio routes.`);
