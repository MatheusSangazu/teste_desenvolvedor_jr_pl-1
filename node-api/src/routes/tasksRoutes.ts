import { Router, Request, Response } from "express";
import axios from "axios";
import { TasksRepository } from "../repositories/tasksRepository";

const PYTHON_LLM_URL = process.env.PYTHON_LLM_URL || "http://localhost:5000";

const SUPPORTED_LANGS = ["pt", "en", "es"];

function createTasksRouter(dataDir?: string): Router {
  const router = Router();
  const tasksRepository = new TasksRepository(dataDir);

  router.post("/", async (req: Request, res: Response) => {
    try {
      const { text, lang } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'Campo "text" e obrigatorio.' });
      }
      if (!lang) {
        return res.status(400).json({ error: 'Campo "lang" e obrigatorio.' });
      }
      if (!SUPPORTED_LANGS.includes(lang)) {
        return res.status(400).json({ error: "Language not supported" });
      }

      const task = tasksRepository.createTask(text, lang);

      const response = await axios.post(`${PYTHON_LLM_URL}/summarize`, {
        text,
        lang,
      });

      const summary = response.data.summary;
      tasksRepository.updateTask(task.id, summary);

      return res.status(201).json({
        message: "Tarefa criada com sucesso!",
        task: tasksRepository.getTaskById(task.id),
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro ao criar tarefa:", message);
      return res
        .status(500)
        .json({ error: "Ocorreu um erro ao criar a tarefa." });
    }
  });

  router.get("/", (_req: Request, res: Response) => {
    const tasks = tasksRepository.getAllTasks();
    return res.json(tasks);
  });

  router.get("/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const task = tasksRepository.getTaskById(id);
    if (!task) {
      return res.status(404).json({ error: "Tarefa nao encontrada." });
    }
    return res.json({
      id: task.id,
      text: task.text,
      summary: task.summary,
      lang: task.lang,
    });
  });

  router.delete("/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const deleted = tasksRepository.deleteTask(id);
    if (!deleted) {
      return res.status(404).json({ error: "Tarefa nao encontrada." });
    }
    return res.json({
      message: "Tarefa removida com sucesso!",
      task: deleted,
    });
  });

  return router;
}

export default createTasksRouter();
export { createTasksRouter };
