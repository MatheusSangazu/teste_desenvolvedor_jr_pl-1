import fs from "fs";
import path from "path";

const DEFAULT_DATA_DIR = path.resolve(__dirname, "../../data");

interface Task {
  id: number;
  text: string;
  summary: string | null;
  lang: string;
}

export class TasksRepository {
  private dataFile: string;
  private currentId: number = 1;

  constructor(dataDir?: string) {
    const dir = dataDir || DEFAULT_DATA_DIR;
    this.dataFile = path.join(dir, "tasks.json");

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.dataFile)) {
      fs.writeFileSync(this.dataFile, "[]", "utf-8");
    } else {
      const tasks = this.readTasks();
      if (tasks.length > 0) {
        this.currentId = Math.max(...tasks.map(t => t.id)) + 1;
      }
    }
  }

  private readTasks(): Task[] {
    const data = fs.readFileSync(this.dataFile, "utf-8");
    return JSON.parse(data) as Task[];
  }

  private writeTasks(tasks: Task[]): void {
    fs.writeFileSync(this.dataFile, JSON.stringify(tasks, null, 2), "utf-8");
  }

  createTask(text: string, lang: string): Task {
    const tasks = this.readTasks();
    const task: Task = {
      id: this.currentId++,
      text,
      summary: null,
      lang,
    };
    tasks.push(task);
    this.writeTasks(tasks);
    return task;
  }

  updateTask(id: number, summary: string): Task | null {
    const tasks = this.readTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
      tasks[taskIndex].summary = summary;
      this.writeTasks(tasks);
      return tasks[taskIndex];
    }
    return null;
  }

  getTaskById(id: number): Task | null {
    const tasks = this.readTasks();
    return tasks.find(t => t.id === id) || null;
  }

  getAllTasks(): Task[] {
    return this.readTasks();
  }

  deleteTask(id: number): Task | null {
    const tasks = this.readTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
      const [deleted] = tasks.splice(taskIndex, 1);
      this.writeTasks(tasks);
      return deleted;
    }
    return null;
  }
}
