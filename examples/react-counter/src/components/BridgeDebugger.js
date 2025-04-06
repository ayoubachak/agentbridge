import React, { useState, useEffect } from 'react';
import { useAgentBridge } from '@agentbridge/react';
import './BridgeDebugger.css';

function BridgeDebugger() {
  const bridge = useAgentBridge();
  const [components, setComponents] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [showDebugger, setShowDebugger] = useState(false);
  const [testParams, setTestParams] = useState('{}');
  const [testResult, setTestResult] = useState(null);
  const [selectedFunction, setSelectedFunction] = useState('');
  const [selectedComponent, setSelectedComponent] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  
  useEffect(() => {
    if (!bridge) return;
    
    // Retrieve registered components and functions
    const refreshData = () => {
      // Get components
      const registeredComponents = bridge.getComponentRegistry().getComponents();
      setComponents(registeredComponents);
      
      // Get functions
      const registeredFunctions = bridge.getFunctionRegistry().getFunctions();
      setFunctions(registeredFunctions);
      
      // Log to console
      console.group('AgentBridge Registration Check');
      console.log('Registered Components:', registeredComponents);
      console.log('Registered Functions:', registeredFunctions);
      console.groupEnd();
    };
    
    // Initial fetch
    refreshData();
    
    // Set up interval to refresh data
    const intervalId = setInterval(refreshData, 3000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [bridge]);
  
  const handleTestFunction = async () => {
    if (!bridge || !selectedFunction) return;
    
    try {
      const params = JSON.parse(testParams);
      console.log(`Calling function "${selectedFunction}" with params:`, params);
      
      const result = await bridge.callFunction(selectedFunction, params);
      console.log(`Function "${selectedFunction}" result:`, result);
      
      setTestResult({
        success: true,
        data: result
      });
    } catch (error) {
      console.error(`Error calling function "${selectedFunction}":`, error);
      setTestResult({
        success: false,
        error: error.message || 'Unknown error'
      });
    }
  };
  
  const handleTestComponentAction = async () => {
    if (!bridge || !selectedComponent || !selectedAction) return;
    
    try {
      const params = JSON.parse(testParams);
      console.log(`Calling action "${selectedAction}" on component "${selectedComponent}" with params:`, params);
      
      // Get the component
      const component = components.find(c => c.id === selectedComponent);
      if (!component) {
        throw new Error(`Component with ID "${selectedComponent}" not found`);
      }
      
      // Get the action handler
      const action = component.actions[selectedAction];
      if (!action || !action.handler) {
        throw new Error(`Action "${selectedAction}" not found on component "${selectedComponent}"`);
      }
      
      // Call the action
      const result = await action.handler(params);
      console.log(`Action "${selectedAction}" result:`, result);
      
      setTestResult({
        success: true,
        data: result
      });
    } catch (error) {
      console.error(`Error calling action "${selectedAction}" on component "${selectedComponent}":`, error);
      setTestResult({
        success: false,
        error: error.message || 'Unknown error'
      });
    }
  };
  
  if (!bridge) {
    return <div className="bridge-debugger-warning">Bridge not available</div>;
  }
  
  return (
    <div className="bridge-debugger">
      <div className="debugger-header">
        <h3>AgentBridge Debugger</h3>
        <button 
          onClick={() => setShowDebugger(!showDebugger)}
          className="toggle-button"
        >
          {showDebugger ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      {showDebugger && (
        <div className="debugger-content">
          <div className="debugger-section">
            <h4>Registered Components ({components.length})</h4>
            {components.length === 0 ? (
              <p>No components registered</p>
            ) : (
              <ul>
                {components.map((component) => (
                  <li key={component.id}>
                    <strong>{component.name}</strong> ({component.type})
                    <div className="item-details">
                      <div><strong>ID:</strong> {component.id}</div>
                      <div><strong>Description:</strong> {component.description}</div>
                      <div>
                        <strong>Properties:</strong>
                        <pre>{JSON.stringify(component.properties, null, 2)}</pre>
                      </div>
                      <div>
                        <strong>Actions:</strong>
                        <ul>
                          {Object.keys(component.actions || {}).map(actionName => (
                            <li key={actionName}>{actionName}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="debugger-section">
            <h4>Registered Functions ({functions.length})</h4>
            {functions.length === 0 ? (
              <p>No functions registered</p>
            ) : (
              <ul>
                {functions.map((func) => (
                  <li key={func.name}>
                    <strong>{func.name}</strong>
                    <div className="item-details">
                      <div><strong>Description:</strong> {func.description}</div>
                      <div>
                        <strong>Parameters:</strong>
                        <pre>{JSON.stringify(func.parameters, null, 2)}</pre>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="debugger-section">
            <h4>Test Registered Functions</h4>
            <div className="test-area">
              <div className="test-row">
                <label>Function:</label>
                <select 
                  value={selectedFunction}
                  onChange={(e) => setSelectedFunction(e.target.value)}
                >
                  <option value="">Select a function</option>
                  {functions.map(func => (
                    <option key={func.name} value={func.name}>{func.name}</option>
                  ))}
                </select>
              </div>
              <div className="test-row">
                <label>Parameters (JSON):</label>
                <textarea 
                  value={testParams}
                  onChange={(e) => setTestParams(e.target.value)}
                  placeholder='{"param1": "value1"}'
                  rows={3}
                />
              </div>
              <div className="test-actions">
                <button 
                  onClick={handleTestFunction}
                  disabled={!selectedFunction}
                >
                  Test Function
                </button>
              </div>
            </div>
          </div>
          
          <div className="debugger-section">
            <h4>Test Component Actions</h4>
            <div className="test-area">
              <div className="test-row">
                <label>Component:</label>
                <select 
                  value={selectedComponent}
                  onChange={(e) => {
                    setSelectedComponent(e.target.value);
                    setSelectedAction('');
                  }}
                >
                  <option value="">Select a component</option>
                  {components.map(comp => (
                    <option key={comp.id} value={comp.id}>{comp.name}</option>
                  ))}
                </select>
              </div>
              {selectedComponent && (
                <div className="test-row">
                  <label>Action:</label>
                  <select 
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                  >
                    <option value="">Select an action</option>
                    {components
                      .find(c => c.id === selectedComponent)?.actions &&
                      Object.keys(components.find(c => c.id === selectedComponent).actions).map(action => (
                        <option key={action} value={action}>{action}</option>
                      ))
                    }
                  </select>
                </div>
              )}
              <div className="test-row">
                <label>Parameters (JSON):</label>
                <textarea 
                  value={testParams}
                  onChange={(e) => setTestParams(e.target.value)}
                  placeholder='{"param1": "value1"}'
                  rows={3}
                />
              </div>
              <div className="test-actions">
                <button 
                  onClick={handleTestComponentAction}
                  disabled={!selectedComponent || !selectedAction}
                >
                  Test Component Action
                </button>
              </div>
            </div>
          </div>
          
          {testResult && (
            <div className={`result-area ${testResult.success ? 'success' : 'error'}`}>
              <h4>{testResult.success ? 'Success' : 'Error'}</h4>
              <pre>{JSON.stringify(testResult.success ? testResult.data : testResult.error, null, 2)}</pre>
            </div>
          )}
          
          <div className="debugger-actions">
            <button onClick={() => {
              console.log('Bridge instance:', bridge);
              alert('Bridge instance logged to console');
            }}>
              Log Bridge to Console
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BridgeDebugger; 