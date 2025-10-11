import importlib
import pathlib
import ctypes
from types import ModuleType
from typing import List


class PluginManager:
    """
    Simple plugin manager capable of loading both native (.so/.dylib) and
    Python-based plugins.

    Python plugins are expected to be importable modules exposing a
    `register(app)` function which receives the FastAPI app and registers
    any routes, startup hooks, etc.
    """

    def __init__(self, root: pathlib.Path):
        self.root = root
        self.libs: List[ctypes.CDLL] = []
        self.py_plugins: List[ModuleType] = []

    def load_native_libs(self):
        for so in self.root.rglob("*.so"):
            self.libs.append(ctypes.CDLL(str(so)))
        for dylib in self.root.rglob("*.dylib"):
            self.libs.append(ctypes.CDLL(str(dylib)))

    def discover_python_plugins(self, package_root_name: str = "plugins"):
        """
        Discover python plugins under `self.root` where each plugin is a
        subfolder containing a `plugin.py` file and forms a Python package.
        The corresponding import path becomes `{package_root_name}.<name>.plugin`.
        """
        for child in self.root.iterdir():
            if not child.is_dir():
                continue
            plugin_py = child / "plugin.py"
            init_py = child / "__init__.py"
            if plugin_py.exists() and init_py.exists():
                module_name = f"{package_root_name}.{child.name}.plugin"
                try:
                    mod = importlib.import_module(module_name)
                    self.py_plugins.append(mod)
                except Exception as e:
                    print(f"[plugin-manager] Failed to import {module_name}: {e}")

    def register_all(self, app):
        for mod in self.py_plugins:
            try:
                if hasattr(mod, "register") and callable(getattr(mod, "register")):
                    mod.register(app)
                else:
                    print(
                        f"[plugin-manager] Module {mod.__name__} has no register(app)"
                    )
            except Exception as e:
                print(f"[plugin-manager] Plugin {mod.__name__} register() failed: {e}")

    def load_all(self):
        # Maintain backwards-compatibility for native libs
        self.load_native_libs()

