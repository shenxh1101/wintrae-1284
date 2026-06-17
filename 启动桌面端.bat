@echo off
chcp 65001 >nul
title 快捷键大师

echo ========================================
echo     快捷键大师 - 桌面端启动
echo ========================================
echo.

cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [信息] 首次运行，正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败，请检查网络连接
        pause
        exit /b 1
    )
    echo.
)

echo [信息] 正在启动快捷键大师...
echo.
call npm start

if %errorlevel% neq 0 (
    echo.
    echo [错误] 启动失败，请检查以上错误信息
    pause
)
