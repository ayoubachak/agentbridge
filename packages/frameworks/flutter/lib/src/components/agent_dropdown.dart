import 'package:flutter/material.dart';

import '../utils.dart';
import '../provider.dart';

/// Dropdown widget that can be controlled by AI agents
class AgentDropdown<T> extends StatefulWidget {
  /// Unique identifier for the dropdown
  final String agentId;

  /// Component type (default: 'dropdown')
  final String agentType;

  /// Available options for the dropdown
  final List<DropdownMenuItem<T>> items;

  /// Initial value of the dropdown
  final T? initialValue;

  /// Whether the dropdown is enabled
  final bool enabled;

  /// Callback when the dropdown value changes
  final ValueChanged<T?>? onChanged;

  /// Hint text for the dropdown
  final Widget? hint;

  /// Additional properties to expose to the AI agent
  final Map<String, dynamic> agentProps;

  /// Create a new AgentDropdown
  const AgentDropdown({
    Key? key,
    required this.agentId,
    this.agentType = 'dropdown',
    required this.items,
    this.initialValue,
    this.enabled = true,
    this.onChanged,
    this.hint,
    this.agentProps = const {},
  }) : super(key: key);

  @override
  _AgentDropdownState<T> createState() => _AgentDropdownState<T>();
}

class _AgentDropdownState<T> extends State<AgentDropdown<T>>
    with AgentComponentMixin {
  late T? _value;

  @override
  String get agentId => widget.agentId;

  @override
  String get agentType => widget.agentType;

  @override
  Map<String, dynamic> get agentProps => {
        ...widget.agentProps,
        'enabled': widget.enabled,
        'options': widget.items.map((item) => item.value.toString()).toList(),
      };

  @override
  void initState() {
    super.initState();
    _value = widget.initialValue;

    // Initialize the state with the initial value
    updateAgentState({
      'value': widget.initialValue?.toString(),
    });

    // Listen for changes from the adapter
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final adapter = context.adapter();
      final component = adapter.getComponent(widget.agentId);
      if (component != null && component.state.containsKey('value')) {
        final valueStr = component.state['value'] as String?;
        if (valueStr != null) {
          // Find the matching item by string representation
          for (final item in widget.items) {
            if (item.value.toString() == valueStr && item.value != _value) {
              setState(() {
                _value = item.value as T;
              });
              break;
            }
          }
        }
      }
    });
  }

  void _handleChanged(T? value) {
    setState(() {
      _value = value;
    });

    // Update state to reflect the new value
    updateAgentState({
      'value': value?.toString(),
      'lastChanged': DateTime.now().toIso8601String(),
    });

    // Call the onChange callback if provided
    widget.onChanged?.call(value);
  }

  @override
  Widget build(BuildContext context) {
    return DropdownButton<T>(
      value: _value,
      items: widget.items,
      onChanged: widget.enabled ? _handleChanged : null,
      hint: widget.hint,
    );
  }
}
