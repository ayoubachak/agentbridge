import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CounterComponent } from './components/counter.component';
import { AgentBridgeService } from './services/agent-bridge.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CounterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'Angular Counter Example';
  
  // Computed signals from AgentBridge service
  connectionStatus = computed(() => this.agentBridge.connectionStatus());
  componentCount = computed(() => this.agentBridge.componentCount());
  functionCount = computed(() => this.agentBridge.functionCount());
  
  // Connection status badge classes
  statusBadgeClass = computed(() => {
    const status = this.connectionStatus();
    return {
      'status-badge': true,
      'status-connected': status === 'connected',
      'status-connecting': status === 'connecting',
      'status-disconnected': status === 'disconnected'
    };
  });
  
  // Connection status text
  statusText = computed(() => {
    const status = this.connectionStatus();
    switch (status) {
      case 'connected': return '✅ Connected to Server';
      case 'connecting': return '⏳ Connecting to Server...';
      case 'disconnected': return '❌ Disconnected from Server';
    }
  });
  
  constructor(public agentBridge: AgentBridgeService) {}
}
