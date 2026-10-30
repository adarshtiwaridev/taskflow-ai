import request from "supertest";
import { app } from "../../src/app";

describe("Tasks API Integration Tests", () => {
  let createdTaskId: string;

  it("GET /api/tasks returns all tasks", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("POST /api/tasks creates a new valid task", async () => {
    const payload = {
      title: "Write automated Supertest tests",
      description: "Cover all REST API endpoints and validation cases",
      status: "TODO",
      priority: "HIGH",
    };

    const res = await request(app).post("/api/tasks").send(payload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.title).toBe(payload.title);
    expect(res.body.data.status).toBe("TODO");
    expect(res.body.data.priority).toBe("HIGH");

    createdTaskId = res.body.data.id;
  });

  it("POST /api/tasks fails validation when title is empty", async () => {
    const res = await request(app).post("/api/tasks").send({ title: "" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("POST /api/tasks fails validation with invalid priority", async () => {
    const res = await request(app).post("/api/tasks").send({
      title: "Invalid priority task",
      priority: "CRITICAL", // not in enum
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/tasks/:id retrieves the created task", async () => {
    const res = await request(app).get(`/api/tasks/${createdTaskId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdTaskId);
  });

  it("GET /api/tasks/:id returns 404 for nonexistent task", async () => {
    const res = await request(app).get("/api/tasks/nonexistent-id-9999");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("PATCH /api/tasks/:id updates task status to IN_PROGRESS", async () => {
    const res = await request(app).patch(`/api/tasks/${createdTaskId}`).send({
      status: "IN_PROGRESS",
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("IN_PROGRESS");
  });

  it("DELETE /api/tasks/:id removes the task", async () => {
    const res = await request(app).delete(`/api/tasks/${createdTaskId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const checkRes = await request(app).get(`/api/tasks/${createdTaskId}`);
    expect(checkRes.status).toBe(404);
  });

  it("POST /api/tasks/bulk creates multiple tasks in batch", async () => {
    const bulkPayload = {
      tasks: [
        { title: "Subtask 1", priority: "HIGH" },
        { title: "Subtask 2", priority: "MEDIUM" },
        { title: "Subtask 3", priority: "LOW" },
      ],
    };

    const res = await request(app).post("/api/tasks/bulk").send(bulkPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(3);
  });
});

