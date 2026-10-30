import { AITaskBreakdownResponse, AISubtask, TaskPriority } from "@taskflow/shared";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import {
  AIBreakdownRequestInput,
  aiBreakdownResponseSchema,
} from "../validators/ai.validator";
import { BadRequestError } from "../utils/errors";

export class AIService {
  /**
   * Generates intelligent rule-based subtasks when LLM_API_KEY is not configured
   * or when the upstream LLM provider is unavailable/times out.
   */
  private generateHeuristicBreakdown(
    goal: string,
    context?: string,
    maxTasks = 5
  ): AITaskBreakdownResponse {
    logger.info("Generating heuristic AI breakdown for goal:", { goal, maxTasks });

    const lower = goal.toLowerCase();
    const subtasks: AISubtask[] = [];

    if (lower.includes("auth") || lower.includes("login") || lower.includes("user")) {
      subtasks.push(
        {
          title: "Define User schema and credentials model",
          description: "Create Prisma models for User, Sessions, and password hashing salts.",
          priority: "HIGH",
          order: 1,
        },
        {
          title: "Implement registration & login endpoints with JWT",
          description: "Set up bcrypt password verification, access token issuance, and refresh flow.",
          priority: "HIGH",
          order: 2,
        },
        {
          title: "Build client-side Authentication Context and Guard",
          description: "Manage auth tokens securely and protect private routes in React.",
          priority: "MEDIUM",
          order: 3,
        },
        {
          title: "Add rate limiting and brute-force protection",
          description: "Protect auth routes against credential stuffing with Redis rate limiter.",
          priority: "MEDIUM",
          order: 4,
        }
      );
    } else if (lower.includes("deploy") || lower.includes("ci") || lower.includes("docker")) {
      subtasks.push(
        {
          title: "Create multi-stage production Dockerfile",
          description: "Optimize build layers, reduce image size with alpine, and run as non-root user.",
          priority: "HIGH",
          order: 1,
        },
        {
          title: "Configure GitHub Actions CI workflow",
          description: "Automate linting, TypeScript type-checking, Jest tests, and build artifacts.",
          priority: "HIGH",
          order: 2,
        },
        {
          title: "Provision AWS EC2 instance and Docker Compose",
          description: "Set up security groups, deploy containers, and configure auto-restart policies.",
          priority: "HIGH",
          order: 3,
        },
        {
          title: "Configure Nginx reverse proxy with SSL/TLS",
          description: "Set up HTTPS termination, WebSocket upgrade headers, and HTTP/2.",
          priority: "MEDIUM",
          order: 4,
        }
      );
    } else {
      subtasks.push(
        {
          title: `Research requirements for: ${goal}`,
          description: context ? `Context: ${context}` : "Analyze technical feasibility, dependencies, and architecture.",
          priority: "HIGH",
          order: 1,
        },
        {
          title: `Design architecture and data contracts for ${goal}`,
          description: "Draft data models, API endpoints, and interface contracts.",
          priority: "HIGH",
          order: 2,
        },
        {
          title: `Implement core functionality for ${goal}`,
          description: "Write backend controllers, services, and frontend integration.",
          priority: "HIGH",
          order: 3,
        },
        {
          title: `Add automated tests and validation for ${goal}`,
          description: "Write unit and integration tests with Supertest and Jest.",
          priority: "MEDIUM",
          order: 4,
        },
        {
          title: `Conduct code review and prepare for production deployment`,
          description: "Verify error handling, performance metrics, and security checklists.",
          priority: "LOW",
          order: 5,
        }
      );
    }

    return {
      goal,
      subtasks: subtasks.slice(0, maxTasks),
      summary: `AI decomposed "${goal}" into ${Math.min(subtasks.length, maxTasks)} prioritized actionable subtasks.`,
    };
  }

  /**
   * Calls upstream OpenAI-compatible LLM endpoint with structured JSON prompting.
   */
  async breakdownGoal(input: AIBreakdownRequestInput): Promise<AITaskBreakdownResponse> {
    const { goal, context, maxTasks = 5 } = input;

    if (!env.LLM_API_KEY || env.LLM_API_KEY.trim() === "") {
      logger.info("LLM_API_KEY not configured. Falling back to heuristic breakdown engine.");
      return this.generateHeuristicBreakdown(goal, context, maxTasks);
    }

    const systemPrompt = `You are an expert technical project manager and software architect.
Given a user's high-level goal, break it down into ${maxTasks} concrete, actionable, prioritized subtasks.
You MUST respond with valid JSON matching this exact schema:
{
  "goal": string,
  "summary": string,
  "subtasks": [
    {
      "title": string (concise, action-oriented, under 80 chars),
      "description": string (technical guidance, under 200 chars),
      "priority": "LOW" | "MEDIUM" | "HIGH",
      "order": number (1-based index)
    }
  ]
}
Do not include any explanation, markdown backticks, or text outside the JSON object.`;

    const userPrompt = `Goal: "${goal}"${context ? `\nAdditional Context: "${context}"` : ""}\nMax subtasks: ${maxTasks}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      logger.info(`Invoking LLM (${env.LLM_MODEL}) for goal breakdown...`);

      const response = await fetch(`${env.LLM_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.LLM_API_KEY}`,
        },
        body: JSON.stringify({
          model: env.LLM_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`LLM provider returned HTTP ${response.status}: ${errorText}`);
        logger.warn("Falling back to heuristic breakdown engine due to provider error.");
        return this.generateHeuristicBreakdown(goal, context, maxTasks);
      }

      const data = (await response.json()) as any;
      const rawContent = data.choices?.[0]?.message?.content;

      if (!rawContent) {
        throw new BadRequestError("LLM returned empty response");
      }

      const parsedJSON = JSON.parse(rawContent);
      const validated = aiBreakdownResponseSchema.safeParse(parsedJSON);

      if (!validated.success) {
        logger.warn("LLM response failed schema validation, falling back:", validated.error.format());
        return this.generateHeuristicBreakdown(goal, context, maxTasks);
      }

      return validated.data;
    } catch (error) {
      clearTimeout(timeoutId);
      logger.error("Error communicating with LLM provider:", (error as Error).message);
      return this.generateHeuristicBreakdown(goal, context, maxTasks);
    }
  }
}

export const aiService = new AIService();

