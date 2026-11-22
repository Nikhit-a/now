const request = require("supertest");
const app = require("../server");

describe("API basic checks", () => {
  test("GET / returns running message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.message).toContain("CareerCast API is running!");
  });
});
