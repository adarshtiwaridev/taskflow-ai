import request from "supertest";
import { app } from "../../src/app";

describe("Health Check API", () => {
  it("GET /api/health returns 200 with service health metadata", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("UP");
    expect(res.body.data.service).toBe("TaskFlow AI API");
    expect(res.body.data.dependencies).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
  });

  it("GET /api/health/ready returns 200 readiness probe", async () => {
    const res = await request(app).get("/api/health/ready");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ready).toBe(true);
  });
});

