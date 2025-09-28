import mongoose from "mongoose";

const ConnectionConfigSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["postgres", "mongodb", "firebase", "mysql", "neon", "supabase"],
      required: true,
    },
    url: { type: String },
    dbName: { type: String },
    serviceAccount: { type: Object },
    extra: { type: Object },
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String },
    connection: { type: ConnectionConfigSchema, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Project", ProjectSchema);


