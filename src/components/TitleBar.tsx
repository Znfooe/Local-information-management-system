import { Minus, Square, X } from "lucide-react";

export function TitleBar() {
  const handleMinimize = () => {
    // @ts-ignore
    window.electronAPI.minimize();
  };

  const handleMaximize = () => {
    // @ts-ignore
    window.electronAPI.maximize();
  };

  const handleClose = () => {
    // @ts-ignore
    window.electronAPI.close();
  };

  return (
    <div className="h-8 bg-background border-b flex items-center justify-between select-none" style={{ WebkitAppRegion: "drag" } as any}>
      <div className="px-4 text-xs font-medium text-muted-foreground">DesktopAppPlus</div>
      <div className="flex h-full" style={{ WebkitAppRegion: "no-drag" } as any}>
        <button
          onClick={handleMinimize}
          className="h-full px-4 hover:bg-muted inline-flex items-center justify-center transition-colors"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={handleMaximize}
          className="h-full px-4 hover:bg-muted inline-flex items-center justify-center transition-colors"
        >
          <Square className="h-3 w-3" />
        </button>
        <button
          onClick={handleClose}
          className="h-full px-4 hover:bg-destructive hover:text-destructive-foreground inline-flex items-center justify-center transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}