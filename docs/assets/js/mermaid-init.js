// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Configure Mermaid with these settings before initializing
  window.mermaid = {
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'basis'
    },
    er: {
      useMaxWidth: true
    },
    sequence: {
      useMaxWidth: true,
      showSequenceNumbers: false,
      mirrorActors: false,
      diagramMarginX: 50,
      diagramMarginY: 10,
      boxMargin: 10
    },
    gantt: {
      useMaxWidth: true,
      topPadding: 50,
      leftPadding: 75
    },
    classDiagram: {
      useMaxWidth: true
    },
    stateDiagram: {
      useMaxWidth: true,
      dividerMargin: 10,
      sizeUnit: 5
    }
  };

  // Initialize Mermaid with error handling
  try {
    mermaid.initialize(window.mermaid);
    console.log("Mermaid initialized successfully");

    // Add a small delay before processing diagrams to ensure DOM is ready
    setTimeout(function() {
      try {
        mermaid.init(undefined, '.mermaid');
        console.log("Mermaid diagrams processed successfully");
      } catch (err) {
        console.error("Error processing Mermaid diagrams:", err);
      }
    }, 500);
  } catch (err) {
    console.error("Error initializing Mermaid:", err);
  }
}); 