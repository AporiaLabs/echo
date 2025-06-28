import { Agent, Character, Route } from "../types";
export declare class BaseAgent implements Agent {
    private character;
    private routes;
    constructor(character: Character);
    private getRandomElements;
    private formatMessageExamples;
    getAgentId(): string;
    getSystemPrompt(): string;
    addRoute(route: Route): void;
    getAgentContext(): string;
    getRoutes(): Route[];
}
