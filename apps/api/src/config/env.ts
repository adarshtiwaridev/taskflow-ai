import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  API_PORT: z.coerce.number().optional(),
  WEB_URL: z.string().default("http://localhost:5173"),
  CORS_ORIGIN: z.string().optional(),
  DATABASE_URL: z
    .string()
    .default("postgresql://taskflow:taskflow_dev_password@localhost:5432/taskflow?schema=public"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  JWT_SECRET: z.string().default("taskflow_dev_super_secret_key_minimum_32_characters_long"),
  LLM_API_KEY: z.string().optional().default(""),
  LLM_MODEL: z.string().optional().default("gpt-4o-mini"),
  LLM_BASE_URL: z.string().optional().default("https://api.openai.com/v1"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.format());
  throw new Error("Invalid environment variables");
}

export const env = {
  ...parsed.data,
  PORT: parsed.data.API_PORT || parsed.data.PORT,
  IS_PROD: parsed.data.NODE_ENV === "production",
  IS_TEST: parsed.data.NODE_ENV === "test",
};

