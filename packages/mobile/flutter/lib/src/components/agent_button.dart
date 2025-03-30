import 'package:flutter/material.dart';

import '../utils.dart';

/// Button widget that can be controlled by AI agents
class AgentButton extends StatefulWidget {
  /// Unique identifier for the button
  final String agentId;

  /// Component type (default: 'button')
  final String agentType;

  /// Button label
  final Widget child;

  /// Callback when the button is pressed
  final VoidCallback? onPressed;

  /// Whether the button is enabled
  final bool enabled;

  /// Additional properties to expose to the AI agent
  final Map<String, dynamic> agentProps;

  /// Button style
  final ButtonStyle? style;

  /// Create a new AgentButton
  const AgentButton({
    Key? key,
    required this.agentId,
    this.agentType = 'button',
    required this.child,
    this.onPressed,
    this.enabled = true,
    this.agentProps = const {},
    this.style,
  }) : super(key: key);

  @override
  _AgentButtonState createState() => _AgentButtonState();
}

class _AgentButtonState extends State<AgentButton> with AgentComponentMixin {
  @override
  String get agentId => widget.agentId;

  @override
  String get agentType => widget.agentType;

  @override
  Map<String, dynamic> get agentProps => {
        ...widget.agentProps,
        'enabled': widget.enabled,
      };

  void _handlePressed() {
    // Update state to reflect the click
    updateAgentState({
      'lastClicked': DateTime.now().toIso8601String(),
    });

    // Call the onPressed callback if provided
    widget.onPressed?.call();
  }

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: widget.enabled ? _handlePressed : null,
      style: widget.style,
      child: widget.child,
    );
  }
}
