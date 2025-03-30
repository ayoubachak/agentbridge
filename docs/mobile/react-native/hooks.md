# React Native Hooks

This page documents the custom React hooks provided by the AgentBridge React Native SDK.

## Core Hooks

### useAgentBridge

Provides access to the AgentBridge instance throughout your React Native application.

```jsx
import { useAgentBridge } from '@agentbridge/react-native';

function MyComponent() {
  const agentBridge = useAgentBridge();
  
  const handleAction = () => {
    // Use the agentBridge instance
    agentBridge.executeFunction('someFunction', { param: 'value' });
  };
  
  return (
    // Your component JSX
  );
}
```

### useAgentComponent

Registers a component with AgentBridge and keeps its definition updated when props change.

```jsx
import { useAgentComponent } from '@agentbridge/react-native';

function Button({ id, label, disabled, onPress }) {
  // Register component with AgentBridge
  useAgentComponent(id, {
    type: 'button',
    properties: {
      label,
      disabled
    },
    actions: ['click'],
    metadata: {
      importance: 'medium'
    }
  });
  
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={styles.button}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}
```

### useAgentState

Creates a state variable that can be observed and modified by AI agents.

```jsx
import { useAgentState } from '@agentbridge/react-native';

function InputField({ id, label }) {
  // Create state that's registered with AgentBridge
  const [value, setValue] = useAgentState(id, '', {
    type: 'text-field',
    properties: {
      label
    },
    actions: ['input']
  });
  
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        style={styles.input}
      />
    </View>
  );
}
```

### useAgentAction

Registers a function that can be triggered by AI agents.

```jsx
import { useAgentAction } from '@agentbridge/react-native';

function SubmitButton({ id, formData }) {
  // Register an action that can be triggered by AI agents
  const handleSubmit = useAgentAction(id, async () => {
    try {
      // Submit the form data
      const response = await api.submitForm(formData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, {
    description: 'Submit the form data to the server',
    parameters: {}
  });
  
  return (
    <TouchableOpacity onPress={handleSubmit} style={styles.button}>
      <Text style={styles.buttonText}>Submit</Text>
    </TouchableOpacity>
  );
}
```

### useAgentFunction

Registers a function with AgentBridge that can be called by AI agents.

```jsx
import { useAgentFunction } from '@agentbridge/react-native';

function SearchWidget() {
  const [results, setResults] = useState([]);
  
  // Register a function with AgentBridge
  useAgentFunction({
    name: 'searchProducts',
    description: 'Search for products by name',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return'
        }
      },
      required: ['query']
    },
    handler: async (params) => {
      const { query, limit = 10 } = params;
      
      try {
        const searchResults = await api.searchProducts(query, limit);
        setResults(searchResults);
        return { success: true, results: searchResults };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  });
  
  return (
    <View>
      {results.map(result => (
        <ProductItem key={result.id} product={result} />
      ))}
    </View>
  );
}
```

## UI Interaction Hooks

### useAgentNavigation

Registers navigation capabilities with AgentBridge and provides navigation utilities.

```jsx
import { useAgentNavigation } from '@agentbridge/react-native';
import { useNavigation } from '@react-navigation/native';

function NavigationButtons() {
  const navigation = useNavigation();
  
  // Register navigation with AgentBridge
  const { navigateTo, goBack } = useAgentNavigation({
    routes: ['Home', 'Profile', 'Settings', 'Products'],
    currentRoute: 'Home'
  });
  
  // These functions are automatically registered with AgentBridge
  // and will handle the navigation when called
  
  return (
    <View style={styles.buttonsContainer}>
      <Button title="Go to Profile" onPress={() => navigateTo('Profile')} />
      <Button title="Go to Settings" onPress={() => navigateTo('Settings')} />
      <Button title="Go Back" onPress={() => goBack()} />
    </View>
  );
}
```

### useAgentForm

Creates a form that can be controlled by AI agents.

```jsx
import { useAgentForm } from '@agentbridge/react-native';

function ContactForm() {
  // Create a form that's registered with AgentBridge
  const { form, handleChange, handleSubmit, reset } = useAgentForm({
    id: 'contact-form',
    initialValues: {
      name: '',
      email: '',
      message: ''
    },
    validation: {
      name: value => value ? null : 'Name is required',
      email: value => /^\S+@\S+\.\S+$/.test(value) ? null : 'Valid email is required',
      message: value => value ? null : 'Message is required'
    },
    onSubmit: async (values) => {
      try {
        await api.sendContactForm(values);
        reset();
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  });
  
  return (
    <View style={styles.form}>
      <Text style={styles.title}>Contact Us</Text>
      
      <View style={styles.field}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          value={form.values.name}
          onChangeText={value => handleChange('name', value)}
          style={styles.input}
        />
        {form.errors.name && (
          <Text style={styles.error}>{form.errors.name}</Text>
        )}
      </View>
      
      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={form.values.email}
          onChangeText={value => handleChange('email', value)}
          keyboardType="email-address"
          style={styles.input}
        />
        {form.errors.email && (
          <Text style={styles.error}>{form.errors.email}</Text>
        )}
      </View>
      
      <View style={styles.field}>
        <Text style={styles.label}>Message</Text>
        <TextInput
          value={form.values.message}
          onChangeText={value => handleChange('message', value)}
          multiline
          numberOfLines={4}
          style={[styles.input, styles.textArea]}
        />
        {form.errors.message && (
          <Text style={styles.error}>{form.errors.message}</Text>
        )}
      </View>
      
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}
```

### useAgentList

Creates a list that can be controlled by AI agents.

```jsx
import { useAgentList } from '@agentbridge/react-native';

function ProductList({ products }) {
  // Create a list that's registered with AgentBridge
  const { 
    items, 
    selectedItem, 
    selectItem, 
    handleAction 
  } = useAgentList({
    id: 'product-list',
    initialItems: products,
    itemIdKey: 'id',
    actions: {
      viewDetails: (item) => {
        navigation.navigate('ProductDetails', { productId: item.id });
        return { success: true };
      },
      addToCart: async (item) => {
        try {
          await api.addToCart(item.id);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    }
  });
  
  return (
    <FlatList
      data={items}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => selectItem(item.id)}
          style={[
            styles.itemContainer,
            selectedItem?.id === item.id && styles.selectedItem
          ]}
        >
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>${item.price}</Text>
          </View>
          <View style={styles.itemActions}>
            <Button 
              title="View" 
              onPress={() => handleAction('viewDetails', item.id)} 
            />
            <Button 
              title="Add to Cart" 
              onPress={() => handleAction('addToCart', item.id)}
            />
          </View>
        </TouchableOpacity>
      )}
    />
  );
}
```

## State Management Hooks

### useAgentReducer

Creates a reducer that's registered with AgentBridge, allowing agents to dispatch actions.

```jsx
import { useAgentReducer } from '@agentbridge/react-native';

// Define a reducer function
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload],
        totalItems: state.totalItems + 1,
        totalPrice: state.totalPrice + action.payload.price
      };
    case 'REMOVE_ITEM':
      const itemToRemove = state.items.find(item => item.id === action.payload);
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        totalItems: state.totalItems - 1,
        totalPrice: state.totalPrice - (itemToRemove ? itemToRemove.price : 0)
      };
    case 'CLEAR_CART':
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0
      };
    default:
      return state;
  }
}

function CartManager() {
  // Create a reducer that's registered with AgentBridge
  const [cart, dispatch] = useAgentReducer({
    id: 'shopping-cart',
    reducer: cartReducer,
    initialState: {
      items: [],
      totalItems: 0,
      totalPrice: 0
    },
    actionDescriptions: {
      ADD_ITEM: {
        description: 'Add an item to the cart',
        parameters: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Item ID' },
            name: { type: 'string', description: 'Item name' },
            price: { type: 'number', description: 'Item price' }
          },
          required: ['id', 'name', 'price']
        }
      },
      REMOVE_ITEM: {
        description: 'Remove an item from the cart',
        parameters: {
          type: 'string',
          description: 'Item ID to remove'
        }
      },
      CLEAR_CART: {
        description: 'Clear all items from the cart',
        parameters: {}
      }
    }
  });
  
  // Now AI agents can dispatch actions to the cart reducer
  
  return (
    <View style={styles.cartContainer}>
      <Text style={styles.cartTitle}>Shopping Cart</Text>
      <Text style={styles.cartSummary}>
        {cart.totalItems} items, total: ${cart.totalPrice.toFixed(2)}
      </Text>
      
      <FlatList
        data={cart.items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
            <Button
              title="Remove"
              onPress={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
            />
          </View>
        )}
      />
      
      <Button
        title="Clear Cart"
        onPress={() => dispatch({ type: 'CLEAR_CART' })}
      />
    </View>
  );
}
```

### useAgentContext

Creates a context that's registered with AgentBridge, allowing agents to access and update context values.

```jsx
import { useAgentContext, AgentContextProvider } from '@agentbridge/react-native';

// Create an agent-aware context
function App() {
  return (
    <AgentContextProvider
      id="app-settings"
      initialValue={{
        theme: 'light',
        notifications: true,
        language: 'en',
      }}
    >
      <AppContent />
    </AgentContextProvider>
  );
}

function SettingsScreen() {
  // Use the agent context
  const [settings, setSettings] = useAgentContext('app-settings');
  
  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };
  
  const toggleNotifications = () => {
    setSettings(prev => ({
      ...prev,
      notifications: !prev.notifications
    }));
  };
  
  const changeLanguage = (language) => {
    setSettings(prev => ({
      ...prev,
      language
    }));
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.setting}>
        <Text>Theme: {settings.theme}</Text>
        <Button title="Toggle Theme" onPress={toggleTheme} />
      </View>
      
      <View style={styles.setting}>
        <Text>Notifications: {settings.notifications ? 'On' : 'Off'}</Text>
        <Button title="Toggle Notifications" onPress={toggleNotifications} />
      </View>
      
      <View style={styles.setting}>
        <Text>Language: {settings.language}</Text>
        <View style={styles.languageButtons}>
          <Button title="English" onPress={() => changeLanguage('en')} />
          <Button title="Spanish" onPress={() => changeLanguage('es')} />
          <Button title="French" onPress={() => changeLanguage('fr')} />
        </View>
      </View>
    </View>
  );
}
```

## MCP Integration Hooks

### useMCPAdapter

Registers an MCP adapter with AgentBridge.

```jsx
import { useMCPAdapter } from '@agentbridge/react-native';
import { OpenAIMCPAdapter } from '@agentbridge/mcp-openai';

function MCPIntegration() {
  // Register OpenAI MCP adapter with AgentBridge
  useMCPAdapter('openai', () => new OpenAIMCPAdapter());
  
  return null; // This is a utility component with no UI
}
```

### useMCPFunctionCall

Handles MCP function calls from AI models.

```jsx
import { useMCPFunctionCall } from '@agentbridge/react-native';

function AIAssistant() {
  const [messages, setMessages] = useState([]);
  
  // Hook to handle MCP function calls
  const { handleFunctionCall, isProcessing } = useMCPFunctionCall({
    mcpType: 'openai',
    onResult: (result) => {
      // Add the function result to the message list
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'function',
          name: result.functionName,
          content: JSON.stringify(result.data)
        }
      ]);
      
      // In a real app, you'd likely send this back to the AI model
    }
  });
  
  const processAIResponse = (response) => {
    // Add the AI response to messages
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.content
      }
    ]);
    
    // Check if there's a function call to handle
    if (response.function_call) {
      handleFunctionCall(response.function_call);
    }
  };
  
  return (
    <View style={styles.container}>
      <MessageList messages={messages} />
      
      {isProcessing && (
        <View style={styles.processingIndicator}>
          <Text>Processing function call...</Text>
        </View>
      )}
      
      <MessageInput onSendMessage={handleSendMessage} />
    </View>
  );
}
```

## Lifecycle Hooks

### useAgentLifecycle

Registers component lifecycle events with AgentBridge.

```jsx
import { useAgentLifecycle } from '@agentbridge/react-native';

function ScreenComponent({ id }) {
  // Register lifecycle events with AgentBridge
  useAgentLifecycle(id, {
    onMount: () => {
      // Executes when component mounts
      return { screen: id, event: 'mounted' };
    },
    onUpdate: (prevProps) => {
      // Executes when component updates
      return { screen: id, event: 'updated', prevProps };
    },
    onUnmount: () => {
      // Executes when component unmounts
      return { screen: id, event: 'unmounted' };
    }
  });
  
  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>{id}</Text>
      {/* Screen content */}
    </View>
  );
}
```

### useAgentFocus

Registers focus/blur events with AgentBridge.

```jsx
import { useAgentFocus } from '@agentbridge/react-native';

function InputField({ id, label }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  
  // Register focus/blur events with AgentBridge
  useAgentFocus(id, inputRef, {
    onFocus: () => {
      // Executes when input receives focus
      return { input: id, event: 'focus' };
    },
    onBlur: () => {
      // Executes when input loses focus
      return { input: id, value, event: 'blur' };
    }
  });
  
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={setValue}
        style={styles.input}
      />
    </View>
  );
}
```

For more examples of using these hooks, see the [React Native Examples](../../examples/react-native-examples.md) guide. 