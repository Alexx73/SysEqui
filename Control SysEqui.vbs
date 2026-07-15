Set shell = CreateObject("WScript.Shell")
rootPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
controlPath = rootPath & "\tools\ControlSysEqui"
shell.CurrentDirectory = controlPath
shell.Run "cmd.exe /d /c if exist C:\nvm4w\nodejs\node.exe set PATH=C:\nvm4w\nodejs;%APPDATA%\npm;%PATH% & node server.js --open", 0, False
