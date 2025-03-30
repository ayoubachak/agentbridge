# React Examples

This page provides practical examples of using AgentBridge in React applications.

## Basic Integration

### Setting Up AgentBridge

```jsx
// App.jsx
import React, { useEffect } from 'react';
import { AgentBridgeProvider } from '@agentbridge/react';

function App() {
  return (
    <AgentBridgeProvider
      config={{
        appId: 'your-app-id',
        apiKey: 'your-api-key',
        environment: 'development',
        debug: true,
      }}
    >
      <MainContent />
    </AgentBridgeProvider>
  );
}

function MainContent() {
  // Your application content
  return (
    <div className="app-container">
      <h1>AgentBridge React Example</h1>
      {/* Your components here */}
    </div>
  );
}

export default App;
```

## Todo List Example

A complete example of a todo list application with AgentBridge integration.

### Components Directory Structure

```
/components
  /todo
    TodoInput.jsx
    TodoItem.jsx
    TodoList.jsx
```

### Todo Input Component

```jsx
// components/todo/TodoInput.jsx
import React, { useState } from 'react';
import { useAgentComponent } from '@agentbridge/react';

function TodoInput({ onAddTodo }) {
  const [text, setText] = useState('');
  
  // Register component with AgentBridge
  useAgentComponent('todo-input', {
    type: 'input-form',
    properties: {
      placeholder: 'Add a new todo',
      value: text
    },
    actions: ['submit']
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAddTodo(text.trim());
      setText('');
    }
  };
  
  return (
    <form className="todo-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What needs to be done?"
        className="todo-text-input"
        data-testid="todo-input"
      />
      <button type="submit" className="todo-add-button">
        Add
      </button>
    </form>
  );
}

export default TodoInput;
```

### Todo Item Component

```jsx
// components/todo/TodoItem.jsx
import React from 'react';
import { useAgentComponent } from '@agentbridge/react';

function TodoItem({ todo, onToggle, onDelete }) {
  // Register component with AgentBridge
  useAgentComponent(`todo-${todo.id}`, {
    type: 'todo-item',
    properties: {
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
    },
    actions: ['toggle', 'delete'],
    metadata: {
      importance: 'medium',
      description: 'A todo item that can be toggled or deleted',
    },
  });
  
  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="todo-checkbox"
        data-testid={`todo-checkbox-${todo.id}`}
      />
      <span className="todo-title">{todo.title}</span>
      <button
        onClick={() => onDelete(todo.id)}
        className="todo-delete-button"
        data-testid={`todo-delete-${todo.id}`}
      >
        Delete
      </button>
    </div>
  );
}

export default TodoItem;
```

### Todo List Component

```jsx
// components/todo/TodoList.jsx
import React, { useState, useEffect } from 'react';
import { useAgentBridge, useAgentComponent } from '@agentbridge/react';
import TodoItem from './TodoItem';
import TodoInput from './TodoInput';

function TodoList() {
  const [todos, setTodos] = useState([
    { id: '1', title: 'Learn AgentBridge', completed: false },
    { id: '2', title: 'Build a React app', completed: true },
  ]);
  
  const agentBridge = useAgentBridge();
  
  // Register component with AgentBridge
  useAgentComponent('todo-list', {
    type: 'list',
    properties: {
      itemCount: todos.length,
      completedCount: todos.filter(todo => todo.completed).length,
    },
    actions: ['clearCompleted'],
    metadata: {
      importance: 'high',
      description: 'A list of todo items',
    },
  });
  
  useEffect(() => {
    // Register functions with AgentBridge
    agentBridge.registerFunction({
      name: 'addTodo',
      description: 'Add a new todo item to the list',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Title of the todo item',
          },
        },
        required: ['title'],
      },
      handler: async (params) => {
        const { title } = params;
        
        if (!title || !title.trim()) {
          return {
            success: false,
            error: 'Title cannot be empty',
          };
        }
        
        const newTodo = {
          id: Date.now().toString(),
          title: title.trim(),
          completed: false,
        };
        
        setTodos(currentTodos => [...currentTodos, newTodo]);
        
        return {
          success: true,
          todo: newTodo,
        };
      },
    });
    
    agentBridge.registerFunction({
      name: 'toggleTodo',
      description: 'Toggle the completed status of a todo item',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'ID of the todo item to toggle',
          },
        },
        required: ['id'],
      },
      handler: async (params) => {
        const { id } = params;
        
        let updatedTodo = null;
        
        setTodos(currentTodos => {
          const updatedTodos = currentTodos.map(todo => {
            if (todo.id === id) {
              updatedTodo = { ...todo, completed: !todo.completed };
              return updatedTodo;
            }
            return todo;
          });
          
          return updatedTodos;
        });
        
        if (!updatedTodo) {
          return {
            success: false,
            error: 'Todo not found',
          };
        }
        
        return {
          success: true,
          todo: updatedTodo,
        };
      },
    });
    
    agentBridge.registerFunction({
      name: 'deleteTodo',
      description: 'Delete a todo item from the list',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'ID of the todo item to delete',
          },
        },
        required: ['id'],
      },
      handler: async (params) => {
        const { id } = params;
        
        const todoExists = todos.some(todo => todo.id === id);
        
        if (!todoExists) {
          return {
            success: false,
            error: 'Todo not found',
          };
        }
        
        setTodos(currentTodos => currentTodos.filter(todo => todo.id !== id));
        
        return {
          success: true,
        };
      },
    });
    
    agentBridge.registerFunction({
      name: 'getTodos',
      description: 'Get all todo items',
      parameters: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        return {
          success: true,
          todos,
        };
      },
    });
    
    agentBridge.registerFunction({
      name: 'clearCompletedTodos',
      description: 'Clear all completed todo items',
      parameters: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        const completedCount = todos.filter(todo => todo.completed).length;
        
        if (completedCount === 0) {
          return {
            success: false,
            error: 'No completed todos to clear',
          };
        }
        
        setTodos(currentTodos => currentTodos.filter(todo => !todo.completed));
        
        return {
          success: true,
          clearedCount: completedCount,
        };
      },
    });
    
    return () => {
      // Cleanup when component unmounts
      agentBridge.unregisterFunction('addTodo');
      agentBridge.unregisterFunction('toggleTodo');
      agentBridge.unregisterFunction('deleteTodo');
      agentBridge.unregisterFunction('getTodos');
      agentBridge.unregisterFunction('clearCompletedTodos');
    };
  }, [todos, agentBridge]);
  
  const handleAddTodo = (title) => {
    const newTodo = {
      id: Date.now().toString(),
      title,
      completed: false,
    };
    setTodos([...todos, newTodo]);
  };
  
  const handleToggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };
  
  const handleDeleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  const handleClearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };
  
  return (
    <div className="todo-list-container">
      <h2>Todo List</h2>
      <TodoInput onAddTodo={handleAddTodo} />
      <div className="todo-items">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggleTodo}
            onDelete={handleDeleteTodo}
          />
        ))}
      </div>
      <div className="todo-footer">
        <span className="todo-count">
          {todos.filter(todo => !todo.completed).length} items left
        </span>
        <button
          onClick={handleClearCompleted}
          className="clear-completed-button"
          disabled={!todos.some(todo => todo.completed)}
        >
          Clear completed
        </button>
      </div>
    </div>
  );
}

export default TodoList;
```

## Using MCP Adapters

A complete example of integrating MCP adapters in a React application.

```jsx
// MCPChatComponent.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAgentBridge } from '@agentbridge/react';
import { OpenAIMCPAdapter } from '@agentbridge/mcp-openai';
import axios from 'axios';

function MCPChatComponent() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const agentBridge = useAgentBridge();
  
  useEffect(() => {
    // Set up AgentBridge with MCP adapter
    setupAgentBridge();
    
    // Add initial welcome message
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! I can help you with weather information. Try asking about the weather in a city.',
      },
    ]);
    
    return () => {
      // Cleanup
      agentBridge.unregisterFunction('getWeather');
    };
  }, [agentBridge]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);
  
  const setupAgentBridge = () => {
    // Register OpenAI MCP adapter
    agentBridge.registerMCPAdapter(
      'openai',
      new OpenAIMCPAdapter(agentBridge.registry)
    );
    
    // Register weather function
    agentBridge.registerFunction({
      name: 'getWeather',
      description: 'Get the current weather for a location',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city and state, e.g. San Francisco, CA',
          },
        },
        required: ['location'],
      },
      handler: async (params) => {
        // In a real app, this would call a weather API
        const { location } = params;
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return mock weather data
        return {
          location,
          temperature: 72,
          conditions: 'sunny',
          humidity: 45,
          windSpeed: 8,
        };
      },
    });
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      // Get OpenAI schema from AgentBridge
      const schema = agentBridge.getMCPSchema('openai');
      
      // Prepare the messages in OpenAI format
      const apiMessages = messages.concat(userMessage).map(msg => ({
        role: msg.role,
        content: msg.content,
        ...(msg.tool_call_id ? { tool_call_id: msg.tool_call_id } : {}),
      }));
      
      // Call OpenAI API
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: apiMessages,
          tools: schema.functions,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const assistantMessage = response.data.choices[0].message;
      const newAssistantMessage = {
        id: `assistant-${Date.now()}`,
        ...assistantMessage,
      };
      
      setMessages(prevMessages => [...prevMessages, newAssistantMessage]);
      
      // Check if the assistant wants to call a function
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        for (const toolCall of assistantMessage.tool_calls) {
          // Handle function call through AgentBridge
          const result = await agentBridge.handleMCPFunctionCall(
            'openai',
            toolCall
          );
          
          // Add function result to messages
          const functionMessage = {
            id: `function-${Date.now()}-${Math.random()}`,
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          };
          
          setMessages(prevMessages => [...prevMessages, functionMessage]);
          
          // Get a follow-up response from OpenAI
          const updatedMessages = [
            ...apiMessages, 
            newAssistantMessage, 
            functionMessage
          ];
          
          const followUpResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
              model: 'gpt-4',
              messages: updatedMessages,
            },
            {
              headers: {
                'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          const followUpMessage = followUpResponse.data.choices[0].message;
          setMessages(prevMessages => [
            ...prevMessages, 
            {
              id: `assistant-followup-${Date.now()}`,
              ...followUpMessage,
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map(message => (
          <div
            key={message.id}
            className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <div className="message-content">{message.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-container">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="chat-input"
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          className="send-button"
          disabled={isLoading || !inputText.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default MCPChatComponent;
```

## Design Information Collection

Example of collecting design information from a React application.

```jsx
// DesignInfoCollector.jsx
import React, { useState, useEffect } from 'react';
import { useAgentBridge } from '@agentbridge/react';
import { ReactDesignCollector } from '@agentbridge/react';

function DesignInfoCollector() {
  const [designInfo, setDesignInfo] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const agentBridge = useAgentBridge();
  
  useEffect(() => {
    // Capture design info after initial render
    captureDesignInfo();
  }, []);
  
  const captureDesignInfo = () => {
    setIsCapturing(true);
    
    setTimeout(() => {
      // Create a design collector
      const designCollector = new ReactDesignCollector({
        captureOptions: {
          includeStyles: true,
          includeDisabledComponents: true,
          includePositions: true,
          maxDepth: 10,
        },
      });
      
      // Capture design information
      const info = designCollector.captureDesignInfo();
      
      // Register with AgentBridge
      agentBridge.registerDesignInfo(info);
      
      setDesignInfo(info);
      setIsCapturing(false);
      
      // Register a function to get design info
      agentBridge.registerFunction({
        name: 'getDesignInfo',
        description: 'Get information about the UI design and layout',
        parameters: {
          type: 'object',
          properties: {
            includeDetails: {
              type: 'boolean',
              description: 'Whether to include detailed styling information'
            }
          }
        },
        handler: async (params) => {
          const { includeDetails = false } = params;
          
          if (!includeDetails) {
            // Return simplified version
            return {
              appInfo: info.appInfo,
              componentCount: info.components.length,
              componentTypes: [...new Set(info.components.map(c => c.type))],
              screens: info.screens?.map(s => s.name) || []
            };
          }
          
          return info;
        }
      });
    }, 100); // Small delay to ensure components are rendered
  };
  
  return (
    <div className="design-info-container">
      <h2>Design Information Collection</h2>
      
      {isCapturing ? (
        <div className="loading">Capturing design information...</div>
      ) : designInfo ? (
        <div className="design-info">
          <h3>Captured Design Information</h3>
          
          <div className="info-section">
            <h4>App Info:</h4>
            <pre>
              {JSON.stringify(designInfo.appInfo, null, 2)}
            </pre>
          </div>
          
          <div className="info-section">
            <h4>Components:</h4>
            <p>{designInfo.components.length} total components</p>
            <p>Types: {[...new Set(designInfo.components.map(c => c.type))].join(', ')}</p>
          </div>
          
          <button
            onClick={captureDesignInfo}
            className="capture-button"
          >
            Recapture Design Info
          </button>
        </div>
      ) : (
        <div>No design information captured yet.</div>
      )}
      
      {/* Example components to capture */}
      <div className="demo-section">
        <h3>Demo Components</h3>
        
        <button
          id="demo-button-primary"
          className="demo-button primary"
          onClick={() => {}}
        >
          Primary Button
        </button>
        
        <button
          id="demo-button-secondary"
          className="demo-button secondary"
          onClick={() => {}}
        >
          Secondary Button
        </button>
        
        <div className="form-group">
          <label htmlFor="demo-input">Text Input</label>
          <input
            id="demo-input"
            type="text"
            className="demo-input"
            placeholder="Enter text"
          />
        </div>
      </div>
    </div>
  );
}

export default DesignInfoCollector;
```

## Using React Hooks for State Management

Example of using the `useAgentState` hook for state management.

```jsx
// Counter.jsx
import React from 'react';
import { useAgentState, useAgentAction } from '@agentbridge/react';

function Counter() {
  // Create state that's registered with AgentBridge
  const [count, setCount] = useAgentState('counter', 0, {
    type: 'counter',
    properties: {
      value: 0,
      min: 0,
      max: 100,
    },
    actions: ['increment', 'decrement', 'reset'],
  });
  
  // Register increment action
  const increment = useAgentAction(
    'increment-counter',
    () => {
      setCount(prev => Math.min(prev + 1, 100));
      return { success: true, newValue: count + 1 };
    },
    {
      description: 'Increment the counter by 1',
      parameters: {},
    }
  );
  
  // Register decrement action
  const decrement = useAgentAction(
    'decrement-counter',
    () => {
      setCount(prev => Math.max(prev - 1, 0));
      return { success: true, newValue: count - 1 };
    },
    {
      description: 'Decrement the counter by 1',
      parameters: {},
    }
  );
  
  // Register reset action
  const reset = useAgentAction(
    'reset-counter',
    () => {
      setCount(0);
      return { success: true, newValue: 0 };
    },
    {
      description: 'Reset the counter to 0',
      parameters: {},
    }
  );
  
  return (
    <div className="counter-container">
      <h2>Counter Example</h2>
      <div className="counter-display">{count}</div>
      <div className="counter-controls">
        <button
          onClick={decrement}
          disabled={count <= 0}
          className="counter-button decrement"
        >
          -
        </button>
        <button
          onClick={reset}
          className="counter-button reset"
        >
          Reset
        </button>
        <button
          onClick={increment}
          disabled={count >= 100}
          className="counter-button increment"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default Counter;
```

For more examples of AgentBridge usage in React applications, refer to the [React Components](../web/react/components.md) guide and the [Web Features](../web/web-features.md) overview. 