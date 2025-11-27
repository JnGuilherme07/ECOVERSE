import express from "express";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import session from "express-session";
import MongoStore from "connect-mongo";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// -------------------- CONEXÃO MONGODB --------------------
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log("Erro Mongo:", err));

// -------------------- MODEL USER --------------------
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  favorites: [String]
});


const User = mongoose.model("User", UserSchema);

// -------------------- MIDDLEWARES --------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
    }),
    cookie: { maxAge: 1000 * 60 * 60 }, // 1h
  })
);

app.use(express.static(__dirname));

// -------------------- PROTEGER ROTAS --------------------
function auth(req, res, next) {
  if (req.session.userId) return next();
  res.redirect("/cadastro");
}

// -------------------- ROTAS --------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/cadastro", (req, res) => {
  res.sendFile(path.join(__dirname, "cadastro.html"));
});

// ---------- REGISTRO ----------
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = new User({ username, password: hashed });

  await user.save();

  res.redirect("/cadastro");
});

// ---------- LOGIN ----------
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) return res.send("Usuário não existe.");

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) return res.send("Senha errada.");

  req.session.userId = user._id;

  res.redirect("/projeto");
});

// ---------- LOGOUT ----------
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/cadastro");
  });
});

// ---------- ROTA PROTEGIDA ----------
app.get("/projeto", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "projeto.html"));
});


// ---------- FAVORITOS ----------

// Salvar favorito
app.post("/favorite", auth, async (req, res) => {
  const { place } = req.body;
  const user = await User.findById(req.session.userId);

  if (!user.favorites.includes(place)) {
    user.favorites.push(place);
    await user.save();
  }

  res.json({ ok: true });
});

// Listar favoritos
app.get("/favorites", auth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.json(user.favorites);
});



// 404
app.use((req, res) => {
  res.status(404).send("Página não encontrada");
});

// Start server
app.listen(PORT, () => {
  console.log(`Rodando: http://localhost:${PORT}`);
});
