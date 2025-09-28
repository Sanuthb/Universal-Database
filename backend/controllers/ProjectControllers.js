import Project from "../model/ProjectModel.js";

export const createProject = async (req, res) => {
  try {
    const { name, description, connection } = req.body;
    if (!name || !connection || !connection.type) {
      return res.status(400).json({ message: "Project name and connection.type are required" });
    }

    const project = await Project.create({
      owner: req.user.id,
      name,
      description,
      connection,
    });

    res.status(201).json({ success: true, project });
  } catch (err) {
    console.error("Create Project Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const listProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, projects });
  } catch (err) {
    console.error("List Projects Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user.id });
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    res.status(200).json({ success: true, project });
  } catch (err) {
    console.error("Get Project Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    res.status(200).json({ success: true, message: "Project deleted" });
  } catch (err) {
    console.error("Delete Project Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


