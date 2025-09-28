// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    apiKeys: [
      {
        key: { type: String, required: true },
        label: { type: String, default: "default" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    connections: [
      {
        name: { type: String, required: true }, 
        type: {
          type: String,
          enum: ["postgres", "neon", "supabase", "mongodb", "firebase"],
          required: true,
        },
        url: { type: String }, 
        serviceAccount: { type: Object }, 
        dbName: { type: String }, 
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
