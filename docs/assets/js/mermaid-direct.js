// Direct rendering for Mermaid diagrams that bypasses MkDocs processing
document.addEventListener('DOMContentLoaded', function() {
  // We'll try this approach if standard initialization fails
  window.renderMermaidDirectly = function() {
    console.log("Attempting direct Mermaid rendering...");
    
    // Find all mermaid divs
    const mermaidDivs = document.querySelectorAll('.mermaid');
    let renderedCount = 0;
    
    mermaidDivs.forEach(function(element, index) {
      // Skip already processed divs
      if (element.getAttribute('data-direct-processed') === 'true') {
        return;
      }
      
      try {
        // Get diagram code
        const graphCode = element.textContent.trim();
        if (!graphCode) return;
        
        // Generate a unique ID for this diagram
        const id = `mermaid-diagram-${index}`;
        
        // Create temporary container for rendered SVG
        const tempContainer = document.createElement('div');
        tempContainer.style.display = 'none';
        document.body.appendChild(tempContainer);
        
        console.log(`Rendering diagram ${index} directly...`);
        
        // Use mermaidAPI to render
        try {
          mermaidAPI.render(id, graphCode, function(svgCode) {
            // Replace content with SVG
            element.innerHTML = svgCode;
            element.setAttribute('data-direct-processed', 'true');
            renderedCount++;
            console.log(`Direct rendering successful for diagram ${index}`);
          }, tempContainer);
        } catch (renderError) {
          console.error(`Error directly rendering diagram ${index}:`, renderError);
          
          // Simplified fallback - use a different approach
          try {
            // Just try to reinitialize with mermaid.init on this specific element
            element.innerHTML = graphCode;
            mermaid.init(undefined, element);
            element.setAttribute('data-direct-processed', 'true');
            renderedCount++;
            console.log(`Fallback rendering successful for diagram ${index}`);
          } catch (fallbackError) {
            console.error(`Fallback rendering also failed for diagram ${index}:`, fallbackError);
          }
        }
        
        // Clean up
        if (tempContainer) {
          document.body.removeChild(tempContainer);
        }
      } catch (e) {
        console.error(`Error processing diagram ${index}:`, e);
      }
    });
    
    console.log(`Direct rendering attempted on ${mermaidDivs.length} diagrams, ${renderedCount} succeeded`);
  };
  
  // Wait to see if standard initialization works
  setTimeout(function() {
    // Check if any diagrams failed to render
    const errorDiagrams = document.querySelectorAll('.mermaid svg text.error-text');
    if (errorDiagrams.length > 0) {
      console.warn(`Standard rendering failed for ${errorDiagrams.length} diagrams, trying direct rendering...`);
      window.renderMermaidDirectly();
    }
  }, 3000);
}); 