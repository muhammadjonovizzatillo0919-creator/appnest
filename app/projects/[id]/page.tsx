"use client";

import { useParams } from "next/navigation";
import { BuilderShell } from "@/components/builder/BuilderShell";

export default function BuilderPage() {
  const params = useParams<{ id: string }>();
  const projectId = String(params.id ?? "");

  return <BuilderShell projectId={projectId} />;
}
