@echo off
chcp 65001 >nul 2>&1
echo ============================================
echo   Cyber Cap Fleet Management - 启动服务器
echo ============================================
echo.

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"
set "STATIC=%BACKEND%\static"

if not exist "%STATIC%\index.html" (
    echo [1/2] 前端静态文件不存在，正在构建前端...
    if not exist "%FRONTEND%\node_modules" (
        echo       正在安装前端依赖...
        cd /d "%FRONTEND%"
        call npm install
        if errorlevel 1 (
            echo       前端依赖安装失败！
            pause
            exit /b 1
        )
    )
    echo       正在构建前端...
    cd /d "%FRONTEND%"
    call npm run build
    if errorlevel 1 (
        echo       前端构建失败！
        pause
        exit /b 1
    )
    echo       正在复制构建文件到后端静态目录...
    if not exist "%STATIC%" mkdir "%STATIC%"
    xcopy /E /Y /Q "%FRONTEND%\dist\*" "%STATIC%\"
    echo       前端构建完成！
    echo.
) else (
    echo [1/2] 前端静态文件已存在，跳过构建
    echo.
)

echo [2/2] 正在启动后端服务器...
echo 启动后将在浏览器中打开登录页面
echo 按 Ctrl+C 可停止服务器
echo.

cd /d "%BACKEND%"
start "" "http://localhost:8000/login"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

pause
