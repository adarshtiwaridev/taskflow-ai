module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  testTimeout: 15000,
  collectCoverageFrom: ["src/**/*.ts", "!src/server.ts"],
};
