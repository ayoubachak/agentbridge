/**
 * JSON Schema utilities for AgentBridge React
 */
import { ComponentDefinition } from '@agentbridge/core';
import { debug, warn } from './debug';
import { ErrorCode, SchemaError } from './errors';

/**
 * Check if a value is a plain object (not an array, null, or built-in objects)
 * @param value Value to check
 * @returns Whether the value is a plain object
 */
export function isPlainObject(value: unknown): value is Record<string, any> {
  return Boolean(
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

/**
 * Get the JSON Schema type for a JavaScript value
 * @param value Value to check
 * @returns JSON Schema type string
 */
export function getJsonSchemaType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  
  const type = typeof value;
  if (type === 'object') return 'object';
  if (type === 'number' && isNaN(value as number)) return 'null';
  
  return type;
}

/**
 * Convert a JavaScript value to a JSON Schema object
 * @param value Value to convert
 * @param options Options for conversion
 * @returns JSON Schema object
 */
export function valueToJsonSchema(value: unknown, options: {
  maxDepth?: number;
  currentDepth?: number;
  addExamples?: boolean;
} = {}): Record<string, any> {
  const { 
    maxDepth = 3, 
    currentDepth = 0,
    addExamples = true
  } = options;
  
  // Handle maximum recursion depth
  if (currentDepth > maxDepth) {
    return { type: getJsonSchemaType(value) };
  }
  
  // Handle different value types
  if (value === null || value === undefined) {
    return { type: 'null' };
  }
  
  if (typeof value === 'boolean') {
    const schema: Record<string, any> = { type: 'boolean' };
    if (addExamples) {
      schema.examples = [value];
    }
    return schema;
  }
  
  if (typeof value === 'number') {
    const schema: Record<string, any> = { type: 'number' };
    if (addExamples) {
      schema.examples = [value];
    }
    return schema;
  }
  
  if (typeof value === 'string') {
    const schema: Record<string, any> = { type: 'string' };
    if (addExamples) {
      schema.examples = [value];
    }
    return schema;
  }
  
  if (Array.isArray(value)) {
    const schema: Record<string, any> = { 
      type: 'array',
      items: {}
    };
    
    if (value.length > 0) {
      // Use first item as example for items type
      schema.items = valueToJsonSchema(value[0], {
        maxDepth,
        currentDepth: currentDepth + 1,
        addExamples
      });
      
      if (addExamples) {
        schema.examples = [value.slice(0, 2)];
      }
    }
    
    return schema;
  }
  
  if (isPlainObject(value)) {
    const schema: Record<string, any> = {
      type: 'object',
      properties: {}
    };
    
    // Convert each property
    for (const [key, propValue] of Object.entries(value)) {
      schema.properties[key] = valueToJsonSchema(propValue, {
        maxDepth,
        currentDepth: currentDepth + 1,
        addExamples
      });
    }
    
    if (Object.keys(value).length > 0) {
      schema.required = Object.keys(value);
    }
    
    if (addExamples) {
      schema.examples = [value];
    }
    
    return schema;
  }
  
  // Default fallback for other types
  return { type: 'string' };
}

/**
 * Ensure an object is compatible with JSON Schema
 * @param obj Object to convert
 * @returns JSON Schema compatible object
 */
export function ensureSchemaCompatible(obj: unknown): Record<string, any> {
  if (!obj) {
    return { type: 'object', properties: {} };
  }
  
  if (isPlainObject(obj)) {
    // Check if it looks like a schema already
    if (obj.type && (obj.properties || obj.items)) {
      return obj;
    }
    
    // Otherwise convert to a schema
    return valueToJsonSchema(obj);
  }
  
  // Handle non-objects
  return valueToJsonSchema(obj);
}

/**
 * Create a Zod-compatible schema wrapper
 * This adds a describe() method to plain schema objects
 * @param schema Plain schema object
 * @returns Schema with describe() method
 */
export function createZodCompatibleSchema(schema: Record<string, any>): any {
  if (!schema) {
    schema = { type: 'object', properties: {} };
  }
  
  // If it already has a describe method (real Zod schema), return as-is
  if (typeof schema.describe === 'function') {
    return schema;
  }
  
  // Create a wrapper with describe method
  return {
    ...schema,
    describe: (description: string) => ({
      ...schema,
      description
    }),
    // Add parse method for compatibility (just passes through)
    parse: (value: any) => value,
    // Add optional method for compatibility
    optional: () => createZodCompatibleSchema({ ...schema, optional: true })
  };
}

/**
 * Process a component definition to ensure schema compatibility
 * @param definition Component definition
 * @returns Processed definition with schema-compatible properties
 */
export function processComponentDefinition(
  definition: Partial<ComponentDefinition>
): ComponentDefinition {
  debug(`Processing component definition: ${definition.id}`);
  
  // Create a deep copy to avoid mutations
  const processedDefinition = { ...definition } as ComponentDefinition;
  
  // Handle properties - convert to Zod-compatible schema
  if (definition.properties) {
    const plainSchema = ensureSchemaCompatible(definition.properties);
    processedDefinition.properties = createZodCompatibleSchema(plainSchema) as any;
  } else {
    // Create empty schema if no properties
    processedDefinition.properties = createZodCompatibleSchema({ 
      type: 'object', 
      properties: {} 
    }) as any;
  }
  
  // Handle actions - convert parameters to Zod-compatible schemas
  if (definition.actions) {
    const processedActions: Record<string, any> = {};
    for (const [actionName, actionDef] of Object.entries(definition.actions)) {
      processedActions[actionName] = {
        ...actionDef,
        parameters: actionDef.parameters ? 
          createZodCompatibleSchema(ensureSchemaCompatible(actionDef.parameters)) : 
          createZodCompatibleSchema({ type: 'object', properties: {} })
      };
    }
    processedDefinition.actions = processedActions as any;
  }
  
  return processedDefinition;
}

/**
 * Validate a value against a JSON Schema
 * @param schema Schema to validate against
 * @param value Value to validate
 * @returns Whether validation passed
 */
export function validateSchema(schema: Record<string, any>, value: unknown): boolean {
  // TODO: Implement JSON Schema validation
  // This is a very basic check, should be replaced with a proper validator
  if (!schema || !isPlainObject(schema)) {
    return false;
  }
  
  if (schema.type === 'object' && !isPlainObject(value)) {
    return false;
  }
  
  if (schema.type === 'array' && !Array.isArray(value)) {
    return false;
  }
  
  return true;
}

/**
 * Validate component properties against a schema
 * @param properties Component properties
 * @param schema Schema to validate against
 * @throws SchemaError if validation fails
 */
export function validateComponentProperties(
  schema: Record<string, any>,
  properties: Record<string, any>
): void {
  if (!validateSchema(schema, properties)) {
    throw new SchemaError(
      'Component properties validation failed',
      ErrorCode.SCHEMA_VALIDATION_FAILED,
      { schema, properties }
    );
  }
}

/**
 * Validate function parameters against a schema
 * @param parameters Function parameters
 * @param schema Schema to validate against
 * @throws SchemaError if validation fails
 */
export function validateFunctionParameters(
  schema: Record<string, any>,
  parameters: unknown
): void {
  if (!validateSchema(schema, parameters)) {
    throw new SchemaError(
      'Function parameters validation failed',
      ErrorCode.SCHEMA_VALIDATION_FAILED,
      { schema, parameters }
    );
  }
} 