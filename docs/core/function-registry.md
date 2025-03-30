# Function Registry

The Function Registry is a core component of AgentBridge that allows you to expose application functionality to AI agents. Functions registered with AgentBridge can be discovered and called by AI agents, enabling them to perform actions within your application.

## Overview

The function registry manages:

- Registration of functions with metadata and validation
- Discovery of available functions by AI agents
- Execution of functions with proper validation and error handling
- Type checking for parameters and return values

## Registering Functions

### Basic Registration

Functions can be registered with the AgentBridge instance:

```typescript
import { AgentBridge } from '@agentbridge/core';

const bridge = new AgentBridge({
  applicationId: 'my-app',
  environmentId: 'development'
});

// Register a function
bridge.registerFunction({
  name: 'greet',
  description: 'Greet a user by name',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string' }
    },
    required: ['name']
  },
  handler: async (params) => {
    const { name } = params;
    return { message: `Hello, ${name}!` };
  }
});
```

### With Framework SDKs

Each framework SDK provides its own way to register functions:

#### React

```jsx
import { useAgentFunction } from '@agentbridge/react';

function WeatherWidget() {
  useAgentFunction({
    name: 'getWeather',
    description: 'Get weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: { type: 'string' },
        units: { type: 'string', enum: ['metric', 'imperial'] }
      },
      required: ['location']
    },
    handler: async (params) => {
      // Implementation
      return { temperature: 22, conditions: 'sunny' };
    }
  });
  
  return (
    <div>Weather Widget</div>
  );
}
```

#### Angular

```typescript
import { Component, OnInit } from '@angular/core';
import { AgentBridgeService } from '@agentbridge/angular';

@Component({
  selector: 'app-weather',
  template: '<div>Weather Widget</div>'
})
export class WeatherComponent implements OnInit {
  constructor(private agentBridge: AgentBridgeService) {}

  ngOnInit() {
    this.agentBridge.registerFunction({
      name: 'getWeather',
      description: 'Get weather for a location',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string' },
          units: { type: 'string', enum: ['metric', 'imperial'] }
        },
        required: ['location']
      },
      handler: async (params) => {
        // Implementation
        return { temperature: 22, conditions: 'sunny' };
      }
    });
  }
}
```

## Function Definition

A function definition consists of:

- **name**: A unique identifier for the function
- **description**: A human-readable description of what the function does
- **parameters**: A JSON Schema object defining the expected parameters
- **handler**: The implementation function that will be called
- **tags** (optional): Tags for categorizing and filtering functions
- **returnSchema** (optional): A JSON Schema defining the expected return value

### Example with Return Schema

```typescript
bridge.registerFunction({
  name: 'calculateTax',
  description: 'Calculate tax for an amount',
  parameters: {
    type: 'object',
    properties: {
      amount: { type: 'number' },
      taxRate: { type: 'number' }
    },
    required: ['amount', 'taxRate']
  },
  returnSchema: {
    type: 'object',
    properties: {
      tax: { type: 'number' },
      total: { type: 'number' }
    },
    required: ['tax', 'total']
  },
  handler: async (params) => {
    const { amount, taxRate } = params;
    const tax = amount * (taxRate / 100);
    return {
      tax,
      total: amount + tax
    };
  }
});
```

## Parameter Validation

AgentBridge uses JSON Schema to validate function parameters. This ensures that functions receive the expected data types and required fields:

```typescript
// Parameter schema example
const parameterSchema = {
  type: 'object',
  properties: {
    // Basic types
    name: { type: 'string' },
    age: { type: 'number' },
    isActive: { type: 'boolean' },
    
    // Complex types
    address: {
      type: 'object',
      properties: {
        street: { type: 'string' },
        city: { type: 'string' },
        zipCode: { type: 'string' }
      },
      required: ['street', 'city']
    },
    
    // Arrays
    tags: {
      type: 'array',
      items: { type: 'string' }
    },
    
    // Enums
    role: {
      type: 'string',
      enum: ['admin', 'user', 'guest']
    },
    
    // Constraints
    score: {
      type: 'number',
      minimum: 0,
      maximum: 100
    },
    
    // Format
    email: {
      type: 'string',
      format: 'email'
    }
  },
  required: ['name', 'email']
};
```

## Function Context

Functions can receive context information about the current execution environment:

```typescript
bridge.registerFunction({
  name: 'getUserInfo',
  description: 'Get information about the current user',
  parameters: {},
  handler: async (params, context) => {
    // Access context information
    const { user, application, agent } = context;
    
    return {
      userId: user?.id,
      userName: user?.name,
      appId: application.id,
      agentId: agent.id
    };
  }
});
```

Available context properties:

- **user**: Information about the current user (if authenticated)
- **application**: Information about the current application
- **agent**: Information about the AI agent that called the function
- **ip**: The IP address of the client (if available)
- **timestamp**: The time when the function was called

## Calling Functions

Functions can be called both by AI agents and programmatically:

### Programmatic Calls

```typescript
// Call a function from code
const result = await bridge.callFunction('getWeather', {
  location: 'New York',
  units: 'metric'
});

console.log(result); // { temperature: 22, conditions: 'sunny' }
```

### Framework-Specific Calls

#### React

```jsx
import { useAgentBridge } from '@agentbridge/react';

function WeatherDisplay() {
  const { callFunction } = useAgentBridge();
  const [weather, setWeather] = useState(null);
  
  const getWeatherData = async () => {
    const result = await callFunction('getWeather', {
      location: 'London',
      units: 'metric'
    });
    setWeather(result);
  };
  
  return (
    <div>
      <button onClick={getWeatherData}>Get Weather</button>
      {weather && (
        <div>
          <p>Temperature: {weather.temperature}°C</p>
          <p>Conditions: {weather.conditions}</p>
        </div>
      )}
    </div>
  );
}
```

## Error Handling

Function handlers can throw errors, which will be properly handled and returned to the caller:

```typescript
bridge.registerFunction({
  name: 'divide',
  description: 'Divide two numbers',
  parameters: {
    type: 'object',
    properties: {
      numerator: { type: 'number' },
      denominator: { type: 'number' }
    },
    required: ['numerator', 'denominator']
  },
  handler: async (params) => {
    const { numerator, denominator } = params;
    
    if (denominator === 0) {
      throw new Error('Cannot divide by zero');
    }
    
    return { result: numerator / denominator };
  }
});
```

### Error Types

AgentBridge provides several error types for different scenarios:

```typescript
import { 
  ValidationError, 
  NotFoundError, 
  PermissionError 
} from '@agentbridge/core';

bridge.registerFunction({
  name: 'fetchUserData',
  description: 'Fetch user data by ID',
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string' }
    },
    required: ['userId']
  },
  handler: async (params, context) => {
    const { userId } = params;
    
    // Check permissions
    if (!context.user || !context.user.roles.includes('admin')) {
      throw new PermissionError('Only admins can access user data');
    }
    
    // Fetch user data
    const userData = await fetchUserFromDatabase(userId);
    
    if (!userData) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }
    
    return userData;
  }
});
```

## Function Discoverability

AI agents can discover registered functions through the capability protocol:

```
1. Agent connects to application
2. Application sends capabilities message including functions
3. Agent discovers available functions and their parameters
4. Agent can call these functions by name
```

The function registry automatically generates JSON Schema definitions for all registered functions, making them discoverable by AI agents.

## Best Practices

### Naming Conventions

- Use camelCase for function names: `getUserInfo`, `calculateTax`
- Use descriptive, action-oriented names
- Be consistent across your application

### Parameter Design

- Keep parameters simple and focused
- Use JSON Schema to define clear parameter expectations
- Always validate input values within the handler for extra safety

### Function Organization

- Group related functions with tags
- Use namespaces for larger applications: `user.get`, `user.update`
- Keep function logic focused on a single responsibility

### Security Considerations

- Check permissions before performing sensitive operations
- Validate all inputs, even with schema validation
- Don't expose internal implementation details in responses
- Use context to identify the caller

### Performance

- Optimize async operations for mobile environments
- Consider caching results for expensive operations
- Keep functions lightweight when possible

## Code Examples

### A Complete Example

```typescript
import { AgentBridge } from '@agentbridge/core';

// Create a bridge instance
const bridge = new AgentBridge({
  applicationId: 'my-app',
  environmentId: 'development'
});

// Register functions
bridge.registerFunction({
  name: 'searchProducts',
  description: 'Search for products by query',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string' },
      category: { 
        type: 'string',
        enum: ['electronics', 'clothing', 'home', 'books']
      },
      maxPrice: { type: 'number' },
      sortBy: { 
        type: 'string',
        enum: ['price', 'rating', 'newest'],
        default: 'rating'
      },
      limit: { 
        type: 'number',
        minimum: 1,
        maximum: 50,
        default: 10
      }
    },
    required: ['query']
  },
  returnSchema: {
    type: 'object',
    properties: {
      results: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            price: { type: 'number' },
            category: { type: 'string' },
            rating: { type: 'number' }
          }
        }
      },
      totalResults: { type: 'number' },
      page: { type: 'number' }
    }
  },
  handler: async (params) => {
    const { query, category, maxPrice, sortBy = 'rating', limit = 10 } = params;
    
    // Implement product search logic
    // (This is a simplified example)
    const results = await searchProductDatabase({
      query,
      category,
      maxPrice,
      sortBy,
      limit
    });
    
    return {
      results: results.items,
      totalResults: results.total,
      page: results.page
    };
  }
});

// Now AI agents can discover and call this function
```

## Next Steps

- Explore the [Type System](type-system.md) for defining schemas
- Learn about [Component Registry](component-registry.md) for UI components
- See the [API Reference](api-reference.md) for detailed documentation
