const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit'); // Pour limiter les requêtes
const bouncer = require('express-bouncer')(5000, 900000, 3); // Pour bannir après 3 échecs
const app = express();
const port = 5500;

const SECRET_KEY = 'votre_clé_secrète';

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Simuler une base de données en mémoire
let users = [
  { id: 1, name: 'John Doe', password: 'password123' },
  { id: 2, name: 'Jane Doe', password: 'mypassword' },
];

// 1. Middleware pour limiter les requêtes (Rate Limiting)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 10, //
  message: 'Trop de requêtes créées à partir de cette IP !'
});
app.use('/api/', apiLimiter); // Appliquer la limite sur toutes les routes /api

// 2. Middleware de protection contre le bruteforce sur le login
bouncer.whitelist.push('127.0.0.1'); // Ajout d'une IP sur la liste blanche (par ex. localhost)
bouncer.blocked = function (req, res, next, remaining) {
  res.status(429).json({ message: `Vous avez été bloqué temporairement à cause de tentatives échouées !`});
};

// Fonction pour générer un token
const generateToken = (user) => {
  return jwt.sign({ id: user.id, name: user.name }, SECRET_KEY, { expiresIn: '1h' });
};

// Endpoint pour l'authentification
app.post('/api/login', bouncer.block, (req, res) => { // Ajout de protection contre le bruteforce
  const { name, password } = req.body;
  const user = users.find(u => u.name === name);

  if (user && user.password === password) {
    bouncer.reset(req); // Réinitialiser le compteur d'échecs en cas de succès
    const token = generateToken(user);
    return res.status(200).json({ token });
  }

  res.status(401).json({ message: 'Nom d’utilisateur ou mot de passe incorrect' });
});

// Middleware pour vérifier le token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes CRUD (protégées)
app.get('/api/users', authenticateToken, (req, res) => {
  res.status(200).json(users);
});

app.get('/api/users/:id', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: 'Utilisateur non trouvé' });
  }
});

app.post('/api/users', authenticateToken, (req, res) => {
  const newUser = {
    id: users.length + 1,
    name: req.body.name,
    password: req.body.password,
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.put('/api/users/:id', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].name = req.body.name;
    if (req.body.password) {
      users[userIndex].password = req.body.password;
    }
    res.status(200).json(users[userIndex]);
  } else {
    res.status(404).json({ message: 'Utilisateur non trouvé' });
  }
});

app.delete('/api/users/:id', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users.splice(userIndex, 1);
    res.status(200).json({ message: 'Utilisateur supprimé' });
  } else {
    res.status(404).json({ message: 'Utilisateur non trouvé' });
  }
});

// Nouvelle route pour la page d'accueil
app.get('/', (req, res) => {
  res.status(200).json({ message: "Vous êtes sur la page d'accueil de l'API" });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur API démarré sur http://localhost:${port}`);
});

