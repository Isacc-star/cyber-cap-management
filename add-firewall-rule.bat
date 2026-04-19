@echo off
echo ============================================
echo   添加防火墙规则 - 允许 8000 端口
echo ============================================
echo.
echo 请以管理员身份运行此脚本！
echo.

netsh advfirewall firewall add rule name="Cyber Cap Management Server" dir=in action=allow protocol=tcp localport=8000

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo   防火墙规则添加成功！
    echo   现在其他设备可以访问 http://你的IP:8000
    echo ============================================
) else (
    echo.
    echo 添加失败！请右键此脚本，选择"以管理员身份运行"
)

echo.
pause
