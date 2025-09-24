import importlib, pathlib, ctypes
class PluginManager:
    def __init__(self, root: pathlib.Path):
        self.root = root
        self.libs = []

    def load_all(self):
        for so in self.root.rglob("*.so"):
            self.libs.append(ctypes.CDLL(str(so)))
        for dylib in self.root.rglob("*.dylib"):
            self.libs.append(ctypes.CDLL(str(dylib)))

