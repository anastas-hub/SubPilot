!include "FileFunc.nsh"

Function KillSubPilot
  ; Ferme tous les processus SubPilot.exe
  nsExec::ExecToLog 'taskkill /IM SubPilot.exe /F'
FunctionEnd

Section -PreInstall
  Call KillSubPilot
SectionEnd
