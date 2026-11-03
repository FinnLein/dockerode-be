import { Injectable } from '@nestjs/common';
import { LanguageRunner } from '../types';
import { nodeTemplate } from './template';

@Injectable()
export class NodeRunner implements LanguageRunner {
  private readonly imageName = 'node:24-alpine';

  getImageName(): string {
    return this.imageName;
  }

  getFileName(): string {
    return 'index.js';
  }

  getDockerfile(): string {
    return `
			FROM ${this.imageName}
			WORKDIR /app
			COPY index.js . 
			USER node
			CMD ["node", "/app/index.js"]
		`;
  }

  wrapCode(code: string, testCases: unknown[]): string {
    const template = nodeTemplate;
    const serialized = JSON.stringify(testCases);

    return template
      .replace('__USER_CODE__', code)
      .replace('__TEST_CASES__', serialized);
  }

  parseResult(stdout: string): unknown {
    const marker = '__RESULTS_MARKER__';
    const markerIndex = stdout.lastIndexOf(marker);

    if (markerIndex === -1) {
      return { error: 'No results marker found', stdout };
    }

    const jsonPart = stdout.slice(markerIndex + marker.length).trim();

    try {
      return JSON.parse(jsonPart);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        error: `Failed to parse results. ${errorMessage}`,
        raw: jsonPart,
      };
    }
  }
}
