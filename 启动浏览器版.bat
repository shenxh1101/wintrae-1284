@echo off
chcp 65001 >nul
title 快捷键大师

echo ========================================
echo     快捷键大师 - 浏览器版启动
echo ========================================
echo.

cd /d "%~dp0"

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Python，请先安装 Python
    echo 下载地址: https://www.python.org/
    echo.
    pause
    exit /b 1
)

echo [信息] 正在启动本地服务器...
echo [信息] 服务器地址: http://localhost:8080
echo [信息] 按 Ctrl+C 可停止服务器
echo.

start http://localhost:8080
python -m http.server 8080
