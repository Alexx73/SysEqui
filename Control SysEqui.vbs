Set shell = CreateObject("WScript.Shell")
rootPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
controlPath = rootPath & "\tools\ControlSysEqui"
shell.CurrentDirectory = controlPath
shell.Run "cmd.exe /d /c node server.js --open", 0, False
