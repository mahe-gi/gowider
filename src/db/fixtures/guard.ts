export function assertDevelopmentEnvironment(): void {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  ) {
    throw new Error(
      "FATAL: Development fixtures and test seeds cannot be executed in a production environment."
    );
  }
}
