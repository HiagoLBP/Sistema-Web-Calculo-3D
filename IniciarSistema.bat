@echo off
title Mini-ERP 3D
echo =========================================
echo Iniciando o Servidor do Mini-ERP 3D...
echo =========================================

start "" http://localhost:8080/index.html

:: A variavel %~dp0 pega o caminho exato de onde o .bat esta salvo automaticamente
java -jar "%~dp0target\impressao3d-1.0-SNAPSHOT.jar"

pause