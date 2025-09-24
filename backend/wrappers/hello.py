import ctypes, os
LIB = os.path.join(os.path.dirname(__file__), "..", "plugins", "sample_hello", "build",
                   "libhello.dylib")  # or .so
lib = ctypes.CDLL(LIB)
lib.plugin_execute.argtypes = [ctypes.c_char_p, ctypes.c_char_p, ctypes.c_int]
def run(arg: str) -> str:
    buf = ctypes.create_string_buffer(256)
    lib.plugin_execute(arg.encode(), buf, 256)
    return buf.value.decode()

