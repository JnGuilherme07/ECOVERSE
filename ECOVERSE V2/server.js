// server.js (ESM)
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// pasta pública (serve CSS, JS, imagens, etc)
app.use(express.static(__dirname));

// rota da página inicial
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// rota da página de projeto
app.get("/projeto", (req, res) => {
  res.sendFile(path.join(__dirname, "projeto.html"));
});

// rota 404
app.use((req, res) => {
  res.status(404).send("Página não encontrada");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
