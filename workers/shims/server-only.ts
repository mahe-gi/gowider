// Runtime shim for standalone Node/tsx workers to allow server-only imports
// Next.js uses server-only at build-time to prevent client bundling.
import Module from "module";

const originalRequire = (Module.prototype as any).require;
(Module.prototype as any).require = function (id: string, ...args: any[]) {
  if (id === "server-only") {
    return {};
  }
  return originalRequire.call(this, id, ...args);
};
