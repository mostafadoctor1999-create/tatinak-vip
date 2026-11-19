// الاتصال بـ Supabase (قاعدة البيانات المشتركة بين الموبايلات والشاشات)
// المفتاح اللي بيتحط هنا هو anon public key (مش service_role).
// لحد ما المفتاح يتلصق، الموقع بيشتغل على نفس الجهاز بس.

export const SB_URL = "https://mgcrydqkjzeywagmyeyg.supabase.co";
export const SB_KEY = "sb_publishable_owffQD06GNFht5omFi7kWg_xoMLF1vS";
export const SB_READY = Boolean(SB_KEY);

const H = { apikey: SB_KEY, "Content-Type": "application/json" };

export async function sbList() {
  const r = await fetch(`${SB_URL}/rest/v1/wishes?select=*&order=created_at.desc&limit=200`, { headers: H });
  return r.ok ? r.json() : [];
}

export async function sbInsert(w) {
  return fetch(`${SB_URL}/rest/v1/wishes`, {
    method: "POST",
    headers: { ...H, Prefer: "return=minimal" },
    body: JSON.stringify({ from_name: w.from, to_name: w.to, message: w.text, status: w.status || "pending" }),
  });
}

export async function sbSetStatus(id, status) {
  return fetch(`${SB_URL}/rest/v1/wishes?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...H, Prefer: "return=minimal" },
    body: JSON.stringify({ status }),
  });
}

// ===== الطلبات =====
export async function sbOrder(o) {
  return fetch(`${SB_URL}/rest/v1/orders`, {
    method: "POST",
    headers: { ...H, Prefer: "return=minimal" },
    body: JSON.stringify(o),
  });
}

export async function sbOrders(status) {
  const r = await fetch(`${SB_URL}/rest/v1/orders?select=*&status=eq.${status}&order=created_at.asc`, { headers: H });
  return r.ok ? r.json() : [];
}

export async function sbOrderStatus(id, status) {
  return fetch(`${SB_URL}/rest/v1/orders?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...H, Prefer: "return=minimal" },
    body: JSON.stringify({ status }),
  });
}
