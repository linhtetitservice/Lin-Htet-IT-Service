const U = process.env.SUPABASE_URL || 'https://zowcleefrzjwhxwnqhvj.supabase.co';
const K = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvd2NsZWVmcnpqd2h4d25xaHZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjI5NDM5NiwiZXhwIjoyMTA3ODcwMzk2fQ.aHx5fKQTFaZ1CQhd78uH2gYIl2HP9uEA8oDUK5qJwMo';

export default async function handler(req, res) {
  const { contact } = req.query || {};
  if (!contact) return res.status(400).json({ error: 'contact parameter required' });

  if (!U || !K) {
    return res.status(404).json({ error: 'Supabase credentials not configured in backend' });
  }

  const H = { apikey: K, Authorization: 'Bearer ' + K };
  try {
    const ordersRes = await fetch(
      `${U}/rest/v1/orders?contact=ilike.*${encodeURIComponent(contact.trim())}*&order=created_at.desc`,
      { headers: H }
    );
    const orders = await ordersRes.json();

    if (!Array.isArray(orders)) {
      return res.status(200).json({ orders: [] });
    }

    // Populate links for paid/delivered orders
    const history = await Promise.all(
      orders.map(async (o) => {
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
        return {
          id: o.id,
          no: o.no,
          customer_name: o.customer_name,
          contact: o.contact,
          total: o.total,
          pay_method: o.pay_method,
          status: o.status,
          items: o.items,
          links,
          created_at: o.created_at
        };
      })
    );

    return res.json({ orders: history });
  } catch (err) {
    console.error('History error:', err);
    return res.status(500).json({ error: 'server error', message: err.message });
  }
}
