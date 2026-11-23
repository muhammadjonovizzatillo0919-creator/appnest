/**
 * "1+1" qoidasi — tariflar va cheklovlar.
 *
 * вљ пёЏ Bu tekshiruv **faqat UI da emas, serverda** ham bajariladi.
 * Foydalanuvchi API'ni to'g'ridan-to'g'ri chaqirib cheklovni ayla o'tkaza olmaydi.
 */

export type Plan = "free" | "pro";
export type UserRole = "user" | "superadmin";

export interface EntitlementUser {
  id: string;
  role: UserRole;
  plan: Plan;
}

export const PLAN_LIMITS = {
  free: {
    /** Yaratish mumkin bo'lgan loyihalar soni (1+1 qoidasi) */
    maxProjects: 1,
    /** Bepul loyihani production'ga faollashtirish mumkinmi */
    canActivate: false,
    /** AI generatsiya */
    canGenerate: true,
    /** Export / publish */
    canExport: false,
    label: "FREE",
  },
  pro: {
    maxProjects: Infinity,
    canActivate: true,
    canGenerate: true,
    canExport: true,
    label: "PRO",
  },
} as const;

export function planOf(user: Pick<EntitlementUser, "plan">): Plan {
  return user.plan === "pro" ? "pro" : "free";
}

export function limitsOf(user: Pick<EntitlementUser, "plan">) {
  return PLAN_LIMITS[planOf(user)];
}

export function isSuperAdmin(user: Pick<EntitlementUser, "role">): boolean {
  return user.role === "superadmin";
}

/** Yangi loyiha yaratish mumkinmi? */
export function canCreateProject(
  user: Pick<EntitlementUser, "id" | "plan" | "role">,
  currentProjectCount: number
): { allowed: boolean; reason?: string; limit: number } {
  if (isSuperAdmin(user)) {
    return { allowed: true, limit: Infinity };
  }

  const limits = limitsOf(user);

  if (currentProjectCount >= limits.maxProjects) {
    return {
      allowed: false,
      limit: limits.maxProjects,
      reason:
        limits.maxProjects === 1
          ? "1+1 qoidasi: bepul tarifda faqat 1 ta loyiha yaratish mumkin. " +
            "Keyingi loyihalar uchun PRO tarifga o'ting."
          : "Loyihalar limiti tugadi.",
    };
  }

  return { allowed: true, limit: limits.maxProjects };
}

/** Loyihani production'ga faollashtirish mumkinmi? */
export function canActivateProject(
  user: Pick<EntitlementUser, "id" | "plan" | "role">,
  project: { status: string; user_id: string }
): { allowed: boolean; reason?: string } {
  if (isSuperAdmin(user)) return { allowed: true };

  if (project.user_id !== user.id) {
    return { allowed: false, reason: "Bu loyiha sizniki emas." };
  }

  if (project.status === "active") {
    return { allowed: false, reason: "Loyiha allaqachon faollashtirilgan." };
  }

  if (!limitsOf(user).canActivate) {
    return {
      allowed: false,
      reason:
        "Bepul tarifda loyihani faollashtirish (production) mumkin emas. " +
        "PRO tarifga o'ting — faqat shunda loyihangiz ishlaydi.",
    };
  }

  return { allowed: true };
}

/** AI generatsiya qilish mumkinmi? */
export function canGenerate(
  user: Pick<EntitlementUser, "id" | "plan" | "role">,
  project: { user_id: string },
  currentProjectCount: number
): { allowed: boolean; reason?: string } {
  if (isSuperAdmin(user)) return { allowed: true };

  if (project.user_id !== user.id) {
    return { allowed: false, reason: "Bu loyiha sizniki emas." };
  }

  const limits = limitsOf(user);

  if (!limits.canGenerate) {
    return { allowed: false, reason: "AI generatsiya PRO tarifda mavjud." };
  }

  if (limits.maxProjects !== Infinity && currentProjectCount > limits.maxProjects) {
    return {
      allowed: false,
      reason: "Bepul tarifda faqat 1 ta loyiha bilan ishlash mumkin.",
    };
  }

  return { allowed: true };
}

/** Umumiy holat (UI uchun) */
export function describeEntitlements(
  user: Pick<EntitlementUser, "id" | "plan" | "role">,
  currentProjectCount: number
) {
  const limits = limitsOf(user);
  const create = canCreateProject(user, currentProjectCount);

  return {
    plan: planOf(user),
    role: user.role,
    isSuperAdmin: isSuperAdmin(user),
    maxProjects: limits.maxProjects,
    usedProjects: currentProjectCount,
    remainingProjects: Math.max(0, limits.maxProjects - currentProjectCount),
    canCreateProject: create.allowed,
    createBlockedReason: create.reason,
    canActivate: limits.canActivate,
    canExport: limits.canExport,
    canGenerate: limits.canGenerate,
    label: limits.label,
  };
}

