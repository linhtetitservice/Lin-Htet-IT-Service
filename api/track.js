const U = process.env.SUPABASE_URL || 'https://zowcleefrzjwhxwnqhvj.supabase.co';
const K = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvd2NsZWVmcnpqd2h4d25xaHZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjI5NDM5NiwiZXhwIjoyMTA3ODcwMzk2fQ.aHx5fKQTFaZ1CQhd78uH2gYIl2HP9uEA8oDUK5qJwMo';

export default async function handler(req, res) {
  const { no, contact } = req.query || {};
  if (!no || !contact) return res.status(400).json({ error: 'invalid parameters' });

  if (!U || !K) {
    return res.status(404).json({ error: 'Supabase credentials not configured in backend' });
  }

  const H = { apikey: K, Authorization: 'Bearer ' + K };
  try {
    const ordersRes = await fetch(
      `${U}/rest/v1/orders?no=eq.${encodeURIComponent(no)}&contact=eq.${encodeURIComponent(contact)}&limit=1`,
      { headers: H }
    );
    const orders = await ordersRes.json();
    const o = orders && orders[0];

    if (!o) return res.status(404).json({ error: 'not found' });

    let links = [];
    if (['paid', 'delivered'].includes(o.status)) {
      const ids = (o.items || []).map(i => i.id).join(',');
      if (ids) {
        const filesRes = await fetch(`${U}/rest/v1/product_files?product_id=in.(${ids})`, { headers: H });
        const f = await filesRes.json();
        links = (o.items || []).map(i => {
          const fileObj = (f || []).find(x => x.product_id === i.id);
          return {
            name: i.name,
            url: fileObj ? fileObj.url : null
          };
        }).filter(l => l.url);
      }
    }

    return res.json({
      status: o.status,
      total: o.total,
      customer_name: o.customer_name,
      items: o.items,
      links,
      created_at: o.created_at
    });
  } catch (err) {
    console.error('Track error:', err);
    return res.status(500).json({ error: 'server error', message: err.message });
  }
}
