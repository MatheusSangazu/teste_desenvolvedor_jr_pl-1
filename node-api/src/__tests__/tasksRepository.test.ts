import fs from "fs";
import path from "path";
import { TasksRepository } from "../repositories/tasksRepository";

const TEST_DATA_DIR = path.resolve(__dirname, "__data_test__");

afterAll(() => {
  if (fs.existsSync(TEST_DATA_DIR)) {
    fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  }
});

describe("TasksRepository", () => {
  let repo: TasksRepository;

  beforeEach(() => {
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
    }
    repo = new TasksRepository(TEST_DATA_DIR);
  });

  it("deve criar uma tarefa com id, text, lang e summary null", () => {
    const task = repo.createTask("Texto teste", "pt");

    expect(task).toHaveProperty("id", 1);
    expect(task.text).toBe("Texto teste");
    expect(task.lang).toBe("pt");
    expect(task.summary).toBeNull();
  });

  it("deve incrementar o id a cada tarefa criada", () => {
    repo.createTask("Texto 1", "pt");
    const task2 = repo.createTask("Texto 2", "en");

    expect(task2.id).toBe(2);
  });

  it("deve atualizar o summary de uma tarefa", () => {
    repo.createTask("Texto teste", "pt");
    const updated = repo.updateTask(1, "Resumo gerado");

    expect(updated).not.toBeNull();
    expect(updated!.summary).toBe("Resumo gerado");
    expect(updated!.id).toBe(1);
  });

  it("deve retornar null ao atualizar tarefa inexistente", () => {
    const result = repo.updateTask(999, "Resumo");

    expect(result).toBeNull();
  });

  it("deve buscar tarefa por id", () => {
    repo.createTask("Texto teste", "pt");
    const found = repo.getTaskById(1);

    expect(found).not.toBeNull();
    expect(found!.id).toBe(1);
    expect(found!.text).toBe("Texto teste");
  });

  it("deve retornar null ao buscar tarefa inexistente", () => {
    const found = repo.getTaskById(999);

    expect(found).toBeNull();
  });

  it("deve listar todas as tarefas", () => {
    repo.createTask("Texto 1", "pt");
    repo.createTask("Texto 2", "en");

    const tasks = repo.getAllTasks();

    expect(tasks).toHaveLength(2);
  });

  it("deve deletar uma tarefa", () => {
    repo.createTask("Texto 1", "pt");
    const deleted = repo.deleteTask(1);

    expect(deleted).not.toBeNull();
    expect(deleted!.id).toBe(1);
    expect(repo.getAllTasks()).toHaveLength(0);
  });

  it("deve retornar null ao deletar tarefa inexistente", () => {
    const result = repo.deleteTask(999);

    expect(result).toBeNull();
  });

  it("deve persistir dados entre instancias do repositorio", () => {
    repo.createTask("Texto persistido", "pt");
    repo.updateTask(1, "Resumo persistido");

    const repo2 = new TasksRepository(TEST_DATA_DIR);
    const tasks = repo2.getAllTasks();

    expect(tasks).toHaveLength(1);
    expect(tasks[0].summary).toBe("Resumo persistido");
  });

  it("deve continuar IDs a partir do ultimo salvo", () => {
    repo.createTask("Texto 1", "pt");
    repo.createTask("Texto 2", "pt");

    const repo2 = new TasksRepository(TEST_DATA_DIR);
    const task3 = repo2.createTask("Texto 3", "en");

    expect(task3.id).toBe(3);
  });
});
