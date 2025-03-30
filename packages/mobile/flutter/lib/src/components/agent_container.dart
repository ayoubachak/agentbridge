import 'package:flutter/material.dart';

import '../adapter.dart';
import '../provider.dart';
import '../utils.dart';

/// Container widget that can be controlled by AI agents
class AgentContainer extends StatefulWidget {
  /// Unique identifier for the container
  final String agentId;

  /// Component type (default: 'container')
  final String agentType;

  /// Child widget
  final Widget child;

  /// Whether the container has a border
  final bool hasBorder;

  /// Border radius
  final double borderRadius;

  /// Padding
  final EdgeInsets? padding;

  /// Background color
  final Color? backgroundColor;

  /// Additional properties to expose to the AI agent
  final Map<String, dynamic> agentProps;

  /// Create a new AgentContainer
  const AgentContainer({
    Key? key,
    required this.agentId,
    this.agentType = 'container',
    required this.child,
    this.hasBorder = false,
    this.borderRadius = 4.0,
    this.padding,
    this.backgroundColor,
    this.agentProps = const {},
  }) : super(key: key);

  @override
  _AgentContainerState createState() => _AgentContainerState();
}

class _AgentContainerState extends State<AgentContainer>
    with AgentComponentMixin {
  @override
  String get agentId => widget.agentId;

  @override
  String get agentType => widget.agentType;

  @override
  Map<String, dynamic> get agentProps => {
        ...widget.agentProps,
        'hasBorder': widget.hasBorder,
        'borderRadius': widget.borderRadius,
        'hasBackgroundColor': widget.backgroundColor != null,
      };

  @override
  void initState() {
    super.initState();

    // Initialize the state
    updateAgentState({
      'visible': true,
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: widget.padding,
      decoration: BoxDecoration(
        color: widget.backgroundColor,
        borderRadius: BorderRadius.circular(widget.borderRadius),
        border: widget.hasBorder
            ? Border.all(color: Theme.of(context).dividerColor)
            : null,
      ),
      child: widget.child,
    );
  }
}
