# Mermaid Test Page

This page contains test diagrams to verify Mermaid functionality.

## Simple Flowchart

```mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
```

## Simple Sequence Diagram

```mermaid
sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
```

## Simple Class Diagram

```mermaid
classDiagram
    class Animal {
        +name: string
        +move(): void
    }
    class Dog {
        +bark(): void
    }
    Animal <|-- Dog
```

## Simple State Diagram

```mermaid
stateDiagram-v2
    [*] --> Still
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]
```

## Simple Gantt Chart

```mermaid
gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2023-01-01, 30d
    Another task     :after a1, 20d
```

## Simple ER Diagram

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
``` 