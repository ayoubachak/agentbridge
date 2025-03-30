#!/usr/bin/env python3
"""
Setup script for the AgentBridge documentation website.
This script sets up the MkDocs environment and creates necessary directories.
"""

import os
import shutil
import subprocess
import sys
from pathlib import Path

# Directories to create
DOCS_DIRS = [
    "docs/assets",
    "docs/getting-started",
    "docs/core",
    "docs/web/react",
    "docs/web/angular",
    "docs/mobile/react-native",
    "docs/mobile/flutter",
    "docs/advanced",
    "docs/development",
]

def create_directories():
    """Create all documentation directories."""
    for directory in DOCS_DIRS:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"Created directory: {directory}")

def install_dependencies():
    """Install MkDocs and required plugins."""
    try:
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "mkdocs", "mkdocs-material", "pymdown-extensions", "mkdocs-git-revision-date-localized-plugin"],
            check=True
        )
        print("Successfully installed MkDocs and required plugins.")
    except subprocess.CalledProcessError as e:
        print(f"Error installing dependencies: {e}")
        sys.exit(1)

def create_placeholder_files():
    """Create placeholder files for documentation pages that don't exist yet."""
    # Create placeholder for architecture diagram
    arch_diagram_path = Path("docs/assets/agentbridge-architecture.png")
    if not arch_diagram_path.exists():
        print(f"Note: Please create an architecture diagram at {arch_diagram_path}")
    
    # List of all expected markdown files based on mkdocs.yml
    expected_files = [
        "docs/index.md",
        "docs/getting-started/installation.md",
        "docs/getting-started/quick-start.md",
        "docs/core/overview.md",
        "docs/core/api-reference.md",
        "docs/core/function-registry.md",
        "docs/core/type-system.md",
        "docs/web/react/overview.md",
        "docs/web/react/components.md",
        "docs/web/react/hooks.md",
        "docs/web/angular/overview.md",
        "docs/web/angular/components.md",
        "docs/web/angular/services.md",
        "docs/mobile/react-native/overview.md",
        "docs/mobile/react-native/components.md",
        "docs/mobile/flutter/overview.md",
        "docs/mobile/flutter/components.md",
        "docs/advanced/authentication.md",
        "docs/advanced/error-handling.md",
        "docs/advanced/custom-adapters.md",
        "docs/development/contributing.md",
        "docs/development/architecture.md",
    ]
    
    # Create placeholder content for missing files
    for file_path in expected_files:
        path = Path(file_path)
        if not path.exists():
            title = path.stem.replace('-', ' ').title()
            parent = path.parent.name.replace('-', ' ').title()
            content = f"""# {title}

This page is under construction. It will contain documentation about {title} in the {parent} section.

## Coming Soon

Check back soon for detailed documentation on this topic.
"""
            path.write_text(content)
            print(f"Created placeholder file: {file_path}")

def build_documentation():
    """Build the documentation website."""
    try:
        subprocess.run(["mkdocs", "build"], check=True)
        print("Documentation built successfully. You can find the output in the 'site' directory.")
    except subprocess.CalledProcessError as e:
        print(f"Error building documentation: {e}")
        sys.exit(1)

def serve_documentation():
    """Serve the documentation website locally."""
    try:
        print("Serving documentation at http://127.0.0.1:8000/")
        print("Press Ctrl+C to stop the server.")
        subprocess.run(["mkdocs", "serve"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error serving documentation: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nServer stopped.")

def main():
    """Main function."""
    print("Setting up AgentBridge documentation...")
    
    # Ensure mkdocs.yml exists
    if not Path("mkdocs.yml").exists():
        print("Error: mkdocs.yml not found. Please create it first.")
        sys.exit(1)
    
    create_directories()
    install_dependencies()
    create_placeholder_files()
    
    # Ask user what to do next
    while True:
        print("\nWhat would you like to do next?")
        print("1. Build documentation")
        print("2. Serve documentation locally")
        print("3. Exit")
        choice = input("Enter your choice (1-3): ")
        
        if choice == '1':
            build_documentation()
        elif choice == '2':
            serve_documentation()
        elif choice == '3':
            print("Exiting...")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()