import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CUSTOM_VIEWS = "/data/custom";
const BUILTIN_VIEWS = path.join(__dirname, "views", "built-in");

const app = express();

app.set("views", [CUSTOM_VIEWS, BUILTIN_VIEWS]);
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", path.join(__dirname, "views", "layout.ejs"));

app.get("/:status", (req, res) => {
  const status = req.params.status;
  const host = req.headers["x-original-host"];
  
  const candidates = [
    path.join(CUSTOM_VIEWS, "default", `${status}.ejs`),
    path.join(BUILTIN_VIEWS, `${status}.ejs`)
  ];

  if (host) {
    candidates.unshift(
      path.join(CUSTOM_VIEWS, host, `${status}.ejs`)
    );
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const relPath = path.relative(app.get("views")[0], candidate);
      return res.status(Number(status)).render(relPath, {
        status,
        host: host || 'this service',
        timestamp: new Date().toISOString()
      });
    }
  }

  res.status(404).send("No error page template found.");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Cute Error Server running on port ${PORT}`);
});
