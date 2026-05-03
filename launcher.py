import tkinter as tk
from tkinter import messagebox, scrolledtext
import subprocess
import threading
import os
import sys
import signal
from pathlib import Path

class TouraaLauncher:
    def __init__(self, root):
        self.root = root
        self.root.title("Touraa System Launcher")
        self.root.geometry("700x500")
        self.root.configure(bg="#f0f2f5")

        self.processes = []
        self.is_running = False

        self.setup_ui()

    def setup_ui(self):
        # Header
        header = tk.Frame(self.root, bg="#555D3D", height=80)
        header.pack(fill="x")
        
        title = tk.Label(header, text="Touraa - Car Rental Management System", 
                         font=("Helvetica", 16, "bold"), bg="#555D3D", fg="white", pady=20)
        title.pack()

        # Controls
        ctrl_frame = tk.Frame(self.root, bg="#f0f2f5", pady=20)
        ctrl_frame.pack(fill="x")

        self.start_btn = tk.Button(ctrl_frame, text="🚀 START SYSTEM", font=("Helvetica", 12, "bold"),
                                  bg="#EBA130", fg="white", width=20, height=2,
                                  command=self.start_all)
        self.start_btn.pack(side="left", padx=50)

        self.stop_btn = tk.Button(ctrl_frame, text="🛑 STOP SYSTEM", font=("Helvetica", 12, "bold"),
                                 bg="#ea4335", fg="white", width=20, height=2,
                                 command=self.stop_all, state="disabled")
        self.stop_btn.pack(side="right", padx=50)

        # Log Window
        log_label = tk.Label(self.root, text="System Logs", font=("Helvetica", 10, "bold"), bg="#f0f2f5")
        log_label.pack(pady=(10, 0))

        self.log_area = scrolledtext.ScrolledText(self.root, wrap=tk.WORD, height=15, 
                                                 bg="#1e1e1e", fg="#d4d4d4", font=("Consolas", 10))
        self.log_area.pack(padx=20, pady=10, fill="both", expand=True)

        self.status_bar = tk.Label(self.root, text="Status: Ready", bd=1, relief=tk.SUNKEN, anchor=tk.W)
        self.status_bar.pack(side=tk.BOTTOM, fill="x")

    def log(self, message):
        self.log_area.insert(tk.END, message + "\n")
        self.log_area.see(tk.END)

    def start_all(self):
        if self.is_running:
            return

        self.is_running = True
        self.start_btn.config(state="disabled")
        self.stop_btn.config(state="normal")
        self.status_bar.config(text="Status: Starting...")
        self.log_area.delete(1.0, tk.END)

        # Start Backend
        threading.Thread(target=self.run_process, args=("Backend", "backend", self.get_backend_cmd()), daemon=True).start()
        # Start Frontend
        # On Windows, 'npm' often needs shell=True to be found
        threading.Thread(target=self.run_process, args=("Frontend", "frontend", ["npm", "start"], True), daemon=True).start()

    def get_backend_cmd(self):
        root_dir = Path(os.getcwd())
        venv_python = root_dir / "backend" / "venv" / "Scripts" / "python.exe"
        
        if venv_python.exists():
            return [str(venv_python), "-m", "uvicorn", "server:app", "--reload"]
        
        # Fallback to system python
        return ["python", "-m", "uvicorn", "server:app", "--reload"]

    def run_process(self, name, directory, command, use_shell=False):
        try:
            self.log(f"[{name}] Starting in {directory}: {' '.join(command)}")
            process = subprocess.Popen(
                command,
                cwd=os.path.join(os.getcwd(), directory),
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                shell=use_shell,
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == 'win32' else 0
            )
            self.processes.append(process)

            for line in iter(process.stdout.readline, ''):
                self.log(f"[{name}] {line.strip()}")
            
            process.stdout.close()
            return_code = process.wait()
            self.log(f"[{name}] Process exited with code {return_code}")
        except Exception as e:
            self.log(f"[{name}] Error: {str(e)}")

    def stop_all(self):
        self.status_bar.config(text="Status: Stopping...")
        for p in self.processes:
            try:
                if sys.platform == 'win32':
                    subprocess.run(['taskkill', '/F', '/T', '/PID', str(p.pid)], capture_output=True)
                else:
                    os.killpg(os.getpgid(p.pid), signal.SIGTERM)
            except:
                pass
        
        self.processes = []
        self.is_running = False
        self.start_btn.config(state="normal")
        self.stop_btn.config(state="disabled")
        self.status_bar.config(text="Status: Stopped")
        self.log("System shutdown complete.")

    def on_closing(self):
        if self.is_running:
            if messagebox.askokcancel("Quit", "System is still running. Stop and quit?"):
                self.stop_all()
                self.root.destroy()
        else:
            self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = TouraaLauncher(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()
