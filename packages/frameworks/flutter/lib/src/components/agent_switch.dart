import 'package:flutter/material.dart';

import '../utils.dart';
import '../provider.dart';

/// Toggle switch widget that can be controlled by AI agents
class AgentSwitch extends StatefulWidget {
  /// Unique identifier for the switch
  final String agentId;

  /// Component type (default: 'switch')
  final String agentType;

  /// Initial value of the switch
  final bool initialValue;

  /// Whether the switch is enabled
  final bool enabled;

  /// Callback when the switch value changes
  final ValueChanged<bool>? onChanged;

  /// Additional properties to expose to the AI agent
  final Map<String, dynamic> agentProps;

  /// Active color of the switch
  final Color? activeColor;

  /// Inactive color of the switch
  final Color? inactiveColor;

  /// Create a new AgentSwitch
  const AgentSwitch({
    Key? key,
    required this.agentId,
    this.agentType = 'switch',
    this.initialValue = false,
    this.enabled = true,
    this.onChanged,
    this.activeColor,
    this.inactiveColor,
    this.agentProps = const {},
  }) : super(key: key);

  @override
  _AgentSwitchState createState() => _AgentSwitchState();
}

class _AgentSwitchState extends State<AgentSwitch> with AgentComponentMixin {
  late bool _value;

  @override
  String get agentId => widget.agentId;

  @override
  String get agentType => widget.agentType;

  @override
  Map<String, dynamic> get agentProps => {
        ...widget.agentProps,
        'enabled': widget.enabled,
      };

  @override
  void initState() {
    super.initState();
    _value = widget.initialValue;

    // Initialize the state with the initial value
    updateAgentState({
      'value': widget.initialValue,
    });

    // Listen for changes from the adapter
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final adapter = context.adapter();
      final component = adapter.getComponent(widget.agentId);
      if (component != null && component.state.containsKey('value')) {
        final value = component.state['value'] as bool;
        if (value != _value) {
          setState(() {
            _value = value;
          });
        }
      }
    });
  }

  void _handleChanged(bool value) {
    setState(() {
      _value = value;
    });

    // Update state to reflect the new value
    updateAgentState({
      'value': value,
      'lastChanged': DateTime.now().toIso8601String(),
    });

    // Call the onChange callback if provided
    widget.onChanged?.call(value);
  }

  @override
  Widget build(BuildContext context) {
    return Switch(
      value: _value,
      onChanged: widget.enabled ? _handleChanged : null,
      activeColor: widget.activeColor,
      inactiveThumbColor: widget.inactiveColor,
    );
  }
}
