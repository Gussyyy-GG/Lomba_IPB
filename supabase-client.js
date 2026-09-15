import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
        throw error;
    }
    return data.user;
}

export async function getCurrentProfile() {
    const user = await getCurrentUser();
    if (!user) {
        return null;
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, role")
        .eq("id", user.id)
        .single();

    if (error) {
        throw error;
    }
    return data;
}

export const ROLE_LABELS = {
    manager_outlet: "Manajer Outlet",
    driver: "Driver",
    company_distributor: "Perusahaan & Distributor"
};

export const ROLE_ACCESS = {
    manager_outlet: ["monitoring.html"],
    driver: ["laporan.html"],
    company_distributor: ["dashboard.html", "inputdata.html", "monitoring.html", "laporan.html"]
};

export function canAccess(role, page) {
    return Boolean(ROLE_ACCESS[role] && ROLE_ACCESS[role].includes(page));
}

export async function requirePageAccess(page) {
    const user = await getCurrentUser();
    if (!user) {
        window.location.replace("login.html");
        return null;
    }

    const profile = await getCurrentProfile();
    if (!profile || !canAccess(profile.role, page)) {
        window.location.replace(getDefaultPage(profile && profile.role));
        return null;
    }

    return { user, profile };
}

export function getDefaultPage(role) {
    if (role === "manager_outlet") return "monitoring.html";
    if (role === "driver") return "laporan.html";
    return "dashboard.html";
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        throw error;
    }
    window.location.replace("login.html");
}

export function setupNavigation(profile) {
    document.querySelectorAll("[data-page]").forEach(function (link) {
        link.hidden = !canAccess(profile.role, link.dataset.page);
    });

    const name = document.querySelector("[data-user-name]");
    const role = document.querySelector("[data-user-role]");
    if (name) name.textContent = profile.full_name || "Pengguna";
    if (role) role.textContent = ROLE_LABELS[profile.role] || profile.role;

    const logout = document.querySelector("[data-action='logout']");
    if (logout) logout.addEventListener("click", signOut);
}

export function showError(message) {
    const target = document.querySelector("[data-error]");
    if (target) {
        target.textContent = message;
        target.hidden = false;
    }
}
