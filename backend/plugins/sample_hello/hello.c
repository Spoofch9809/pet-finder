#include <stdio.h>
#ifdef _WIN32
#define API __declspec(dllexport)
#else
#define API
#endif

API const char* plugin_name() { return "hello"; }
API int plugin_version() { return 1; }
API void plugin_execute(const char* arg, char* out, int out_len) {
  snprintf(out, out_len, "Hello, %s!", arg);
}

