// This script checks for failed Mermaid diagrams and attempts to fix them
(function() {
  // Wait until page is fully loaded
  window.addEventListener('load', function() {
    // Wait a bit to ensure Mermaid has tried to process diagrams
    setTimeout(function() {
      console.log("Running Mermaid fixes...");
      
      // Find all diagrams with error messages
      const errorDiagrams = document.querySelectorAll('.mermaid svg text.error-text');
      if (errorDiagrams.length > 0) {
        console.warn(`Found ${errorDiagrams.length} failed Mermaid diagrams. Attempting to fix...`);
        
        // For each diagram with an error
        errorDiagrams.forEach(function(errorText) {
          try {
            // Find the parent container
            const svgElement = errorText.closest('svg');
            const mermaidDiv = svgElement ? svgElement.closest('.mermaid') : null;
            
            if (mermaidDiv) {
              // Get the original Mermaid code 
              const origCode = mermaidDiv.getAttribute('data-diagram');
              
              if (origCode) {
                console.log("Retrying diagram:", origCode.substring(0, 50) + "...");
                
                // Clear the div
                mermaidDiv.innerHTML = origCode;
                
                // Remove the processed attribute to let Mermaid try again
                mermaidDiv.removeAttribute('data-processed');
                
                // Add a class to track our fix attempts
                mermaidDiv.classList.add('mermaid-fix-attempted');
              }
            }
          } catch (e) {
            console.error("Error fixing Mermaid diagram:", e);
          }
        });
        
        // Try to reinitialize Mermaid
        if (typeof mermaid !== 'undefined') {
          try {
            console.log("Reinitializing Mermaid...");
            mermaid.init(undefined, '.mermaid:not([data-processed])');
          } catch (e) {
            console.error("Error reinitializing Mermaid:", e);
          }
        }
      } else {
        console.log("No failed Mermaid diagrams found.");
      }
      
      // Store original diagram code for debugging
      document.querySelectorAll('.mermaid').forEach(function(diagram) {
        if (!diagram.getAttribute('data-diagram')) {
          diagram.setAttribute('data-diagram', diagram.textContent.trim());
        }
      });
    }, 2000);
  });
})(); 