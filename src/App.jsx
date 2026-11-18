import { useState, useEffect } from "react";
import { Ship, Sparkles, Send, Bell, Receipt, Lock, Star, Plus, Minus, Home, MessageCircle, ShoppingBag, X, Crown, Sunrise, Sunset, Moon, CreditCard } from "lucide-react";

/* ============ البيانات ============ */
const MINYA = { lat: 28.11, lon: 30.75 };
const HERO_IMAGE = ""; // ضع هنا رابط صورة حقيقية للمكان (من صاحب المطعم) وهتظهر خلفية للرئيسية
const TABLE = "طاولة النيل 04";
const VAULT_PIN = "1234"; // تجريبي
const MENU = {
  morning: [
    { id: "m1", name: "فطور النيل الملكي", price: 220, desc: "بيض بلدي، جبنة قريش، عيش محمص، عسل نحل، وفاكهة موسمية" },
    { id: "m2", name: "إسبريسو الصباح", price: 70, desc: "شوت قوي من بن محمّص يدوياً" },
    { id: "m3", name: "كرواسون بالزبدة", price: 85, desc: "مخبوز طازج كل ساعة، بقشرة ذهبية" },
  ],
  day: [
    { id: "d1", name: "لاتيه الذهب", price: 135, desc: "رغوة حريرية مع خيوط زعفران" },
    { id: "d2", name: "عصير مانجو نيلي", price: 110, desc: "مانجو طازجة مع نعناع ولمسة ليمون" },
    { id: "d3", name: "ليموناضة الورد والنعناع", price: 95, desc: "منعشة بماء الورد وشرائح البرتقال" },
    { id: "s1", name: "كريم بروليه", price: 165, desc: "قرمل ذهبي فوق كريمة الفانيليا الفرنسية" },
    { id: "s2", name: "تشيز كيك التوت", price: 150, desc: "قاعدة بسكويت ومربى توت بري" },
  ],
  night: [
    { id: "n1", name: "موهيتو الكونت", price: 125, desc: "ليمون، نعناع، وسكر قصب" },
    { id: "n2", name: "كوكتيل تاتينيك", price: 260, desc: "توقيع السفينة: ورد، برتقال، ولمسة شامبانيا" },
    { id: "n3", name: "قهوة تركي بالهيل", price: 75, desc: "كلاسيك يليق بالسهرة" },
    { id: "n4", name: "مارتيني النيل", price: 240, desc: "جين فاخر وزيتون محشو" },
  ],
};
const VAULT = [
  { id: "v1", name: "شامبانيا الملكي", price: 550, desc: "معتّق، غير موجود في القائمة العامة", minTier: 1 },
  { id: "v2", name: "إسبريسو النيل السري", price: 210, desc: "بن إثيوبي نادر بتحميص خاص", minTier: 0 },
  { id: "v3", name: "تشكيلة الحلويات الملكية", price: 380, desc: "ثلاث حلويات مختارة من الشيف", minTier: 2 },
];
const OFFERS = [
  { title: "خصم 20% على الحلويات", note: "يوم الخميس", minTier: 0 },
  { title: "ترقية مجانية لكوكتيل الملكي", note: "للأعضاء الملكيين فقط", minTier: 2 },
];
const TIERS = [
  { name: "ضيف", min: 0 },
  { name: "نايل", min: 300 },
  { name: "ملكي", min: 1000 },
];

/* ============ أدوات الوقت والغروب ============ */
const dayOfYear = (d) => Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
// تقدير ساعة الغروب في المنيا حسب الشهر (بالساعات العشرية)
const sunsetHour = (d) => 17.85 + 1.25 * Math.cos((2 * Math.PI * (dayOfYear(d) - 172)) / 365);
const minsToSunset = (d) => Math.round((sunsetHour(d) - (d.getHours() + d.getMinutes() / 60)) * 60);
const periodOf = (d) => {
  const h = d.getHours() + d.getMinutes() / 60;
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < sunsetHour(d)) return "day";
  return "night";
};
const tierOf = (pts) => TIERS.reduce((acc, t, i) => (pts >= t.min ? i : acc), 0);
const pad = (n) => String(n).padStart(2, "0");

async function fetchWeather() {
  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${MINYA.lat}&longitude=${MINYA.lon}&current=temperature_2m`);
    const j = await r.json();
    return Math.round(j.current.temperature_2m);
  } catch {
    return 28; // قيمة احتياطية لو الطقس مش متاح
  }
}

/* ============ المضيف الذكي (شات مغذّى بالداتا) ============ */
function concierge(text, ctx) {
  const t = text;
  const has = (...w) => w.some((x) => t.includes(x));
  const { temp, date, points } = ctx;
  const tier = TIERS[tierOf(points)].name;
  const left = minsToSunset(date);

  if (has("ساعات", "مواعيد", "فاتح", "بتقفلوا", "امتى"))
    return "نفتح يومياً من 12 ظهراً حتى 1 بعد منتصف الليل. نستناك في أي وقت من الساعات دي.";
  if (has("فين", "مكان", "عنوان", "موقع"))
    return "تاتينيك على سفينة فوق النيل، على الكورنيش في المنيا. ولو جيت وقت الغروب هتشوف النيل في أحلى صورة.";
  if (has("غروب", "شمس")) {
    if (left > 0) return `الغروب بعد حوالي ${left} دقيقة. أنصحك تقعد على الجهة المطلة على الغرب، ومعاك مشروب يناسب الجو.`;
    return "الشمس غابت بالفعل، بس الكورنيش بالليل له جمال تاني. جرب موهيتو الكونت وخليك على النيل.";
  }
  if (has("نقاط", "عضوية", "مستوى", "ترقية")) {
    const next = TIERS[tierOf(points) + 1];
    return next
      ? `مستواك الحالي ${tier} برصيد ${points} نقطة. تحتاج ${next.min - points} نقطة عشان توصل لمستوى ${next.name} وتفتح عروض أكتر.`
      : `إنت في أعلى مستوى ${tier}. عروضك الحصرية متاحة في الخزنة السرية.`;
  }
  if (has("خزنة", "سري", "رمز"))
    return "الخزنة السرية بتفتح برمز يقولهولك النادل أو الكاشير. فيها عروض وتشكيلة محدودة مش بتتعرض في القائمة.";
  if (has("حلو", "حلويات", "سكر"))
    return "كريم بروليه بالقرمل الذهبي هو الأشهر عندنا، ولو عايز حاجة أخف فتشيز كيك التوت بيفرق. أنصحك تكمل بإسبريسو يوازن الطعم.";
  if (has("تعبان", "زهقان", "مرهق", "تعب"))
    return "خليك مع لاتيه الذهب، رغوته ناعمة والزعفران يريّح. ولو عايز تبقى أهدى، كرواسون بالزبدة يكمّل الصورة.";
  if (has("مبسوط", "فرحان", "احتفال", "عيد"))
    return "مبروك! جرب كوكتيل تاتينيك، وسيب الاحتفال على الكورنيش. ولو عندك مستوى ملكي فيه مفاجأة صغيرة ليك.";
  if (has("هادي", "حزين", "زعلان"))
    return "نسمة النيل بتريّح. اطلب قهوة تركي بالهيل واقعد براحتك، ولو احتجت حاجة قولي وأنا جنبك.";
  if (temp >= 30)
    return `الجو ${temp} درجة دلوقتي، أنصحك بـ موهيتو الكونت أو عصير مانجو نيلي، وهيبقوا أحلى حاجة للحر.`;
  if (temp <= 18)
    return `الجو حوالي ${temp} درجة ونسمة النيل ممكن تبقى تقيلة. قهوة تركي بالهيل أو لاتيه الذهب هيدفوك.`;
  return `الجو معتدل حوالي ${temp} درجة، جرب لاتيه الذهب أو عصير مانجو نيلي. قولّي مزاجك وأنا أختارلك.`;
}

/* ============ الأنماط والحركة ============ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
body { font-family: 'Cairo', sans-serif; background:#0A0A0A; }
.glass { background: rgba(255,255,255,0.06); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(212,175,55,0.22); }
.gold-text { background: linear-gradient(100deg,#A8851E 0%,#F5E08A 30%,#D4AF37 50%,#F5E08A 70%,#A8851E 100%); background-size: 220% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: shimmer 4s linear infinite; }
.gold-btn { background: linear-gradient(135deg,#F5E08A,#D4AF37,#A8851E); color:#0A0A0A; }
@keyframes shimmer { from { background-position: 100% 0; } to { background-position: -100% 0; } }
@keyframes fadeUp { from { opacity:0; transform: translateY(14px); } to { opacity:1; transform:none; } }
.fade-up { animation: fadeUp .5s ease both; }
@keyframes bob { 0%,100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-6px) rotate(1deg); } }
.bob { animation: bob 4s ease-in-out infinite; }
@keyframes waveA { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes waveB { from { transform: translateX(-50%); } to { transform: translateX(0); } }
.wave-a { animation: waveA 9s linear infinite; }
.wave-b { animation: waveB 14s linear infinite; }
@keyframes glow { 0%,100% { box-shadow: 0 0 0 0 rgba(212,175,55,.35); } 50% { box-shadow: 0 0 0 12px rgba(212,175,55,0); } }
.glow { animation: glow 2.4s infinite; }
@keyframes dot { 0%,80%,100% { opacity:.2; } 40% { opacity:1; } }
.dot { animation: dot 1.2s infinite; }
`;

/* ============ زخرفة السفينة والموج ============ */
function ShipHeader({ mode, temp }) {
  const sky = {
    morning: "from-[#2a1d00] via-[#0A0A0A] to-[#0A0A0A]",
    day: "from-[#101010] via-[#0A0A0A] to-[#0A0A0A]",
    night: "from-[#03050c] via-[#070b18] to-[#0A0A0A]",
    sunset: "from-[#4a2300] via-[#1f0e00] to-[#0A0A0A]",
  }[mode];
  const orb = { morning: "#F5E08A", day: "#FFF3C4", night: "#E8E4C9", sunset: "#FF9A3C" }[mode];
  return (
    <div className={`relative overflow-hidden rounded-b-[2.5rem] bg-gradient-to-b ${sky} pt-8 pb-20 px-5`}>
      <div className="absolute top-16 right-8 w-28 h-28 rounded-full blur-2xl opacity-50" style={{ background: orb }} />
      {HERO_IMAGE && <img src={HERO_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
      <div className="absolute inset-0 opacity-60" style={{ backgroundImage: PATTERN }} />
      <GoldParticles />
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <Crown className="text-[#D4AF37]" size={20} />
          <span className="gold-text font-black text-lg">تاتينيك</span>
        </div>
        <span className="glass rounded-full px-3 py-1 text-xs text-[#D4AF37]">{TABLE}</span>
      </div>
      <div className="relative z-10 flex flex-col items-center mt-4 bob">
        <div className="absolute w-72 h-72 rounded-full border border-[#D4AF37]/20 halo" />
        <svg viewBox="0 0 260 120" className="w-72 drop-shadow-[0_0_22px_rgba(212,175,55,.35)]">
          <defs>
            <linearGradient id="goldHull" x1="0" x2="1">
              <stop offset="0" stopColor="#A8851E" />
              <stop offset=".5" stopColor="#F5E08A" />
              <stop offset="1" stopColor="#A8851E" />
            </linearGradient>
          </defs>
          <line x1="130" y1="8" x2="130" y2="62" stroke="#D4AF37" strokeWidth="2" />
          <path d="M130 12 L184 56 L130 56 Z" fill="#D4AF37" fillOpacity=".3" stroke="#D4AF37" strokeWidth="1" />
          <path d="M126 16 L76 56 L126 56 Z" fill="#D4AF37" fillOpacity=".18" stroke="#D4AF37" strokeWidth="1" />
          <rect x="86" y="48" width="88" height="22" rx="4" fill="#0A0A0A" stroke="url(#goldHull)" strokeWidth="1.5" />
          {[96, 111, 126, 141, 156, 165].map((x) => (
            <rect key={x} x={x} y="54" width="8" height="9" rx="2" fill="#F5E08A" fillOpacity=".85" />
          ))}
          <path d="M26 70 L234 70 L210 102 Q130 116 50 102 Z" fill="url(#goldHull)" />
          <line x1="50" y1="84" x2="210" y2="84" stroke="#0A0A0A" strokeWidth="1.2" strokeOpacity=".45" />
          <path d="M40 112 Q130 124 220 112" stroke="#D4AF37" strokeWidth="1" fill="none" strokeOpacity=".35" />
        </svg>
        <h1 className="gold-text font-black text-2xl mt-2">أهلاً بك على السفينة</h1>
        <p className="text-xs text-white/50 mt-1">النيل {temp >= 30 ? "مشمس ونشيط" : temp <= 18 ? "هادي ومنعش" : "هادي ومريح"} · {temp}° في المنيا</p>
      </div>
      <div className="absolute bottom-0 left-0 w-[200%] h-16 opacity-70">
        <svg className="wave-a absolute bottom-0 w-full h-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,60 C120,20 240,100 360,60 C480,20 600,100 720,60 C840,20 960,100 1080,60 C1200,20 1320,100 1440,60 L1440,120 L0,120Z" fill="#D4AF37" fillOpacity="0.18" />
        </svg>
        <svg className="wave-b absolute bottom-0 w-full h-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,80 C160,40 280,110 440,80 C600,50 720,110 880,80 C1040,50 1160,110 1320,80 C1380,70 1420,80 1440,80 L1440,120 L0,120Z" fill="#D4AF37" fillOpacity="0.28" />
        </svg>
      </div>
    </div>
  );
}

/* ============ التطبيق ============ */
function App({ profile }) {
  const [tab, setTab] = useState("home");
  const [now, setNow] = useState(new Date());
  const [temp, setTemp] = useState(28);
  const [cart, setCart] = useState({});
  const [points, setPoints] = useState(0);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [afterMsg, setAfterMsg] = useState("");
  const [card, setCard] = useState(null);
  const [offersOn, setOffersOn] = useState(true);
  const [stats, setStats] = useState({ visits: 0, orders: 0, spent: 0 });
  const addItems = (list) => setCart((c) => { const n = { ...c }; list.forEach(({ id, q }) => { n[id] = (n[id] || 0) + q; }); return n; });
  const [showCart, setShowCart] = useState(false);
  const [split, setSplit] = useState(1);

  useEffect(() => {
    fetchWeather().then(setTemp);
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const mode = (() => {
    const left = minsToSunset(now);
    if (left <= 60 && left > -30) return "sunset";
    return periodOf(now) === "morning" ? "morning" : periodOf(now) === "night" ? "night" : "day";
  })();

  const allItems = [...MENU.morning, ...MENU.day, ...MENU.night, ...VAULT];
  const period = periodOf(now);
  const items = MENU[period];
  const tier = tierOf(points);

  const notify = (m) => { setToast(m); setTimeout(() => setToast(""), 2400); };
  const change = (id, d) =>
    setCart((c) => {
      const q = (c[id] || 0) + d;
      const n = { ...c };
      if (q <= 0) delete n[id]; else n[id] = q;
      return n;
    });
  const cartItems = Object.entries(cart).map(([id, q]) => ({ ...allItems.find((i) => i.id === id), q }));
  const count = cartItems.reduce((s, i) => s + i.q, 0);
  const total = cartItems.reduce((s, i) => s + i.price * i.q, 0);
  const submit = () => {
    setPoints((p) => p + Math.round(total / 10));
    if (card) setStats((s) => ({ visits: s.visits + 1, orders: s.orders + count, spent: s.spent + total }));
    setCart({});
    setShowCart(false);
    notify("تم إرسال طلبك للمطبخ ✨ وكسبت نقاط جديدة");
    setAfterMsg("شكراً لزيارتك على السفينة. نتمنى إن الطلب يكون على ذوقك، وفي زيارتك الجاية هنجهزلك تشكيلة تناسبك.");
  };

  return (
    <>
      <style>{STYLES}</style>
      <style>{FX_CSS}</style>
      <div dir="rtl" className="min-h-screen max-w-md mx-auto bg-[#0A0A0A] text-white relative pb-32">
        {tab === "home" && (
          <div className="fade-up">
            <ShipHeader mode={mode} temp={temp} />
            <div className="px-5 -mt-8 relative z-10">
              {afterMsg && (
                <div className="glass rounded-2xl p-4 mb-4 fade-up flex gap-3">
                  <Sparkles className="text-[#D4AF37] shrink-0" size={18} />
                  <p className="text-sm leading-relaxed">{afterMsg}</p>
                </div>
              )}
              {minsToSunset(now) > 0 && minsToSunset(now) <= 10 && (
                <div className="glow rounded-2xl p-4 mb-4 gold-btn fade-up">
                  <p className="font-black">الغروب بعد {minsToSunset(now)} دقيقة</p>
                  <p className="text-sm">طاولتك على الجهة الغربية جاهزة لك، والنيل في أحلى لحظاته.</p>
                </div>
              )}
              {/* عداد الغروب */}
              <div className="glass rounded-2xl p-4 flex items-center gap-3 mb-4 relative overflow-hidden"><SailBoat />
                {mode === "sunset" ? <Sunset className="text-[#D4AF37]" /> : period === "morning" ? <Sunrise className="text-[#D4AF37]" /> : <Moon className="text-[#D4AF37]" />}
                <div className="flex-1">
                  <p className="text-sm font-bold">
                    {minsToSunset(now) > 0 ? `الغروب بعد ${minsToSunset(now)} دقيقة` : "الغروب خلص، والنيل بالليل له جمال تاني"}
                  </p>
                  <p className="text-xs text-white/50">الجو الآن {temp}° في المنيا</p>
                </div>
              </div>

              <RadarCard />
              <OffersBox profile={profile} stats={stats} enabled={offersOn} setEnabled={setOffersOn} />
              {/* المستوى والنقاط */}
              <div className="glass rounded-2xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-black gold-text flex items-center gap-1"><Star size={16} className="text-[#D4AF37]" /> مستوى {TIERS[tier].name}</span>
                  <span className="text-xs text-white/60">{points} نقطة</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full gold-btn transition-all duration-700" style={{ width: `${tier === 2 ? 100 : Math.min(100, ((points - TIERS[tier].min) / (TIERS[tier + 1].min - TIERS[tier].min)) * 100)}%` }} />
                </div>
              </div>

              {/* القائمة حسب الوقت */}
              <h3 className="text-sm text-white/60 mb-3">
                {period === "morning" ? "قائمة الصباح" : period === "day" ? "قائمة النهار" : "قائمة الليل"}
              </h3>
              <div className="flex flex-col gap-3 mb-5">
                {items.map((item, idx) => (
                  <div key={item.id} className="glass item-card rounded-2xl p-4 flex justify-between items-center fade-up" style={{ animationDelay: `${idx * 90}ms` }}>
                    <div className="pl-3">
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="text-xs text-white/60 mt-1">{item.desc}</p>
                      <p className="text-[#D4AF37] font-bold mt-2">{item.price} ج.م</p>
                    </div>
                    {cart[item.id] ? <QtyControl qty={cart[item.id]} onMinus={() => change(item.id, -1)} onPlus={() => change(item.id, 1)} /> : (
                      <button onClick={() => change(item.id, 1)} className="gold-btn w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition"><Plus size={18} /></button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => notify("تم إبلاغ النادل 🛎️")} className="glass rounded-2xl py-4 flex flex-col items-center gap-2 active:scale-95 transition">
                  <Bell className="text-[#D4AF37]" size={22} /><span className="text-sm font-semibold">اطلب النادل</span>
                </button>
                <button onClick={() => notify("تم طلب الفاتورة 🧾")} className="glass rounded-2xl py-4 flex flex-col items-center gap-2 active:scale-95 transition">
                  <Receipt className="text-[#D4AF37]" size={22} /><span className="text-sm font-semibold">اطلب الفاتورة</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "chat" && <ChatScreen ctx={{ temp, date: now, points }} allItems={allItems} addItems={addItems} />}
        {tab === "card" && (
          <CardScreen
            card={card}
            stats={stats}
            onIssue={(name) => setCard({ name, number: genNumber(), issued: new Date().toLocaleDateString("ar-EG") })}
          />
        )}

        {tab === "vault" && (
          <div className="px-5 pt-8 fade-up">
            {!vaultOpen ? <VaultLock onOpen={() => setVaultOpen(true)} /> : (
              <>
                <h2 className="text-xl font-black gold-text mb-1">مرحباً بيك في الخزنة</h2>
                <p className="text-xs text-white/50 mb-5">مستوى {TIERS[tier].name}</p>
                {tier >= 2 && (
                  <div className="glass rounded-2xl p-4 mb-6">
                    <p className="text-xs text-[#D4AF37] mb-1">وصفة الشهر من الشيف · للمستوى الملكي</p>
                    <p className="font-bold">[اسم الوصفة]</p>
                    <p className="text-xs text-white/60 mt-1">[تُكتب مع صاحب المطعم]</p>
                  </div>
                )}
                <h3 className="text-sm text-white/60 mb-3">عروض</h3>
                <div className="flex flex-col gap-3 mb-6">
                  {OFFERS.map((o) => (
                    <div key={o.title} className={`glass rounded-2xl p-4 flex gap-3 ${tier < o.minTier ? "opacity-40" : ""}`}>
                      <Star className="text-[#D4AF37] shrink-0" size={18} />
                      <div><p className="font-bold">{o.title}</p><p className="text-xs text-white/60">{o.note}</p></div>
                    </div>
                  ))}
                </div>
                <h3 className="text-sm text-white/60 mb-3">مشروبات حصرية</h3>
                {VAULT.map((item) => (
                  <div key={item.id} className={`glass rounded-2xl p-4 mb-3 flex justify-between items-center ${tier < item.minTier ? "opacity-40" : ""}`}>
                    <div className="pl-3"><h3 className="font-bold">{item.name}</h3><p className="text-xs text-white/60">{item.desc}</p><p className="text-[#D4AF37] font-bold mt-1">{item.price} ج.م</p></div>
                    {tier >= item.minTier && (cart[item.id] ? <QtyControl qty={cart[item.id]} onMinus={() => change(item.id, -1)} onPlus={() => change(item.id, 1)} /> : (
                      <button onClick={() => change(item.id, 1)} className="gold-btn w-10 h-10 rounded-full flex items-center justify-center"><Plus size={18} /></button>
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {count > 0 && tab !== "chat" && (
          <button onClick={() => setShowCart(true)} className="gold-btn glow fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md rounded-2xl py-4 px-5 flex items-center justify-between font-bold z-30 active:scale-95 transition">
            <span className="flex items-center gap-2"><ShoppingBag size={20} /> عرض السلة ({count})</span>
            <span>{total} ج.م</span>
          </button>
        )}

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md glass backdrop-blur-xl flex justify-around py-3 z-40">
          <NavBtn icon={Home} label="الرئيسية" active={tab === "home"} onClick={() => setTab("home")} />
          <NavBtn icon={CreditCard} label="بطاقتي" active={tab === "card"} onClick={() => setTab("card")} />
          <NavBtn icon={Lock} label="الخزنة" active={tab === "vault"} onClick={() => setTab("vault")} />
          <NavBtn icon={MessageCircle} label="المضيف" active={tab === "chat"} onClick={() => setTab("chat")} />
        </nav>

        {showCart && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center" onClick={() => setShowCart(false)}>
            <div onClick={(e) => e.stopPropagation()} className="glass w-full max-w-md rounded-t-3xl p-6 bg-[#111]/90 fade-up">
              <div className="flex justify-between items-center mb-4"><h3 className="font-bold gold-text text-lg">طلبك</h3><button onClick={() => setShowCart(false)}><X size={20} /></button></div>
              {cartItems.map((i) => (
                <div key={i.id} className="flex justify-between items-center py-3 border-b border-white/10">
                  <div><p className="font-semibold">{i.name}</p><p className="text-xs text-[#D4AF37]">{i.price * i.q} ج.م</p></div>
                  <QtyControl qty={i.q} onMinus={() => change(i.id, -1)} onPlus={() => change(i.id, 1)} />
                </div>
              ))}
              <div className="glass rounded-xl p-3 mt-4 flex justify-between items-center">
                <span className="text-sm">تقسيم الحساب بين</span>
                <QtyControl qty={split} onMinus={() => setSplit((s) => Math.max(1, s - 1))} onPlus={() => setSplit((s) => s + 1)} />
              </div>
              <p className="text-xs text-white/60 mt-2 mb-2">نصيب كل شخص: {Math.ceil(total / split)} ج.م</p>
              <div className="flex justify-between font-black text-lg mt-4 mb-5"><span>الإجمالي</span><span className="text-[#D4AF37]">{total} ج.م</span></div>
              <button onClick={submit} className="gold-btn w-full py-4 rounded-2xl font-bold active:scale-95 transition">أرسل الطلب</button>
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 glass rounded-2xl px-5 py-3 text-sm z-[60] fade-up">{toast}</div>
        )}
      </div>
    </>
  );
}

/* ============ البطاقات ============ */
const CARD_TIERS = [
  { name: "VIP", min: 0, grad: "from-[#3a2a00] via-[#D4AF37] to-[#5c4500]" },
  { name: "ذهبي", min: 1000, grad: "from-[#fff1b3] via-[#D4AF37] to-[#8a6d12]" },
  { name: "بلاتيني", min: 3000, grad: "from-[#f4f4f2] via-[#9aa7b4] to-[#2d3440]" },
];
const cardTierOf = (spent) => CARD_TIERS.reduce((a, t, i) => (spent >= t.min ? i : a), 0);
const genNumber = () => Array.from({ length: 4 }, () => String(Math.floor(1000 + Math.random() * 9000))).join(" ");
const SHEEN_CSS = `.sheen{background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.45) 50%,transparent 70%);background-size:250% 100%;animation:sheen 3.5s linear infinite}@keyframes sheen{from{background-position:150% 0}to{background-position:-150% 0}}`;

function Stat({ label, value }) {
  return (
    <div className="glass rounded-2xl p-3 text-center">
      <p className="text-[10px] text-white/50">{label}</p>
      <p className="font-black text-[#D4AF37] mt-1">{value}</p>
    </div>
  );
}

function CardScreen({ card, onIssue, stats }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!busy) return;
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / 5000) * 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(id);
        setBusy(false);
        onIssue(name.trim());
      }
    }, 50);
    return () => clearInterval(id);
  }, [busy]);

  const tierIdx = cardTierOf(stats.spent);
  const tier = CARD_TIERS[tierIdx];
  const next = CARD_TIERS[tierIdx + 1];

  return (
    <div className="px-5 pt-8 fade-up">
      <style>{SHEEN_CSS}</style>
      <div className="flex items-center gap-2 mb-5">
        <CreditCard className="text-[#D4AF37]" size={20} />
        <h2 className="text-xl font-black gold-text">بطاقتك</h2>
      </div>

      {!card && !busy && (
        <div className="glass rounded-3xl p-6 text-center">
          <p className="text-sm text-white/70 mb-4 leading-relaxed">اكتب اسمك وهنطبعلك بطاقة VIP خاصة بيك في ثواني</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسمك"
            className="w-full bg-transparent border border-[#D4AF37]/30 rounded-xl px-4 py-3 outline-none text-center mb-4"
          />
          <button
            disabled={name.trim().length < 2}
            onClick={() => { setProgress(0); setBusy(true); }}
            className="gold-btn w-full rounded-xl py-3 font-bold disabled:opacity-40 active:scale-95 transition"
          >
            اصنع بطاقتي
          </button>
        </div>
      )}

      {busy && (
        <div className="glass rounded-3xl p-6 text-center">
          <div className="sheen rounded-2xl h-40 mb-5 bg-gradient-to-br from-[#1a1400] to-[#0A0A0A]" />
          <p className="font-bold mb-3">جاري طباعة بطاقتك...</p>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full gold-btn" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {card && !busy && (
        <>
          <div className={`relative w-full aspect-[1.6] rounded-3xl p-5 bg-gradient-to-br ${tier.grad} shadow-[0_20px_60px_rgba(212,175,55,.25)] overflow-hidden fade-up`}>
            <div className="sheen absolute inset-0 opacity-70" />
            <div className="holo absolute inset-0" />
            <div className="relative flex justify-between items-start text-black/80">
              <span className="font-black">تاتينيك</span>
              <Crown size={22} />
            </div>
            <div className="relative w-11 h-8 rounded-md bg-gradient-to-br from-[#F5E08A] to-[#A8851E] mt-6" />
            <p dir="ltr" className="relative font-mono tracking-[0.18em] text-black/80 mt-4">{card.number}</p>
            <div className="relative flex justify-between items-end mt-4 text-black">
              <div><p className="text-[10px] opacity-70">العضو</p><p className="font-black">{card.name}</p></div>
              <div className="text-left"><p className="text-[10px] opacity-70">المستوى</p><p className="font-black">{tier.name}</p></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <Stat label="الزيارات" value={stats.visits} />
            <Stat label="الطلبات" value={stats.orders} />
            <Stat label="إجمالي الإنفاق" value={`${stats.spent} ج.م`} />
          </div>

          <div className="glass rounded-2xl p-4 mt-4">
            <p className="text-sm mb-2">
              {next ? `باقي ${next.min - stats.spent} ج.م للوصول لمستوى ${next.name}` : "وصلت لأعلى مستوى، مبروك يا باشا 👑"}
            </p>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full gold-btn" style={{ width: `${next ? Math.min(100, (stats.spent / next.min) * 100) : 100}%` }} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ============ المضيف ============ */
const YES_RE = /^(أيوه|ايوه|اه|آه|تمام|موافق|ماشي|أكيد|اوكي|ok)/;
const NO_RE = /^(لا|لأ|مش|الغي|ألغي|اقفل)/;
const ORDER_RE = /عايز|عاوز|هات|اطلب|ضيف|أخد|اخد|ابعت|عايزة/;
const FAST_RE = /بسرعة|على طول|حالاً|حالا|مستعجل/;
const JOKE_RE = /نكتة|اضحكني|هزار|اهزر/;
const JOKES = [
  "ليه القهوة ما بتتخانقش مع الشاي؟ عشان الاتنين بيفهموا بعض 😄",
  "واحد سألني: أحسن مشروب للكورنيش إيه؟ قلتله: اللي ما يقعش في النيل ☕",
  "أحلى حاجة في الغروب إنه بيخلّص من غير ما تحسب الساعة 😌",
  "الكوكتيل بيدي إحساس إنك سافرت، بس من غير تذكرة ولا زحمة 🥂",
];

function findItems(text, allItems) {
  const hits = [];
  allItems.forEach((it) => {
    const first = it.name.split(" ")[0];
    if (text.includes(it.name) || (first.length > 3 && text.includes(first))) hits.push(it.id);
  });
  return [...new Set(hits)];
}

function ChatScreen({ ctx, allItems, addItems }) {
  const [msgs, setMsgs] = useState([{ from: "bot", text: "أهلاً بيك في تاتينيك! قولّي عايز تشرب إيه، أو احكيلي نكتة لو زهقت 😄" }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [pending, setPending] = useState(null);

  const say = (text) => {
    setTyping(true);
    setTimeout(() => {
      setMsgs((x) => [...x, { from: "bot", text }]);
      setTyping(false);
    }, 800);
  };
  const nameOf = (id) => allItems.find((i) => i.id === id)?.name;
  const summary = (list) => list.map((i) => `${i.q} × ${nameOf(i.id)}`).join("، ");

  const handle = (m) => {
    if (pending) {
      if (YES_RE.test(m)) {
        addItems(pending);
        setPending(null);
        return say(`تمام، ضفت ${summary(pending)} للسلة. تحب تضيف حاجة تانية؟ 🥂`);
      }
      if (NO_RE.test(m)) {
        setPending(null);
        return say("ولا يهمك، لغيت الطلب. تحب تشوف حاجة تانية؟");
      }
    }
    if (JOKE_RE.test(m)) return say(JOKES[Math.floor(Math.random() * JOKES.length)]);
    if (ORDER_RE.test(m)) {
      const ids = findItems(m, allItems);
      if (!ids.length) return say("قولّي اسم المشروب أو الحلى من المنيو بالظبط، عشان أضيفه صح ✍️");
      const q = Math.min(20, Number((m.match(/\d+/) || ["1"])[0]));
      const list = ids.map((id) => ({ id, q }));
      if (FAST_RE.test(m)) {
        addItems(list);
        return say(`حاضر بسرعة ⚡ ضفت ${summary(list)} للسلة.`);
      }
      setPending(list);
      return say(`تأكيد: ${summary(list)}. أضيفهم للسلة؟ (أيوه / لا)`);
    }
    return say(concierge(m, ctx));
  };

  const send = (text) => {
    const m = (text ?? input).trim();
    if (!m || typing) return;
    setMsgs((x) => [...x, { from: "user", text: m }]);
    setInput("");
    handle(m);
  };

  const chips = ["عايز أشرب حاجة", "قولي نكتة", "أنا تعبان", "امتى الغروب؟", "نقاطي كام؟"];

  return (
    <div className="px-5 pt-8 flex flex-col h-[calc(100vh-120px)] fade-up">
      <div className="flex items-center gap-2 mb-4"><Sparkles className="text-[#D4AF37]" size={20} /><h2 className="text-xl font-black gold-text">المضيف</h2></div>
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4">
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed fade-up ${m.from === "user" ? "self-start gold-btn" : "self-end glass"}`}>{m.text}</div>
        ))}
        {typing && (
          <div className="self-end glass rounded-2xl px-4 py-3 flex gap-1">
            {[0, 1, 2].map((d) => <span key={d} className="dot w-2 h-2 rounded-full bg-[#D4AF37]" style={{ animationDelay: `${d * 150}ms` }} />)}
          </div>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-3">
        {chips.map((c) => <button key={c} onClick={() => send(c)} className="glass whitespace-nowrap rounded-full px-3 py-1.5 text-xs text-[#D4AF37] active:scale-95 transition">{c}</button>)}
      </div>
      <div className="glass rounded-full flex items-center gap-2 p-2 mb-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="اكتب رسالتك..." className="flex-1 bg-transparent outline-none px-3 text-sm placeholder:text-white/40" />
        <button onClick={() => send()} className="gold-btn w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition"><Send size={16} /></button>
      </div>
    </div>
  );
}

/* ============ مكوّنات مساعدة ============ */
function VaultLock({ onOpen }) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const press = (d) => {
    if (pin.length >= 4) return;
    const n = pin + d;
    setPin(n);
    if (n.length === 4) {
      setTimeout(() => {
        if (n === VAULT_PIN) onOpen();
        else { setShake(true); setTimeout(() => { setShake(false); setPin(""); }, 400); }
      }, 150);
    }
  };
  return (
    <div className="flex flex-col items-center">
      <div className="glow w-20 h-20 rounded-full glass flex items-center justify-center mb-4"><Lock className="text-[#D4AF37]" size={32} /></div>
      <h2 className="text-xl font-black gold-text">الخزنة السرية</h2>
      <p className="text-xs text-white/50 mt-2 text-center">أدخل الرمز اللي يقولهولك النادل أو الكاشير</p>
      <div className={`flex gap-4 my-7 ${shake ? "animate-pulse" : ""}`}>
        {[0, 1, 2, 3].map((i) => <div key={i} className={`w-4 h-4 rounded-full border border-[#D4AF37] ${i < pin.length ? "bg-[#D4AF37]" : ""}`} />)}
      </div>
      <div className="grid grid-cols-3 gap-4 w-64">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} onClick={() => press(d)} className="glass rounded-full h-16 text-xl font-bold active:scale-90 transition">{d}</button>
        ))}
        <div />
        <button onClick={() => press("0")} className="glass rounded-full h-16 text-xl font-bold active:scale-90 transition">0</button>
        <button onClick={() => setPin(pin.slice(0, -1))} className="h-16 text-white/50 text-sm">مسح</button>
      </div>
      <p className="text-[11px] text-white/30 mt-6">للتجربة: 1234</p>
    </div>
  );
}

function QtyControl({ qty, onMinus, onPlus }) {
  return (
    <div className="flex items-center gap-3 glass rounded-full px-2 py-1">
      <button onClick={onMinus} className="w-7 h-7 flex items-center justify-center text-[#D4AF37] active:scale-90"><Minus size={16} /></button>
      <span className="font-bold w-4 text-center">{qty}</span>
      <button onClick={onPlus} className="w-7 h-7 flex items-center justify-center text-[#D4AF37] active:scale-90"><Plus size={16} /></button>
    </div>
  );
}

function NavBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 px-4 transition ${active ? "text-[#D4AF37]" : "text-white/50"}`}>
      <Icon size={20} /><span className="text-[11px] font-semibold">{label}</span>
    </button>
  );
}


/* ============ التسجيل (قبل الدخول) ============ */
const RADAR_CSS = `@keyframes radar{0%{transform:scale(.4);opacity:.8}100%{transform:scale(2.4);opacity:0}}.radar-ring{animation:radar 2.4s ease-out infinite}`;

function RegisterScreen({ onDone }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState("");

  const submit = () => {
    if (name.trim().length < 2) return setErr("اكتب اسمك من فضلك");
    if (!/^01[0125]\d{8}$/.test(phone)) return setErr("اكتب رقم موبايل مصري صحيح (11 رقم)");
    if (!agree) return setErr("لازم توافق عشان نقدر نبعتلك العروض");
    onDone({ name: name.trim(), phone, consent: true, at: new Date().toISOString() });
  };

  return (
    <div dir="rtl" className="min-h-screen max-w-md mx-auto bg-[#0A0A0A] text-white px-6 pt-16 pb-10">
      <style>{STYLES}</style>
      <div className="flex flex-col items-center mb-8 fade-up">
        <Ship className="text-[#D4AF37] bob" size={46} />
        <h1 className="gold-text font-black text-2xl mt-4">أهلاً بيك في تاتينيك</h1>
        <p className="text-sm text-white/60 mt-2 text-center leading-relaxed">سجّل بياناتك عشان تستلم عروضك الخاصة وبطاقة VIP بتاعتك</p>
      </div>
      <div className="glass rounded-3xl p-6 fade-up">
        <label className="text-xs text-white/60">الاسم</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك" className="w-full bg-transparent border border-[#D4AF37]/30 rounded-xl px-4 py-3 outline-none mt-1 mb-4" />
        <label className="text-xs text-white/60">رقم الموبايل</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))} inputMode="numeric" placeholder="01xxxxxxxxx" className="w-full bg-transparent border border-[#D4AF37]/30 rounded-xl px-4 py-3 outline-none mt-1 mb-4" dir="ltr" />
        <label className="flex gap-3 items-start text-xs text-white/70 leading-relaxed cursor-pointer">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 accent-[#D4AF37]" />
          <span>أوافق إن تاتينيك تستخدم اسمي ورقمي وبيانات زياراتي عشان تبعتلي عروض ورسايل. أقدر أوقف الرسايل في أي وقت.</span>
        </label>
        {err && <p className="text-xs text-red-400 mt-3">{err}</p>}
        <button onClick={submit} className="gold-btn w-full rounded-xl py-3 font-bold mt-5 active:scale-95 transition">ادخل على السفينة</button>
      </div>
      <p className="text-[11px] text-white/30 text-center mt-6">بياناتك بتتستخدم للعروض بس، ومش هتتباع لحد.</p>
    </div>
  );
}

/* ============ الرادار (قرب السفينة) ============ */
function distanceM(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toR = (x) => (x * Math.PI) / 180;
  const dLat = toR(lat2 - lat1);
  const dLon = toR(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function RadarCard() {
  const [state, setState] = useState("idle");
  const [dist, setDist] = useState(null);

  const scan = () => {
    if (!navigator.geolocation) return setState("nogeo");
    setState("loading");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        // ملاحظة: الإحداثيات دي مكان مؤقت، لازم تتغير لإحداثيات السفينة الحقيقية
        const d = distanceM(p.coords.latitude, p.coords.longitude, MINYA.lat, MINYA.lon);
        setDist(Math.round(d));
        setState(d <= 300 ? "near" : "far");
      },
      () => setState("denied"),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const msg = {
    idle: "فعّل الرادار وشوف إذا كنت قريب من السفينة، وهيفتحلك عرض خاص.",
    loading: "بندوّر عليك...",
    near: `إنت قريب مننا (${dist} متر)! اطلب دلوقتي وخد خصم 10% على أول طلب.`,
    far: `إنت بعيد شوية (${dist} متر). قرّب من النيل وعرضك هيفتح.`,
    denied: "محتاجين إذنك للموقع عشان الرادار يشتغل.",
    nogeo: "الجهاز ده ما بيدعمش تحديد الموقع.",
  }[state];

  return (
    <div className="glass rounded-2xl p-4 mb-4 flex items-center gap-4">
      <style>{RADAR_CSS}</style>
      <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
        {state === "loading" && <span className="radar-ring absolute inset-0 rounded-full border border-[#D4AF37]" />}
        <button onClick={scan} className="relative w-12 h-12 rounded-full gold-btn flex items-center justify-center active:scale-90 transition">
          <Ship size={20} />
        </button>
      </div>
      <p className="text-sm leading-relaxed flex-1">{msg}</p>
    </div>
  );
}

/* ============ رسايل العروض ============ */
function buildOffers(stats) {
  const out = [];
  if (stats.visits === 0) out.push({ code: "WELCOME", text: "مشروب ترحيبي مجاني في زيارتك الجاية" });
  if (stats.visits > 0 && stats.spent >= 1000) out.push({ code: "GOLD15", text: "خصم 15% على الحلويات لأعضاء الذهبي" });
  if (stats.visits > 0) out.push({ code: "MISSYOU20", text: "وحشتنا! خصم 20% على كوكتيل تاتينيك النهاردة" });
  return out;
}

function OffersBox({ profile, stats, enabled, setEnabled }) {
  if (!enabled) {
    return (
      <div className="glass rounded-2xl p-4 mb-4 flex justify-between items-center text-xs text-white/60">
        <span>رسايل العروض متوقفة</span>
        <button onClick={() => setEnabled(true)} className="text-[#D4AF37] font-bold">تشغيلها</button>
      </div>
    );
  }
  const offers = buildOffers(stats);
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm text-white/60">رسايل من السفينة لـ{profile.name}</h3>
        <button onClick={() => setEnabled(false)} className="text-[10px] text-white/40">إيقاف الرسايل</button>
      </div>
      {offers.map((o) => (
        <div key={o.code} className="glass rounded-2xl p-4 mb-2 fade-up">
          <p className="text-sm">{o.text}</p>
          <p className="text-[10px] text-[#D4AF37] mt-1">كود العرض: {o.code}</p>
        </div>
      ))}
    </div>
  );
}

/* ============ الجذر: تسجيل أولاً ثم التطبيق ============ */
export default function Root() {
  const [profile, setProfile] = useState(null);
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 2200);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      {profile ? <App profile={profile} /> : <RegisterScreen onDone={setProfile} />}
      {intro && <IntroSplash />}
    </>
  );
}

/* ============ عناصر الفخامة ============ */
const PATTERN = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><path d='M20 2 L38 20 L20 38 L2 20Z' fill='none' stroke='%23D4AF37' stroke-opacity='0.22'/></svg>\")";
const PARTICLES = [[8, 20, 3, 0], [18, 70, 2, 1.2], [30, 40, 2.5, 0.6], [52, 15, 2, 2], [66, 60, 3, 0.9], [80, 30, 2, 1.6], [90, 75, 2.5, 0.3], [44, 85, 2, 2.4]];

const FX_CSS = `
.particle{opacity:.2;animation:twinkle 3s ease-in-out infinite;box-shadow:0 0 8px #F5E08A}
@keyframes twinkle{0%,100%{opacity:.15;transform:scale(.8)}50%{opacity:.95;transform:scale(1.3)}}
.sail{animation:sail 16s linear infinite}
@keyframes sail{from{transform:translateX(-50px)}to{transform:translateX(420px)}}
.halo{animation:spin 24s linear infinite;border-style:dashed}
@keyframes spin{to{transform:rotate(360deg)}}
.holo{background:linear-gradient(120deg,rgba(255,0,128,.15),rgba(0,255,255,.15),rgba(255,255,0,.15),rgba(128,0,255,.15));background-size:300% 300%;mix-blend-mode:overlay;animation:holoMove 6s linear infinite}
@keyframes holoMove{from{background-position:0% 50%}to{background-position:100% 50%}}
.item-card{transition:all .3s ease}
.item-card:hover{transform:translateY(-2px);box-shadow:0 0 30px rgba(212,175,55,.2);border-color:rgba(212,175,55,.5)}
.intro-out{animation:introOut .5s ease 1.8s forwards}
@keyframes introOut{to{opacity:0;visibility:hidden}}
.intro-ship{animation:shipIn 1.2s ease both}
@keyframes shipIn{from{opacity:0;transform:translateY(30px) scale(.8)}to{opacity:1;transform:none}}
`;

function GoldParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map(([x, y, s, d], i) => (
        <span key={i} className="particle absolute rounded-full bg-[#F5E08A]" style={{ left: `${x}%`, top: `${y}%`, width: s * 2, height: s * 2, animationDelay: `${d}s` }} />
      ))}
    </div>
  );
}

function SailBoat() {
  return (
    <div className="sail absolute bottom-2 left-0 pointer-events-none">
      <svg width="34" height="22" viewBox="0 0 34 22">
        <path d="M16 2 L30 16 L16 16Z" fill="#D4AF37" />
        <path d="M14 4 L4 16 L14 16Z" fill="#F5E08A" fillOpacity=".8" />
        <path d="M2 18 H32 L28 21 H6Z" fill="#A8851E" />
      </svg>
    </div>
  );
}

function IntroSplash() {
  return (
    <div className="intro-out fixed inset-0 z-[100] bg-[#0A0A0A] flex flex-col items-center justify-center">
      <Ship className="text-[#D4AF37] intro-ship drop-shadow-[0_0_25px_rgba(212,175,55,.6)]" size={80} />
      <h1 className="gold-text font-black text-3xl mt-6 fade-up">تاتينيك</h1>
      <p className="text-white/50 text-xs mt-2 fade-up">تجربة نيلية راقية</p>
    </div>
  );
}
