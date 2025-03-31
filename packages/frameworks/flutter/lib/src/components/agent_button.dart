import 'package:flutter/material.dart';

import '../utils.dart';

/// Button widget that can be controlled by AI agents
class AgentButton extends StatefulWidget {
  /// Unique identifier for the button
  final String agentId;

  /// Component type (default: 'button')
  final String agentType;

  /// Component description
  final String agentDescription;

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
    this.agentDescription = 'Button that can be controlled by AI agents',
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
  String get agentDescription => widget.agentDescription;

  @override
  Map<String, dynamic> get agentProps => {
        ...widget.agentProps,
        'enabled': widget.enabled,
      };

  @override
  Map<String, Map<String, dynamic>> get agentActions => {
        'press': {
          'description': 'Press the button',
          'parameters': {},
        },
      };

  @override
  Map<String, Function> get agentActionHandlers => {
        'press': (params) {
          if (widget.enabled && widget.onPressed != null) {
            widget.onPressed!();
            return {'success': true, 'message': 'Button pressed'};
          }
          return {
            'success': false,
            'message': widget.enabled
                ? 'No press handler defined'
                : 'Button is disabled'
          };
        },
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
