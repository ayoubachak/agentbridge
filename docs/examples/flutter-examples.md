# Flutter Examples

This page provides practical examples of using AgentBridge in Flutter applications.

## Basic Integration

### Setting Up AgentBridge

```dart
import 'package:flutter/material.dart';
import 'package:agentbridge/agentbridge.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize AgentBridge
  await AgentBridge.instance.initialize(
    config: AgentBridgeConfig(
      appId: 'your-app-id',
      apiKey: 'your-api-key',
      environment: 'development',
      debug: true,
    ),
  );
  
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AgentBridge Example',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: HomeScreen(),
    );
  }
}
```

## Todo List Example

A complete example of a todo list application with AgentBridge integration.

### Todo Model

```dart
// lib/models/todo.dart
class Todo {
  final String id;
  final String title;
  bool completed;
  
  Todo({
    required this.id,
    required this.title,
    this.completed = false,
  });
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'completed': completed,
    };
  }
  
  factory Todo.fromJson(Map<String, dynamic> json) {
    return Todo(
      id: json['id'],
      title: json['title'],
      completed: json['completed'] ?? false,
    );
  }
}
```

### Todo List Screen

```dart
// lib/screens/todo_list_screen.dart
import 'package:flutter/material.dart';
import 'package:agentbridge/agentbridge.dart';
import '../models/todo.dart';
import '../widgets/todo_item.dart';
import '../widgets/todo_input.dart';

class TodoListScreen extends StatefulWidget {
  @override
  _TodoListScreenState createState() => _TodoListScreenState();
}

class _TodoListScreenState extends State<TodoListScreen> {
  final List<Todo> todos = [];
  
  @override
  void initState() {
    super.initState();
    
    // Register functions with AgentBridge
    _registerFunctions();
    
    // Load initial todos
    _loadTodos();
  }
  
  void _registerFunctions() {
    final agentBridge = AgentBridge.instance;
    
    // Add todo function
    agentBridge.registerFunction(
      name: 'addTodo',
      description: 'Add a new todo item to the list',
      parameters: {
        'type': 'object',
        'properties': {
          'title': {
            'type': 'string',
            'description': 'Title of the todo item'
          }
        },
        'required': ['title']
      },
      handler: (params) async {
        final title = params['title'];
        
        if (title == null || title.isEmpty) {
          return {
            'success': false,
            'error': 'Title cannot be empty'
          };
        }
        
        final newTodo = Todo(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          title: title,
        );
        
        setState(() {
          todos.add(newTodo);
        });
        
        return {
          'success': true,
          'todo': newTodo.toJson()
        };
      },
    );
    
    // Toggle todo function
    agentBridge.registerFunction(
      name: 'toggleTodo',
      description: 'Toggle the completed status of a todo item',
      parameters: {
        'type': 'object',
        'properties': {
          'id': {
            'type': 'string',
            'description': 'ID of the todo item to toggle'
          }
        },
        'required': ['id']
      },
      handler: (params) async {
        final id = params['id'];
        
        final todoIndex = todos.indexWhere((todo) => todo.id == id);
        
        if (todoIndex == -1) {
          return {
            'success': false,
            'error': 'Todo not found'
          };
        }
        
        setState(() {
          todos[todoIndex].completed = !todos[todoIndex].completed;
        });
        
        return {
          'success': true,
          'todo': todos[todoIndex].toJson()
        };
      },
    );
    
    // Delete todo function
    agentBridge.registerFunction(
      name: 'deleteTodo',
      description: 'Delete a todo item from the list',
      parameters: {
        'type': 'object',
        'properties': {
          'id': {
            'type': 'string',
            'description': 'ID of the todo item to delete'
          }
        },
        'required': ['id']
      },
      handler: (params) async {
        final id = params['id'];
        
        final todoIndex = todos.indexWhere((todo) => todo.id == id);
        
        if (todoIndex == -1) {
          return {
            'success': false,
            'error': 'Todo not found'
          };
        }
        
        setState(() {
          todos.removeAt(todoIndex);
        });
        
        return {
          'success': true
        };
      },
    );
    
    // Get todos function
    agentBridge.registerFunction(
      name: 'getTodos',
      description: 'Get all todo items',
      parameters: {
        'type': 'object',
        'properties': {}
      },
      handler: (params) async {
        return {
          'success': true,
          'todos': todos.map((todo) => todo.toJson()).toList()
        };
      },
    );
  }
  
  void _loadTodos() {
    // Load initial todos (from API, local storage, etc.)
    setState(() {
      todos.add(Todo(
        id: '1',
        title: 'Learn AgentBridge',
        completed: false,
      ));
      todos.add(Todo(
        id: '2',
        title: 'Build a Flutter app',
        completed: true,
      ));
    });
  }
  
  void _addTodo(String title) {
    setState(() {
      todos.add(Todo(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: title,
      ));
    });
  }
  
  void _toggleTodo(String id) {
    setState(() {
      final todo = todos.firstWhere((todo) => todo.id == id);
      todo.completed = !todo.completed;
    });
  }
  
  void _deleteTodo(String id) {
    setState(() {
      todos.removeWhere((todo) => todo.id == id);
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Todo List'),
      ),
      body: Column(
        children: [
          TodoInput(
            onAddTodo: _addTodo,
          ),
          Expanded(
            child: ListView.builder(
              itemCount: todos.length,
              itemBuilder: (context, index) {
                final todo = todos[index];
                return TodoItem(
                  todo: todo,
                  onToggle: () => _toggleTodo(todo.id),
                  onDelete: () => _deleteTodo(todo.id),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
```

### Todo Item Widget

```dart
// lib/widgets/todo_item.dart
import 'package:flutter/material.dart';
import 'package:agentbridge/agentbridge.dart';
import '../models/todo.dart';

class TodoItem extends StatelessWidget with AgentComponentMixin {
  final Todo todo;
  final VoidCallback onToggle;
  final VoidCallback onDelete;
  
  TodoItem({
    Key? key,
    required this.todo,
    required this.onToggle,
    required this.onDelete,
  }) : super(key: key);
  
  @override
  ComponentDefinition getComponentDefinition() {
    return ComponentDefinition(
      id: 'todo-${todo.id}',
      type: 'todo-item',
      properties: {
        'id': todo.id,
        'title': todo.title,
        'completed': todo.completed,
      },
      actions: ['toggle', 'delete'],
      metadata: {
        'importance': 'medium',
        'description': 'A todo item that can be toggled or deleted',
      },
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: AgentCheckbox(
        id: 'checkbox-${todo.id}',
        value: todo.completed,
        onChanged: (_) => onToggle(),
      ),
      title: Text(
        todo.title,
        style: TextStyle(
          decoration: todo.completed ? TextDecoration.lineThrough : null,
        ),
      ),
      trailing: AgentButton(
        id: 'delete-${todo.id}',
        icon: Icons.delete,
        label: 'Delete',
        onPressed: onDelete,
        style: AgentButtonStyle(
          backgroundColor: Colors.red[100],
          textColor: Colors.red[900],
          padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        ),
      ),
    );
  }
}
```

### Todo Input Widget

```dart
// lib/widgets/todo_input.dart
import 'package:flutter/material.dart';
import 'package:agentbridge/agentbridge.dart';

class TodoInput extends StatefulWidget with AgentComponentMixin {
  final Function(String) onAddTodo;
  
  TodoInput({
    Key? key,
    required this.onAddTodo,
  }) : super(key: key);
  
  @override
  ComponentDefinition getComponentDefinition() {
    return ComponentDefinition(
      id: 'todo-input',
      type: 'input-form',
      properties: {
        'placeholder': 'Add a new todo',
      },
      actions: ['submit'],
      metadata: {
        'importance': 'high',
        'description': 'Form for adding new todo items',
      },
    );
  }
  
  @override
  _TodoInputState createState() => _TodoInputState();
}

class _TodoInputState extends State<TodoInput> {
  final _controller = TextEditingController();
  
  void _submitTodo() {
    final title = _controller.text.trim();
    if (title.isNotEmpty) {
      widget.onAddTodo(title);
      _controller.clear();
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(16.0),
      child: Row(
        children: [
          Expanded(
            child: AgentTextField(
              id: 'todo-title-input',
              controller: _controller,
              label: 'New Todo',
              placeholder: 'Enter a task',
              onSubmitted: (_) => _submitTodo(),
            ),
          ),
          SizedBox(width: 16.0),
          AgentButton(
            id: 'add-todo-button',
            label: 'Add',
            icon: Icons.add,
            onPressed: _submitTodo,
            style: AgentButtonStyle(
              backgroundColor: Colors.blue,
              textColor: Colors.white,
              borderRadius: 8.0,
            ),
          ),
        ],
      ),
    );
  }
}
```

## Using MCP Adapters

A complete example of integrating MCP adapters in a Flutter application.

```dart
import 'package:flutter/material.dart';
import 'package:agentbridge/agentbridge.dart';
import 'package:dio/dio.dart';

class MCPExampleScreen extends StatefulWidget {
  @override
  _MCPExampleScreenState createState() => _MCPExampleScreenState();
}

class _MCPExampleScreenState extends State<MCPExampleScreen> {
  final _openaiKey = 'your-openai-api-key';
  final _chatController = TextEditingController();
  final List<Map<String, dynamic>> _messages = [];
  bool _isLoading = false;
  
  @override
  void initState() {
    super.initState();
    _setupAgentBridge();
  }
  
  void _setupAgentBridge() {
    final agentBridge = AgentBridge.instance;
    
    // Register OpenAI MCP adapter
    agentBridge.registerMCPAdapter(
      'openai',
      OpenAIMCPAdapter(agentBridge.registry),
    );
    
    // Register a simple function
    agentBridge.registerFunction(
      name: 'getWeather',
      description: 'Get the current weather for a location',
      parameters: {
        'type': 'object',
        'properties': {
          'location': {
            'type': 'string',
            'description': 'The city and state, e.g. San Francisco, CA'
          }
        },
        'required': ['location']
      },
      handler: (params) async {
        // In a real app, this would call a weather API
        final location = params['location'];
        return {
          'location': location,
          'temperature': 72,
          'conditions': 'sunny',
          'humidity': 45,
          'windSpeed': 8
        };
      },
    );
  }
  
  Future<void> _sendMessage() async {
    final message = _chatController.text.trim();
    if (message.isEmpty) return;
    
    setState(() {
      _messages.add({
        'role': 'user',
        'content': message,
      });
      _isLoading = true;
      _chatController.clear();
    });
    
    try {
      // Get OpenAI schema from AgentBridge
      final schema = AgentBridge.instance.getMCPSchema('openai');
      
      // Call OpenAI API with the schema
      final dio = Dio();
      final response = await dio.post(
        'https://api.openai.com/v1/chat/completions',
        options: Options(
          headers: {
            'Authorization': 'Bearer $_openaiKey',
            'Content-Type': 'application/json',
          },
        ),
        data: {
          'model': 'gpt-4',
          'messages': _messages,
          'tools': schema['functions'],
        },
      );
      
      final assistantMessage = response.data['choices'][0]['message'];
      setState(() {
        _messages.add(assistantMessage);
      });
      
      // Check if the assistant wants to call a function
      if (assistantMessage['tool_calls'] != null) {
        for (final toolCall in assistantMessage['tool_calls']) {
          // Handle function call through AgentBridge
          final result = await AgentBridge.instance.handleMCPFunctionCall(
            'openai',
            toolCall,
          );
          
          // Add function result to messages
          setState(() {
            _messages.add({
              'role': 'tool',
              'tool_call_id': toolCall['id'],
              'content': json.encode(result),
            });
          });
        }
        
        // Get a follow-up response after function call
        final followUpResponse = await dio.post(
          'https://api.openai.com/v1/chat/completions',
          options: Options(
            headers: {
              'Authorization': 'Bearer $_openaiKey',
              'Content-Type': 'application/json',
            },
          ),
          data: {
            'model': 'gpt-4',
            'messages': _messages,
          },
        );
        
        final followUpMessage = followUpResponse.data['choices'][0]['message'];
        setState(() {
          _messages.add(followUpMessage);
        });
      }
    } catch (e) {
      print('Error: $e');
      setState(() {
        _messages.add({
          'role': 'assistant',
          'content': 'Sorry, I encountered an error. Please try again.',
        });
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('MCP Example'),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.all(16.0),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                final isUser = message['role'] == 'user';
                
                return Align(
                  alignment: isUser
                    ? Alignment.centerRight
                    : Alignment.centerLeft,
                  child: Container(
                    margin: EdgeInsets.only(
                      bottom: 8.0,
                      left: isUser ? 64.0 : 0.0,
                      right: isUser ? 0.0 : 64.0,
                    ),
                    padding: EdgeInsets.all(12.0),
                    decoration: BoxDecoration(
                      color: isUser ? Colors.blue : Colors.grey[200],
                      borderRadius: BorderRadius.circular(16.0),
                    ),
                    child: Text(
                      message['content'],
                      style: TextStyle(
                        color: isUser ? Colors.white : Colors.black,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          if (_isLoading)
            Padding(
              padding: EdgeInsets.all(16.0),
              child: CircularProgressIndicator(),
            ),
          Padding(
            padding: EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: AgentTextField(
                    id: 'chat-input',
                    controller: _chatController,
                    placeholder: 'Type a message',
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                SizedBox(width: 8.0),
                AgentButton(
                  id: 'send-button',
                  icon: Icons.send,
                  label: 'Send',
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
```

## Design Information Collection

Example of collecting design information from a Flutter application.

```dart
import 'package:flutter/material.dart';
import 'package:agentbridge/agentbridge.dart';

class DesignInfoExample extends StatefulWidget {
  @override
  _DesignInfoExampleState createState() => _DesignInfoExampleState();
}

class _DesignInfoExampleState extends State<DesignInfoExample> {
  final _designCollector = FlutterDesignCollector(
    captureOptions: CaptureOptions(
      includeStyles: true,
      includeDisabledComponents: true,
      includePositions: true,
      maxDepth: 10,
    ),
  );
  bool _isCapturing = false;
  Map<String, dynamic>? _designInfo;
  
  @override
  void initState() {
    super.initState();
    
    // Set up post-frame callback to capture design info after first render
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _captureDesignInfo();
    });
  }
  
  void _captureDesignInfo() {
    setState(() {
      _isCapturing = true;
    });
    
    // Capture design information
    final designInfo = _designCollector.captureDesignInfo(context);
    
    // Register with AgentBridge
    AgentBridge.instance.registerDesignInfo(designInfo);
    
    setState(() {
      _designInfo = designInfo;
      _isCapturing = false;
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Design Info Example'),
      ),
      body: _isCapturing
        ? Center(child: CircularProgressIndicator())
        : _designInfo == null
          ? Center(child: Text('No design info captured yet'))
          : SingleChildScrollView(
              padding: EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Captured Design Information',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  SizedBox(height: 16.0),
                  Text(
                    'App Info:',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  SizedBox(height: 8.0),
                  Text(
                    _designInfo!['appInfo'].toString(),
                  ),
                  SizedBox(height: 16.0),
                  Text(
                    'Components:',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  SizedBox(height: 8.0),
                  Text(
                    'Total components: ${_designInfo!['components'].length}',
                  ),
                  SizedBox(height: 16.0),
                  AgentButton(
                    id: 'refresh-design-info',
                    label: 'Refresh Design Info',
                    onPressed: _captureDesignInfo,
                  ),
                ],
              ),
            ),
    );
  }
}
```

For more examples of AgentBridge usage in Flutter applications, refer to the [Flutter Components](../mobile/flutter/components.md) guide and the [Mobile Features](../mobile/mobile-features.md) overview. 