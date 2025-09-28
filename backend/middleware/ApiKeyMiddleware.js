import User from "../model/UserModel.js";

export const apiKeyMiddleware = async (req, res, next) => {
  try {
    const { apikey } = req.params;
    if (!apikey) return res.status(401).json({ error: "API key missing" });
    // API key stored in user.apiKeys[].key
    const user = await User.findOne({ "apiKeys.key": apikey }).select("_id name email apiKeys");
    if (!user) return res.status(401).json({ error: "Invalid API key" });
    req.apiUser = user;
    next();
  } catch (e) {
    next(e);
  }
};


