import { Injectable } from '@nestjs/common';
import * as yaml from 'js-yaml';

export interface ComputedIssue {
  ruleCode: string;
  title: string;
  path: string | null;
  beforeValue: string | null;
  afterValue: string | null;
  severity: 'INFO' | 'WARN' | 'BREAKING';
  isBreaking: boolean;
}

type OpenApiDoc = {
  paths?: Record<string, Record<string, unknown>>;
  components?: {
    schemas?: Record<string, Record<string, unknown>>;
  };
};

@Injectable()
export class DiffEngineService {
  private parseSpec(spec: string): OpenApiDoc {
    const trimmed = spec.trim();

    if (trimmed.startsWith('{')) {
      return JSON.parse(trimmed) as OpenApiDoc;
    }

    return yaml.load(spec) as OpenApiDoc;
  }

  private diffRemovedEndpoints(base: OpenApiDoc, next: OpenApiDoc): ComputedIssue[] {
    const issues: ComputedIssue[] = [];
    const basePaths = base.paths ?? {};
    const nextPaths = next.paths ?? {};

    for (const [path, methods] of Object.entries(basePaths)) {
      if (!nextPaths[path]) {
        issues.push({
          ruleCode: 'endpoint.removed',
          title: `Removed endpoint ${path}`,
          path,
          beforeValue: JSON.stringify(methods),
          afterValue: null,
          severity: 'BREAKING',
          isBreaking: true,
        });
        continue;
      }

      const nextMethods = nextPaths[path] ?? {};
      for (const method of Object.keys(methods)) {
        if (!nextMethods[method]) {
          issues.push({
            ruleCode: 'endpoint.removed',
            title: `Removed method ${method.toUpperCase()} ${path}`,
            path: `${method.toUpperCase()} ${path}`,
            beforeValue: 'present',
            afterValue: 'missing',
            severity: 'BREAKING',
            isBreaking: true,
          });
        }
      }
    }

    return issues;
  }

  private diffSchemas(base: OpenApiDoc, next: OpenApiDoc): ComputedIssue[] {
    const issues: ComputedIssue[] = [];
    const baseSchemas = base.components?.schemas ?? {};
    const nextSchemas = next.components?.schemas ?? {};

    for (const [schemaName, baseSchema] of Object.entries(baseSchemas)) {
      const nextSchema = nextSchemas[schemaName];
      if (!nextSchema) {
        continue;
      }

      const baseRequired = (baseSchema.required as string[] | undefined) ?? [];
      const nextRequired = (nextSchema.required as string[] | undefined) ?? [];

      for (const field of nextRequired) {
        if (!baseRequired.includes(field)) {
          issues.push({
            ruleCode: 'schema.required_added',
            title: `Added required field ${schemaName}.${field}`,
            path: `${schemaName}.${field}`,
            beforeValue: 'optional',
            afterValue: 'required',
            severity: 'BREAKING',
            isBreaking: true,
          });
        }
      }

      const baseProperties = (baseSchema.properties as Record<string, unknown> | undefined) ?? {};
      const nextProperties = (nextSchema.properties as Record<string, unknown> | undefined) ?? {};

      for (const [propertyName, baseProperty] of Object.entries(baseProperties)) {
        const nextProperty = nextProperties[propertyName] as
          | { type?: string; enum?: unknown[] }
          | undefined;

        if (!nextProperty) {
          continue;
        }

        const baseType = (baseProperty as { type?: string }).type;
        const nextType = nextProperty.type;
        if (baseType && nextType && baseType !== nextType) {
          issues.push({
            ruleCode: 'schema.type_changed',
            title: `Type changed for ${schemaName}.${propertyName}`,
            path: `${schemaName}.${propertyName}`,
            beforeValue: baseType,
            afterValue: nextType,
            severity: 'BREAKING',
            isBreaking: true,
          });
        }

        const baseEnum = ((baseProperty as { enum?: unknown[] }).enum ?? []).map(String);
        const nextEnum = (nextProperty.enum ?? []).map(String);

        if (baseEnum.length > 0 && nextEnum.length > 0) {
          const isNarrowed = baseEnum.some((value) => !nextEnum.includes(value));
          if (isNarrowed) {
            issues.push({
              ruleCode: 'schema.enum_narrowed',
              title: `Enum narrowed for ${schemaName}.${propertyName}`,
              path: `${schemaName}.${propertyName}`,
              beforeValue: baseEnum.join(', '),
              afterValue: nextEnum.join(', '),
              severity: 'BREAKING',
              isBreaking: true,
            });
          }
        }
      }
    }

    return issues;
  }

  computeDiff(baselineSpec: string, candidateSpec: string): ComputedIssue[] {
    const baseline = this.parseSpec(baselineSpec);
    const candidate = this.parseSpec(candidateSpec);

    return [
      ...this.diffRemovedEndpoints(baseline, candidate),
      ...this.diffSchemas(baseline, candidate),
    ];
  }
}
