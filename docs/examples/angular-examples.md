# Angular Examples

This page provides practical examples of using AgentBridge in Angular applications.

## Basic Integration

### Setting Up AgentBridge

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AgentBridgeModule } from '@agentbridge/angular';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AgentBridgeModule.forRoot({
      appId: 'your-app-id',
      apiKey: 'your-api-key',
      environment: 'development',
      debug: true
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## Todo List Example

A simplified todo list application with AgentBridge integration.

### Todo Service

```typescript
// todo.service.ts
import { Injectable } from '@angular/core';
import { AgentBridgeService } from '@agentbridge/angular';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private todos: BehaviorSubject<Todo[]> = new BehaviorSubject<Todo[]>([
    { id: '1', title: 'Learn AgentBridge', completed: false },
    { id: '2', title: 'Build an Angular app', completed: true }
  ]);

  constructor(private agentBridge: AgentBridgeService) {
    this.registerFunctions();
  }

  getTodos(): Observable<Todo[]> {
    return this.todos.asObservable();
  }

  addTodo(title: string): void {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      completed: false
    };
    this.todos.next([...this.todos.value, newTodo]);
  }

  toggleTodo(id: string): void {
    const updatedTodos = this.todos.value.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    this.todos.next(updatedTodos);
  }

  deleteTodo(id: string): void {
    const updatedTodos = this.todos.value.filter(todo => todo.id !== id);
    this.todos.next(updatedTodos);
  }

  clearCompleted(): void {
    const updatedTodos = this.todos.value.filter(todo => !todo.completed);
    this.todos.next(updatedTodos);
  }

  private registerFunctions(): void {
    this.agentBridge.registerFunction({
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
        
        this.addTodo(title.trim());
        
        return {
          success: true,
          todo: this.todos.value.find(todo => todo.title === title.trim())
        };
      },
    });

    // Additional function registrations would follow the same pattern
  }
}
```

### Todo Component

```typescript
// todo-list.component.ts
import { Component, OnInit } from '@angular/core';
import { AgentBridgeService } from '@agentbridge/angular';
import { TodoService, Todo } from './todo.service';

@Component({
  selector: 'app-todo-list',
  template: `
    <div class="todo-list-container" agentComponent="todo-list" [agentComponentProps]="{
      type: 'list',
      properties: {
        itemCount: todos.length,
        completedCount: completedCount
      },
      actions: ['clearCompleted']
    }">
      <h2>Todo List</h2>
      
      <div class="todo-input">
        <input
          type="text"
          #todoInput
          placeholder="What needs to be done?"
          class="todo-text-input"
        />
        <button (click)="addTodo(todoInput.value); todoInput.value = ''">Add</button>
      </div>
      
      <div class="todo-items">
        <div *ngFor="let todo of todos" 
             class="todo-item"
             [class.completed]="todo.completed"
             agentComponent="todo-{{todo.id}}"
             [agentComponentProps]="{
               type: 'todo-item',
               properties: {
                 id: todo.id,
                 title: todo.title,
                 completed: todo.completed
               },
               actions: ['toggle', 'delete']
             }">
          <input
            type="checkbox"
            [checked]="todo.completed"
            (change)="toggleTodo(todo.id)"
            class="todo-checkbox"
          />
          <span class="todo-title">{{todo.title}}</span>
          <button
            (click)="deleteTodo(todo.id)"
            class="todo-delete-button"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div class="todo-footer">
        <span class="todo-count">
          {{todos.filter(t => !t.completed).length}} items left
        </span>
        <button
          (click)="clearCompleted()"
          class="clear-completed-button"
          [disabled]="!hasCompleted"
        >
          Clear completed
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent implements OnInit {
  todos: Todo[] = [];

  constructor(
    private todoService: TodoService,
    private agentBridge: AgentBridgeService
  ) {}

  ngOnInit(): void {
    this.todoService.getTodos().subscribe(todos => {
      this.todos = todos;
    });
  }

  get completedCount(): number {
    return this.todos.filter(todo => todo.completed).length;
  }

  get hasCompleted(): boolean {
    return this.completedCount > 0;
  }

  addTodo(title: string): void {
    if (title.trim()) {
      this.todoService.addTodo(title);
    }
  }

  toggleTodo(id: string): void {
    this.todoService.toggleTodo(id);
  }

  deleteTodo(id: string): void {
    this.todoService.deleteTodo(id);
  }

  clearCompleted(): void {
    this.todoService.clearCompleted();
  }
}
```

## Using MCP Adapters

Example of integrating MCP adapters in an Angular application.

```typescript
// chat.component.ts
import { Component, OnInit } from '@angular/core';
import { AgentBridgeService } from '@agentbridge/angular';
import { OpenAIMCPAdapter } from '@agentbridge/mcp-openai';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
}

@Component({
  selector: 'app-chat',
  template: `
    <div class="chat-container">
      <div class="chat-messages">
        <div
          *ngFor="let message of messages"
          class="message"
          [ngClass]="message.role === 'user' ? 'user-message' : 'assistant-message'"
        >
          <div class="message-content">{{message.content}}</div>
        </div>
        
        <div *ngIf="isLoading" class="message assistant-message">
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="chat-input-container">
        <textarea
          [(ngModel)]="inputText"
          (keydown.enter)="$event.shiftKey ? null : (sendMessage(), $event.preventDefault())"
          placeholder="Type a message..."
          class="chat-input"
          [disabled]="isLoading"
        ></textarea>
        <button
          (click)="sendMessage()"
          class="send-button"
          [disabled]="isLoading || !inputText.trim()"
        >
          Send
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  messages: Message[] = [];
  inputText = '';
  isLoading = false;

  constructor(
    private agentBridge: AgentBridgeService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.setupAgentBridge();
    
    // Add initial welcome message
    this.messages.push({
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I can help you with weather information. Try asking about the weather in a city.'
    });
  }

  private setupAgentBridge(): void {
    // Register OpenAI MCP adapter
    this.agentBridge.registerMCPAdapter(
      'openai',
      new OpenAIMCPAdapter(this.agentBridge.registry)
    );
    
    // Register weather function
    this.agentBridge.registerFunction({
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
      }
    });
  }

  async sendMessage(): void {
    if (!this.inputText.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: this.inputText,
    };
    
    this.messages.push(userMessage);
    this.inputText = '';
    this.isLoading = true;
    
    try {
      // Get OpenAI schema from AgentBridge
      const schema = this.agentBridge.getMCPSchema('openai');
      
      // Call OpenAI API (simplified for the example)
      const response = await this.callOpenAI(this.messages, schema.functions);
      
      // Process the response
      // Note: This is simplified; a real implementation would handle all message types
      this.handleResponse(response);
    } catch (error) {
      console.error('Error sending message:', error);
      
      this.messages.push({
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      });
    } finally {
      this.isLoading = false;
    }
  }

  private async callOpenAI(messages: Message[], tools: any[]): Promise<any> {
    // Simplified OpenAI API call for the example
    return this.http.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        ...(msg.tool_call_id ? { tool_call_id: msg.tool_call_id } : {})
      })),
      tools
    }, {
      headers: {
        'Authorization': `Bearer ${environment.openaiApiKey}`,
        'Content-Type': 'application/json'
      }
    }).toPromise();
  }

  private async handleResponse(response: any): Promise<void> {
    if (!response || !response.choices || !response.choices[0].message) {
      throw new Error('Invalid response format');
    }
    
    const assistantMessage = response.choices[0].message;
    const newAssistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: assistantMessage.content || ''
    };
    
    this.messages.push(newAssistantMessage);
    
    // Check if the assistant wants to call a function
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      for (const toolCall of assistantMessage.tool_calls) {
        // Handle function call through AgentBridge
        const result = await this.agentBridge.handleMCPFunctionCall(
          'openai',
          toolCall
        );
        
        // Add function result to messages
        const functionMessage: Message = {
          id: `function-${Date.now()}-${Math.random()}`,
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        };
        
        this.messages.push(functionMessage);
        
        // Call OpenAI again with the function result
        const followUpResponse = await this.callOpenAI(this.messages, []);
        this.handleResponse(followUpResponse);
      }
    }
  }
}
```

## Design Information Collection

Example of collecting design information from an Angular application.

```typescript
// design-info.component.ts
import { Component, OnInit } from '@angular/core';
import { AgentBridgeService } from '@agentbridge/angular';
import { AngularDesignCollector } from '@agentbridge/angular';

@Component({
  selector: 'app-design-info',
  template: `
    <div class="design-info-container">
      <h2>Design Information Collection</h2>
      
      <div *ngIf="isCapturing" class="loading">
        Capturing design information...
      </div>
      
      <div *ngIf="!isCapturing && designInfo" class="design-info">
        <h3>Captured Design Information</h3>
        
        <div class="info-section">
          <h4>App Info:</h4>
          <pre>{{designInfo.appInfo | json}}</pre>
        </div>
        
        <div class="info-section">
          <h4>Components:</h4>
          <p>{{designInfo.components.length}} total components</p>
          <p>Types: {{componentTypes}}</p>
        </div>
        
        <button
          (click)="captureDesignInfo()"
          class="capture-button"
        >
          Recapture Design Info
        </button>
      </div>
      
      <div *ngIf="!isCapturing && !designInfo">
        No design information captured yet.
      </div>
      
      <!-- Example components to capture -->
      <div class="demo-section">
        <h3>Demo Components</h3>
        
        <button
          id="demo-button-primary"
          class="demo-button primary"
        >
          Primary Button
        </button>
        
        <button
          id="demo-button-secondary"
          class="demo-button secondary"
        >
          Secondary Button
        </button>
        
        <div class="form-group">
          <label for="demo-input">Text Input</label>
          <input
            id="demo-input"
            type="text"
            class="demo-input"
            placeholder="Enter text"
          />
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./design-info.component.css']
})
export class DesignInfoComponent implements OnInit {
  designInfo: any = null;
  isCapturing = false;
  
  constructor(private agentBridge: AgentBridgeService) {}
  
  ngOnInit(): void {
    // Capture design info after initial render
    setTimeout(() => this.captureDesignInfo(), 100);
  }
  
  get componentTypes(): string {
    if (!this.designInfo || !this.designInfo.components) {
      return '';
    }
    
    const types = new Set(this.designInfo.components.map((c: any) => c.type));
    return Array.from(types).join(', ');
  }
  
  captureDesignInfo(): void {
    this.isCapturing = true;
    
    setTimeout(() => {
      // Create a design collector
      const designCollector = new AngularDesignCollector({
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
      this.agentBridge.registerDesignInfo(info);
      
      this.designInfo = info;
      this.isCapturing = false;
      
      // Register a function to get design info
      this.agentBridge.registerFunction({
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
        handler: async (params: any) => {
          const { includeDetails = false } = params;
          
          if (!includeDetails) {
            // Return simplified version
            return {
              appInfo: info.appInfo,
              componentCount: info.components.length,
              componentTypes: Array.from(new Set(info.components.map((c: any) => c.type))),
              screens: info.screens?.map((s: any) => s.name) || []
            };
          }
          
          return info;
        }
      });
    }, 100);
  }
}
```

For more examples of AgentBridge usage in Angular applications, refer to the [Angular Components](../web/angular/components.md) guide and the [Web Features](../web/web-features.md) overview. 