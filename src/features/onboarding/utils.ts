import slugify from "slugify";

export function generateDeterministicProjectSlug(title: string, attempt = 0): string {
  let base = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });

  // Ensure slug matches pattern ^[a-z0-9]+(-[a-z0-9]+)*$
  base = base.replace(/^-+|-+$/g, "");
  if (!base) {
    base = "project";
  }

  if (attempt === 0) {
    return base.slice(0, 100);
  }

  const suffix = `-${attempt}`;
  const maxBaseLen = 100 - suffix.length;
  return `${base.slice(0, maxBaseLen)}${suffix}`;
}
