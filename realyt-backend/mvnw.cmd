@echo off
setlocal
set MAVEN_VERSION=3.9.5
set ROOT_DIR=%~dp0
set MAVEN_DIR=%ROOT_DIR%\.mvn\wrapper\apache-maven-%MAVEN_VERSION%
if not exist "%MAVEN_DIR%\bin\mvn.cmd" (
  echo Downloading Apache Maven %MAVEN_VERSION%...
  powershell -Command "$out='%TEMP%\\maven.zip'; Invoke-WebRequest -Uri 'https://archive.apache.org/dist/maven/maven-3/3.9.5/binaries/apache-maven-3.9.5-bin.zip' -OutFile $out; Expand-Archive -Path $out -DestinationPath '%ROOT_DIR%\.mvn\\wrapper' -Force"
)
"%MAVEN_DIR%\bin\mvn.cmd" %*
