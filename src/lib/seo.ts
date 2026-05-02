import type { Metadata } from "next";

export function withCanonical(meta: Metadata, pathname: string): Metadata {
  return {
    ...meta,
    alternates: {
      ...(meta.alternates ?? {}),
      canonical: pathname,
    },
  };
}
