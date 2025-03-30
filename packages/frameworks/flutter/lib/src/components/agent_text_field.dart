import 'package:flutter/material.dart';

import '../utils.dart';
import '../provider.dart';

/// Text field widget that can be controlled by AI agents
class AgentTextField extends StatefulWidget {
  /// Unique identifier for the text field
  final String agentId;

  /// Component type (default: 'textField')
  final String agentType;

  /// Initial value of the text field
  final String initialValue;

  /// Hint text for the text field
  final String? hintText;

  /// Whether the text field is enabled
  final bool enabled;

  /// Callback when the text field value changes
  final ValueChanged<String>? onChanged;

  /// Callback when the user submits the text field
  final ValueChanged<String>? onSubmitted;

  /// Text input type
  final TextInputType? keyboardType;

  /// Text input action
  final TextInputAction? textInputAction;

  /// Additional properties to expose to the AI agent
  final Map<String, dynamic> agentProps;

  /// Create a new AgentTextField
  const AgentTextField({
    Key? key,
    required this.agentId,
    this.agentType = 'textField',
    this.initialValue = '',
    this.hintText,
    this.enabled = true,
    this.onChanged,
    this.onSubmitted,
    this.keyboardType,
    this.textInputAction,
    this.agentProps = const {},
  }) : super(key: key);

  @override
  _AgentTextFieldState createState() => _AgentTextFieldState();
}

class _AgentTextFieldState extends State<AgentTextField>
    with AgentComponentMixin {
  late TextEditingController _controller;

  @override
  String get agentId => widget.agentId;

  @override
  String get agentType => widget.agentType;

  @override
  Map<String, dynamic> get agentProps => {
        ...widget.agentProps,
        'enabled': widget.enabled,
        'hintText': widget.hintText,
        'keyboardType': widget.keyboardType?.toString(),
      };

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialValue);

    // Initialize the state with the initial value
    updateAgentState({
      'value': widget.initialValue,
    });

    // Listen for changes from the adapter
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final adapter = context.adapter();
      final component = adapter.getComponent(widget.agentId);
      if (component != null && component.state.containsKey('value')) {
        final value = component.state['value'] as String;
        if (value != _controller.text) {
          _controller.text = value;
        }
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleChanged(String value) {
    // Update state to reflect the new value
    updateAgentState({
      'value': value,
      'lastChanged': DateTime.now().toIso8601String(),
    });

    // Call the onChange callback if provided
    widget.onChanged?.call(value);
  }

  void _handleSubmitted(String value) {
    // Update state to reflect the submission
    updateAgentState({
      'submitted': true,
      'lastSubmitted': DateTime.now().toIso8601String(),
    });

    // Call the onSubmitted callback if provided
    widget.onSubmitted?.call(value);
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: _controller,
      enabled: widget.enabled,
      onChanged: _handleChanged,
      onSubmitted: _handleSubmitted,
      keyboardType: widget.keyboardType,
      textInputAction: widget.textInputAction,
      decoration: InputDecoration(
        hintText: widget.hintText,
      ),
    );
  }
}
