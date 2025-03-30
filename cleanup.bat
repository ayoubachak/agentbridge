@echo off
echo Cleaning up AgentBridge project structure...

echo.
echo Removing unnecessary directories...

REM Remove src directory (old source files)
if exist src (
    echo Removing src directory...
    rmdir /s /q src
) else (
    echo src directory not found.
)

REM Remove lib directory (old Flutter library)
if exist lib (
    echo Removing lib directory...
    rmdir /s /q lib
) else (
    echo lib directory not found.
)

REM Remove index.ts (root file)
if exist index.ts (
    echo Removing index.ts...
    del index.ts
) else (
    echo index.ts not found.
)

REM Remove packages/core_new (duplicate core package)
if exist packages\core_new (
    echo Removing packages\core_new directory...
    rmdir /s /q packages\core_new
) else (
    echo packages\core_new directory not found.
)

REM Remove packages/mobile (old mobile package structure)
if exist packages\mobile (
    echo Removing packages\mobile directory...
    rmdir /s /q packages\mobile
) else (
    echo packages\mobile directory not found.
)

REM Remove packages/web (old web package structure)
if exist packages\web (
    echo Removing packages\web directory...
    rmdir /s /q packages\web
) else (
    echo packages\web directory not found.
)

echo.
echo Cleanup completed!
echo.
echo To verify the project structure, run: dir /b 