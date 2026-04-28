import fs from "fs";
import path from "path";

jest.mock("axios");
import axios from "axios";
import request from "supertest";
import { createApp } from "../app";

const mockedAxios = axios as jest.Mocked<typeof axios>;

const TEST_DATA_DIR = path.resolve(__dirname, "__data_routes_test__");

beforeAll(() => {
  process.env.PYTHON_LLM_URL = "http://localhost:5000";
});

beforeEach(() => {
  if (fs.existsSync(TEST_DATA_DIR)) {
    fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  }
  mockedAxios.post.mockReset();
});

afterAll(() => {
  if (fs.existsSync(TEST_DATA_DIR)) {
    fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  }
});

describe("GET /", () => {
  it("deve retornar { message: 'API is running' }", async () => {
    const res = await request(createApp(TEST_DATA_DIR)).get("/");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "API is running" });
  });
});

describe("POST /tasks", () => {
  it("deve criar tarefa com sucesso e retornar 201", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { summary: "Resumo gerado pelo LLM" },
    });

    const res = await request(createApp(TEST_DATA_DIR)).post("/tasks").send({
      text: "Texto de teste",
      lang: "pt",
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Tarefa criada com sucesso!");
    expect(res.body.task).toHaveProperty("id", 1);
    expect(res.body.task.text).toBe("Texto de teste");
    expect(res.body.task.lang).toBe("pt");
    expect(res.body.task.summary).toBe("Resumo gerado pelo LLM");
  });

  it("deve retornar 400 se text nao for enviado", async () => {
    const res = await request(createApp(TEST_DATA_DIR))
      .post("/tasks")
      .send({ lang: "pt" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/text/);
  });

  it("deve retornar 400 se lang nao for enviado", async () => {
    const res = await request(createApp(TEST_DATA_DIR))
      .post("/tasks")
      .send({ text: "Texto" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/lang/);
  });

  it("deve retornar 400 se lang nao for suportado", async () => {
    const res = await request(createApp(TEST_DATA_DIR))
      .post("/tasks")
      .send({ text: "Texto", lang: "fr" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Language not supported");
  });

  it("deve retornar 500 se o servico Python falhar", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Connection refused"));

    const res = await request(createApp(TEST_DATA_DIR))
      .post("/tasks")
      .send({ text: "Texto", lang: "pt" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Ocorreu um erro ao criar a tarefa.");
  });
});

describe("GET /tasks", () => {
  it("deve listar todas as tarefas", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { summary: "Resumo" },
    });

    const app = createApp(TEST_DATA_DIR);
    await request(app).post("/tasks").send({ text: "Texto 1", lang: "pt" });
    await request(app).post("/tasks").send({ text: "Texto 2", lang: "en" });

    const res = await request(app).get("/tasks");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("deve retornar array vazio se nao houver tarefas", async () => {
    const res = await request(createApp(TEST_DATA_DIR)).get("/tasks");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});

describe("GET /tasks/:id", () => {
  it("deve retornar tarefa por id", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { summary: "Resumo" },
    });

    const app = createApp(TEST_DATA_DIR);
    await request(app).post("/tasks").send({ text: "Texto", lang: "pt" });

    const res = await request(app).get("/tasks/1");

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.text).toBe("Texto");
    expect(res.body.lang).toBe("pt");
    expect(res.body.summary).toBe("Resumo");
  });

  it("deve retornar 404 para id inexistente", async () => {
    const res = await request(createApp(TEST_DATA_DIR)).get("/tasks/999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Tarefa nao encontrada.");
  });
});

describe("DELETE /tasks/:id", () => {
  it("deve remover tarefa e retornar 200", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { summary: "Resumo" },
    });

    const app = createApp(TEST_DATA_DIR);
    await request(app).post("/tasks").send({ text: "Texto", lang: "pt" });

    const res = await request(app).delete("/tasks/1");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Tarefa removida com sucesso!");
    expect(res.body.task.id).toBe(1);
  });

  it("deve retornar 404 para id inexistente", async () => {
    const res = await request(createApp(TEST_DATA_DIR)).delete("/tasks/999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Tarefa nao encontrada.");
  });

  it("deve confirmar que tarefa foi removida", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { summary: "Resumo" },
    });

    const app = createApp(TEST_DATA_DIR);
    await request(app).post("/tasks").send({ text: "Texto", lang: "pt" });
    await request(app).delete("/tasks/1");

    const res = await request(app).get("/tasks/1");

    expect(res.status).toBe(404);
  });
});
