const U = process.env.SUPABASE_URL, K = process.env.SUPABASE_SERVICE_KEY;
const BOT = process.env.BOT_TOKEN, CHAT = process.env.CHAT_ID;
const UUID = /^[0-9a-f-]{36}$/i;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { name, contact, note, items, pay, slip } = req.body || {};
  
  if (!name || !contact || !Array.isArray(items) || !items.length || !items.every(i => UUID.test(i.id))) {
    return res.status(400).json({ error: 'invalid data' });
  }

  // If Supabase credentials are missing, let client know or operate in demo mode
  if (!U || !K) {
    const no = 'LH' + Date.now().toString().slice(-8);
    return res.json({ ok: true, no, demo: true, message: 'Saved in local mode (SUPABASE_URL not configured)' });
  }

  const H = { apikey: K, Authorization: 'Bearer ' + K, 'Content-Type': 'application/json' };
  const ids = items.map(i => i.id).join(',');
  
  try {
    const prodsResponse = await fetch(`${U}/rest/v1/products?id=in.(${ids})&active=eq.true`, { headers: H });
    const prods = await prodsResponse.json();

    const lines = items.map(i => {
      const p = prods.find(x => x.id === i.id);
      const q = Math.max(1, Math.min(99, +i.qty || 1));
      return p && { id: p.id, name: p.name, price: p.price, qty: q };
    }).filter(Boolean);

    if (!lines.length) return res.status(400).json({ error: 'no products found' });
    const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const no = 'LH' + Date.now().toString().slice(-8);

    const r = await fetch(`${U}/rest/v1/orders`, {
      method: 'POST',
      headers: { ...H, Prefer: 'return=minimal' },
      body: JSON.stringify({
        no,
        customer_name: name,
        contact,
        note: note || '',
        items: lines,
        total,
        pay_method: pay || 'KPay',
        slip: slip || ''
      })
    });

    if (!r.ok) {
      const errText = await r.text();
      return res.status(500).json({ error: 'save failed', details: errText });
    }

    // Send Telegram Notification
    if (BOT && CHAT) {
      const text = `🛒 အော်ဒါအသစ် ရောက်ရှိပါသည် (${no})\n` +
        `👤 ဝယ်သူ: ${name}\n` +
        `📞 ဆက်သွယ်ရန်: ${contact}\n` +
        `━━━━━━━━━━━━━━━\n` +
        lines.map(l => `• ${l.name} x${l.qty} = ${(l.price * l.qty).toLocaleString()} Ks`).join('\n') +
        `\n━━━━━━━━━━━━━━━\n` +
        `💰 စုစုပေါင်း: ${total.toLocaleString()} Ks\n` +
        `💳 ငွေပေးချေမှု: ${pay || '-'}\n` +
        `🧾 Slip: ${slip || 'slip မပါ'}` +
        (note ? `\n📝 မှတ်ချက်: ${note}` : '');

      await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT, text })
      }).catch(err => console.error('Telegram error:', err));
    }

    return res.json({ ok: true, no });
  } catch (err) {
    console.error('Order error:', err);
    return res.status(500).json({ error: 'internal server error', message: err.message });
  }
}
