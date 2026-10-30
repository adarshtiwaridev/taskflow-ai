import request from "supertest";
import { app } from "../../src/app";

describe("AI Task Breakdown API Integration Tests", () => {
  it("POST /api/ai/breakdown decomposes a goal into structured subtasks", async () => {
    const res = await request(app).post("/api/ai/breakdown").send({
      goal: "Implement user authentication with JWT and refresh tokens",
      maxTasks: 4,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.goal).toBe("Implement user authentication with JWT and refresh tokens");
    expect(Array.isArray(res.body.data.subtasks)).toBe(true);
    expect(res.body.data.subtasks.length).toBeLessThanOrEqual(4);

    const first = res.body.data.subtasks[0];
    expect(first.title).toBeDefined();
    expect(first.priority).toMatch(/LOW|MEDIUM|HIGH/);
    expect(first.order).toBeGreaterThanOrEqual(1);
  });

  it("POST /api/ai/breakdown fails validation on short goal prompts", async () => {
    const res = await request(app).post("/api/ai/breakdown").send({
      goal: "hi", // under 3 chars
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

