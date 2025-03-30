# Type System

AgentBridge uses a robust type system to define and validate function parameters, return values, and component properties. The type system is based on JSON Schema and ensures type safety across framework boundaries.

## Overview

The type system provides:

- Runtime validation of function parameters and return values
- Self-documentation for AI agents to understand available functionalities
- Consistent data shapes across framework boundaries
- Clear error messages when validation fails

## JSON Schema Foundation

AgentBridge's type system uses [JSON Schema](https://json-schema.org/) as its foundation, which provides a vocabulary to validate JSON documents.

### Basic Types

JSON Schema supports several primitive types:

```typescript
// String
{ type: 'string' }

// Number
{ type: 'number' }

// Integer
{ type: 'integer' }

// Boolean
{ type: 'boolean' }

// Null
{ type: 'null' }

// Object
{ type: 'object' }

// Array
{ type: 'array' }
```

### Type Composition

You can combine types to create more complex definitions:

```typescript
// Example of a complex schema
const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    age: { type: 'number', minimum: 0 },
    email: { type: 'string', format: 'email' },
    isActive: { type: 'boolean' },
    tags: { 
      type: 'array', 
      items: { type: 'string' } 
    },
    address: {
      type: 'object',
      properties: {
        street: { type: 'string' },
        city: { type: 'string' },
        zipCode: { type: 'string' }
      },
      required: ['street', 'city']
    }
  },
  required: ['id', 'name', 'email']
};
```

## Type System in AgentBridge

### Function Parameter Types

When registering a function, you define the parameter schema:

```typescript
bridge.registerFunction({
  name: 'createUser',
  description: 'Create a new user',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      age: { type: 'number', minimum: 18 }
    },
    required: ['name', 'email']
  },
  handler: async (params) => {
    // Implementation
    return { success: true };
  }
});
```

### Return Value Types

You can also define the expected return value schema:

```typescript
bridge.registerFunction({
  name: 'getUserDetails',
  description: 'Get user details by ID',
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string' }
    },
    required: ['userId']
  },
  returnSchema: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      email: { type: 'string' },
      age: { type: 'number' },
      createdAt: { type: 'string', format: 'date-time' }
    },
    required: ['id', 'name', 'email']
  },
  handler: async (params) => {
    // Implementation
    return {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      createdAt: '2023-01-15T12:00:00Z'
    };
  }
});
```

### Component Property Types

Component properties are also typed:

```typescript
// React example
useAgentComponent('my-button', {
  type: 'button',
  properties: {
    label: { type: 'string' },
    disabled: { type: 'boolean' },
    variant: { 
      type: 'string', 
      enum: ['primary', 'secondary', 'danger'] 
    }
  },
  actions: {
    click: () => {
      // Handle click
      return true;
    }
  }
});
```

## Advanced Type Features

### String Formats

String formats provide additional validation for string values:

```typescript
// Email format
{ type: 'string', format: 'email' }

// Date-time format (ISO 8601)
{ type: 'string', format: 'date-time' }

// Date format
{ type: 'string', format: 'date' }

// Time format
{ type: 'string', format: 'time' }

// URI format
{ type: 'string', format: 'uri' }

// UUID format
{ type: 'string', format: 'uuid' }
```

### Number Constraints

Number values can have additional constraints:

```typescript
// Minimum value
{ type: 'number', minimum: 0 }

// Maximum value
{ type: 'number', maximum: 100 }

// Exclusive minimum
{ type: 'number', exclusiveMinimum: 0 }

// Exclusive maximum
{ type: 'number', exclusiveMaximum: 100 }

// Multiple of
{ type: 'number', multipleOf: 5 }
```

### String Constraints

String values can have length constraints:

```typescript
// Minimum length
{ type: 'string', minLength: 3 }

// Maximum length
{ type: 'string', maxLength: 50 }

// Pattern (regular expression)
{ type: 'string', pattern: '^[a-zA-Z0-9]+$' }
```

### Array Constraints

Array values can have additional constraints:

```typescript
// Minimum items
{ type: 'array', minItems: 1 }

// Maximum items
{ type: 'array', maxItems: 10 }

// Unique items
{ type: 'array', uniqueItems: true }

// Array with specific item types
{ 
  type: 'array', 
  items: { type: 'string' } 
}

// Array with tuple typing
{ 
  type: 'array',
  items: [
    { type: 'string' },
    { type: 'number' },
    { type: 'boolean' }
  ],
  minItems: 3,
  maxItems: 3
}
```

### Object Constraints

Object values can have property constraints:

```typescript
// Required properties
{ 
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' }
  },
  required: ['name', 'email']
}

// Property dependencies
{
  type: 'object',
  properties: {
    credit_card: { type: 'string' },
    billing_address: { type: 'string' }
  },
  dependencies: {
    credit_card: ['billing_address']
  }
}
```

### Conditional Schemas

You can define schemas with conditional validation:

```typescript
// If-then-else
{
  type: 'object',
  properties: {
    paymentMethod: { type: 'string' },
    creditCardNumber: { type: 'string' },
    bankAccountNumber: { type: 'string' }
  },
  required: ['paymentMethod'],
  if: {
    properties: { paymentMethod: { enum: ['credit_card'] } }
  },
  then: {
    required: ['creditCardNumber']
  },
  else: {
    required: ['bankAccountNumber']
  }
}
```

## Error Handling

When validation fails, AgentBridge provides detailed error information:

```typescript
try {
  const result = await bridge.callFunction('createUser', {
    name: 'John', // Missing required email
    age: 15 // Below minimum age
  });
} catch (error) {
  // error.message contains validation error details
  console.error(error.message);
  // Error: Validation failed:
  // - Missing required property 'email'
  // - Property 'age' must be >= 18
}
```

### Custom Error Messages

You can provide custom error messages for specific validations:

```typescript
{
  type: 'object',
  properties: {
    email: { 
      type: 'string', 
      format: 'email',
      errorMessage: 'Please provide a valid email address'
    },
    age: { 
      type: 'number', 
      minimum: 18,
      errorMessage: 'You must be at least 18 years old'
    }
  }
}
```

## Integration with TypeScript

AgentBridge's type system integrates well with TypeScript, providing type safety at both compile time and runtime:

```typescript
// Define type using TypeScript
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

// Define schema using JSON Schema
const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    age: { type: 'number', minimum: 0 }
  },
  required: ['id', 'name', 'email']
};

// Use both together
bridge.registerFunction<User>({
  name: 'getUser',
  description: 'Get user details',
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string' }
    },
    required: ['userId']
  },
  returnSchema: userSchema,
  handler: async (params): Promise<User> => {
    // Implementation with TypeScript type checking
    return {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    };
  }
});
```

## Best Practices

### Keep Schemas Simple

Focus on essential validations rather than overly complex schemas:

```typescript
// Good - focused validation
{
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8 }
  },
  required: ['email', 'password']
}

// Avoid - overly complex
{
  type: 'object',
  properties: {
    email: { 
      type: 'string', 
      format: 'email',
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
    },
    password: { 
      type: 'string', 
      minLength: 8,
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
    }
  },
  required: ['email', 'password']
}
```

### Reuse Common Schemas

Extract and reuse common schema definitions:

```typescript
// Define common schemas
const emailSchema = { type: 'string', format: 'email' };
const addressSchema = {
  type: 'object',
  properties: {
    street: { type: 'string' },
    city: { type: 'string' },
    zipCode: { type: 'string' }
  },
  required: ['street', 'city']
};

// Use in multiple function definitions
bridge.registerFunction({
  name: 'createUser',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: emailSchema,
      address: addressSchema
    },
    required: ['name', 'email']
  },
  // ...
});
```

### Balance Validation Layers

Consider where validation should happen:

1. **Schema validation** - For structural validation
2. **Function handlers** - For business logic validation
3. **UI components** - For immediate user feedback

## Schema Reference

### Common Parameter Schemas

Here are some commonly used parameter schemas:

```typescript
// Pagination parameters
const paginationSchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
  }
};

// Search parameters
const searchSchema = {
  type: 'object',
  properties: {
    query: { type: 'string' },
    filters: { 
      type: 'object',
      additionalProperties: true 
    },
    sort: { 
      type: 'object',
      properties: {
        field: { type: 'string' },
        direction: { type: 'string', enum: ['asc', 'desc'] }
      }
    }
  },
  required: ['query']
};

// ID parameter
const idSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' }
  },
  required: ['id']
};
```

## Next Steps

- Learn more about the [Function Registry](function-registry.md) for registering typed functions
- Explore the [Component Registry](component-registry.md) for typed UI components
- See the [API Reference](api-reference.md) for detailed documentation
