
const express = require("express");
const GeminiClient = require("../geminiClient");
const router = express.Router();

// Vérification de la validité d'une clé Gemini
router.post("/verify-key", async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== "string") {
    return res.status(400).json({ valid: false, error: "Clé API Gemini requise" });
  }
  const client = new GeminiClient(apiKey);
  let responded = false;
  function safeRespond(fn) {
    return (...args) => {
      if (responded) return;
      responded = true;
      fn(...args);
    };
  }
  client.once("response", safeRespond(() => res.json({ valid: true })));
  client.once("error", safeRespond((err) => {
    if (err && (err.code === 401 || (typeof err.message === "string" && err.message.includes("API key not valid")))) {
      return res.status(401).json({ valid: false, error: "Clé API Gemini invalide" });
    }
    res.status(500).json({ valid: false, error: err.message || err });
  }));
  client.once("failed", safeRespond((msg) => res.status(500).json({ valid: false, error: msg })));
  // On envoie un prompt minimal pour tester la clé
  client.generateContent("Test de clé API Gemini.");
});

// POST /api/ai/services
// Body: { query: "Net" }
router.post("/services", async (req, res) => {
  const { query, apiKey } = req.body;
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Champ 'query' requis" });
  }
  // La clé API est facultative, mais si fournie, on la teste
  const client = new GeminiClient(apiKey || "");

  // Prompt pour obtenir des services payants pertinents avec la casse et la ponctuation officielles
  const prompt = `Donne-moi une liste de services payants dont le nom contient ou commence par : '${query}'.
Pour chaque nom de service, respecte exactement la casse et la ponctuation officielles de la marque (par exemple, sPoTiFY doit donner Spotify, DeeZER doit donner Deezer, etc). Réponds uniquement par une liste JSON de noms de services, sans explication ni balises.`;

  let responded = false;
  function safeRespond(fn) {
    return (...args) => {
      if (responded) return;
      responded = true;
      fn(...args);
    };
  }

  client.once("response", safeRespond((data) => {
    // Extraction simple de la liste JSON dans la réponse
    let text = "";
    try {
      text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      // Cherche un tableau JSON dans la réponse
      const match = text.match(/\[.*\]/s);
      if (match) {
        const list = JSON.parse(match[0]);
        return res.json({ services: list });
      }
    } catch (e) {}
    res.status(200).json({ raw: text, error: "Aucune liste trouvée" });
  }));
  client.once("error", safeRespond((err) => {
    // Vérification d'une erreur d'authentification Gemini
    if (err && (err.code === 401 || (typeof err.message === "string" && err.message.includes("API key not valid")))) {
      return res.status(401).json({ error: "Clé API Gemini invalide" });
    }
    res.status(500).json(err);
  }));
  client.once("failed", safeRespond((msg) => res.status(500).json({ error: msg })));

  client.generateContent(prompt);
});

module.exports = router;
