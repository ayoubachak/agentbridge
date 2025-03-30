# React Native Examples

This page provides practical examples of using AgentBridge in React Native applications.

## Basic Integration

### Setting Up AgentBridge

```jsx
// App.js
import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, View, Text } from 'react-native';
import { AgentBridge } from '@agentbridge/react-native';

function App() {
  useEffect(() => {
    // Initialize AgentBridge
    AgentBridge.initialize({
      appId: 'your-app-id',
      apiKey: 'your-api-key',
      environment: 'development',
      debug: true,
    });
    
    // Register a simple function
    AgentBridge.registerFunction({
      name: 'greet',
      description: 'Send a greeting to the user',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of the person to greet'
          }
        },
        required: ['name']
      },
      handler: async (params) => {
        console.log(`Hello, ${params.name}!`);
        return { message: `Hello, ${params.name}!` };
      }
    });
    
    return () => {
      // Cleanup when component unmounts
      AgentBridge.cleanup();
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Welcome to AgentBridge React Native!</Text>
      </View>
    </SafeAreaView>
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
    TodoInput.js
    TodoItem.js
    TodoList.js
```

### Todo Input Component

```jsx
// components/todo/TodoInput.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { AgentTextField, AgentButton, useAgentComponent } from '@agentbridge/react-native';

const TodoInput = ({ onAddTodo }) => {
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
  
  const handleAddTodo = () => {
    if (text.trim()) {
      onAddTodo(text.trim());
      setText('');
    }
  };
  
  return (
    <View style={styles.container}>
      <AgentTextField
        id="todo-text-input"
        value={text}
        onChangeText={setText}
        placeholder="What needs to be done?"
        style={styles.input}
        onSubmitEditing={handleAddTodo}
      />
      <AgentButton
        id="add-todo-button"
        label="Add"
        onPress={handleAddTodo}
        style={styles.button}
        textStyle={styles.buttonText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TodoInput;
```

### Todo Item Component

```jsx
// components/todo/TodoItem.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AgentCheckbox, AgentButton, useAgentComponent } from '@agentbridge/react-native';

const TodoItem = ({ todo, onToggle, onDelete }) => {
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
    <View style={styles.container}>
      <AgentCheckbox
        id={`checkbox-${todo.id}`}
        value={todo.completed}
        onValueChange={() => onToggle(todo.id)}
        style={styles.checkbox}
      />
      <Text 
        style={[
          styles.title, 
          todo.completed && styles.completed
        ]}
      >
        {todo.title}
      </Text>
      <AgentButton
        id={`delete-${todo.id}`}
        icon="trash"
        onPress={() => onDelete(todo.id)}
        style={styles.deleteButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checkbox: {
    marginRight: 10,
  },
  title: {
    flex: 1,
    fontSize: 16,
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  deleteButton: {
    padding: 8,
  },
});

export default TodoItem;
```

### Todo List Component

```jsx
// components/todo/TodoList.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { AgentBridge, useAgentComponent } from '@agentbridge/react-native';
import TodoItem from './TodoItem';
import TodoInput from './TodoInput';

const TodoList = () => {
  const [todos, setTodos] = useState([
    { id: '1', title: 'Learn AgentBridge', completed: false },
    { id: '2', title: 'Build a React Native app', completed: true },
  ]);
  
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
    AgentBridge.registerFunction({
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
    
    AgentBridge.registerFunction({
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
    
    AgentBridge.registerFunction({
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
    
    AgentBridge.registerFunction({
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
    
    AgentBridge.registerFunction({
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
      AgentBridge.unregisterFunction('addTodo');
      AgentBridge.unregisterFunction('toggleTodo');
      AgentBridge.unregisterFunction('deleteTodo');
      AgentBridge.unregisterFunction('getTodos');
      AgentBridge.unregisterFunction('clearCompletedTodos');
    };
  }, [todos]);
  
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
    <View style={styles.container}>
      <Text style={styles.title}>Todo List</Text>
      <TodoInput onAddTodo={handleAddTodo} />
      <FlatList
        data={todos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TodoItem
            todo={item}
            onToggle={handleToggleTodo}
            onDelete={handleDeleteTodo}
          />
        )}
        style={styles.list}
      />
      <View style={styles.footer}>
        <Text style={styles.count}>
          {todos.filter(todo => !todo.completed).length} items left
        </Text>
        <AgentButton
          id="clear-completed-button"
          label="Clear completed"
          onPress={handleClearCompleted}
          disabled={!todos.some(todo => todo.completed)}
          style={[
            styles.clearButton,
            !todos.some(todo => todo.completed) && styles.disabledButton
          ]}
          textStyle={styles.clearButtonText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  list: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  count: {
    color: '#888',
  },
  clearButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  clearButtonText: {
    color: '#0066cc',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default TodoList;
```

## Using MCP Adapters

A complete example of integrating MCP adapters in a React Native application.

```jsx
// MCPChatScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  AgentTextField,
  AgentButton,
  AgentBridge,
} from '@agentbridge/react-native';
import axios from 'axios';

const MCPChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);
  
  useEffect(() => {
    // Set up AgentBridge
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
      AgentBridge.unregisterFunction('getWeather');
    };
  }, []);
  
  const setupAgentBridge = () => {
    // Register OpenAI MCP adapter
    AgentBridge.registerMCPAdapter(
      'openai',
      new OpenAIMCPAdapter(AgentBridge.registry)
    );
    
    // Register weather function
    AgentBridge.registerFunction({
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
      const schema = AgentBridge.getMCPSchema('openai');
      
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
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
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
          const result = await AgentBridge.handleMCPFunctionCall(
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
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
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
      
      // Scroll to bottom
      if (flatListRef.current) {
        setTimeout(() => {
          flatListRef.current.scrollToEnd({ animated: true });
        }, 100);
      }
    }
  };
  
  const renderMessageItem = ({ item }) => {
    const isUser = item.role === 'user';
    
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text style={isUser ? styles.userText : styles.assistantText}>
          {item.content}
        </Text>
      </View>
    );
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messagesContainer}
        onLayout={() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: false });
          }
        }}
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>AI is thinking...</Text>
        </View>
      )}
      
      <View style={styles.inputContainer}>
        <AgentTextField
          id="chat-input"
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          style={styles.input}
          onSubmitEditing={sendMessage}
        />
        <AgentButton
          id="send-button"
          icon="send"
          onPress={sendMessage}
          style={styles.sendButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginBottom: 10,
  },
  userBubble: {
    backgroundColor: '#0084ff',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#e4e4e4',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userText: {
    color: 'white',
  },
  assistantText: {
    color: 'black',
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0084ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MCPChatScreen;
```

## Design Information Collection

Example of collecting design information from a React Native application.

```jsx
// DesignInfoExample.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {
  AgentButton,
  AgentBridge,
  ReactNativeDesignCollector,
} from '@agentbridge/react-native';

const DesignInfoExample = () => {
  const [designInfo, setDesignInfo] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  useEffect(() => {
    // Capture design info after initial render
    captureDesignInfo();
    
    return () => {
      // Cleanup
    };
  }, []);
  
  const captureDesignInfo = () => {
    setIsCapturing(true);
    
    setTimeout(() => {
      // Create a design collector
      const designCollector = new ReactNativeDesignCollector({
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
      AgentBridge.registerDesignInfo(info);
      
      setDesignInfo(info);
      setIsCapturing(false);
    }, 100); // Small delay to ensure components are rendered
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Design Information Collection</Text>
        
        {isCapturing ? (
          <Text style={styles.loadingText}>Capturing design information...</Text>
        ) : designInfo ? (
          <View>
            <Text style={styles.sectionTitle}>Captured Design Information</Text>
            
            <Text style={styles.label}>App Info:</Text>
            <View style={styles.infoBox}>
              <Text>
                {JSON.stringify(designInfo.appInfo, null, 2)}
              </Text>
            </View>
            
            <Text style={styles.label}>
              Components: {designInfo.components.length} total
            </Text>
            <View style={styles.infoBox}>
              <Text>
                {designInfo.components.map(comp => comp.id).join(', ')}
              </Text>
            </View>
            
            <AgentButton
              id="recapture-button"
              label="Recapture Design Info"
              onPress={captureDesignInfo}
              style={styles.button}
              textStyle={styles.buttonText}
            />
          </View>
        ) : (
          <Text>No design information captured yet.</Text>
        )}
        
        {/* Example components to capture */}
        <View style={styles.demoSection}>
          <Text style={styles.sectionTitle}>Demo Components</Text>
          
          <AgentButton
            id="demo-button-primary"
            label="Primary Button"
            onPress={() => {}}
            style={[styles.button, styles.primaryButton]}
            textStyle={styles.buttonText}
          />
          
          <AgentButton
            id="demo-button-secondary"
            label="Secondary Button"
            onPress={() => {}}
            style={[styles.button, styles.secondaryButton]}
            textStyle={styles.secondaryButtonText}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  infoBox: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 15,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#0066cc',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#0066cc',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#0066cc',
    fontWeight: 'bold',
    fontSize: 16,
  },
  demoSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
});

export default DesignInfoExample;
```

For more examples of AgentBridge usage in React Native applications, refer to the [React Native Components](../mobile/react-native/components.md) guide and the [Mobile Features](../mobile/mobile-features.md) overview. 