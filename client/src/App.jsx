import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Wallet, Plus, Trash2, TrendingUp, CircleDollarSign, LoaderCircle } from 'lucide-react';

const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);
const dateLabel = d => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', amount: '', type: 'expense', category: 'Food', date: new Date().toISOString().slice(0, 10), note: '' });

  async function refresh() {
    setLoading(true); setError('');
    try {
      const [t, s] = await Promise.all([fetch('/api/transactions'), fetch('/api/transactions/summary')]);
      if (!t.ok || !s.ok) throw new Error('Could not load data. Is the API running?');
      setTransactions(await t.json()); setSummary(await s.json());
    } catch (e) { setError(e.message || 'Unable to connect to API.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);

  const visible = useMemo(() => filter === 'all' ? transactions : transactions.filter(t => t.type === filter), [transactions, filter]);
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });

  async function addTransaction(e) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const res = await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not save transaction.');
      setForm({ ...form, title: '', amount: '', note: '' });
      await refresh();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function removeTransaction(id) {
    if (!confirm('Delete this transaction?')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not delete transaction.');
      await refresh();
    } catch (e) { setError(e.message); }
  }

  return <main className="shell">
    <header className="topbar"><a className="brand" href="#"><span className="brand-mark"><CircleDollarSign size={22}/></span> finwise</a><span className="pill"><span className="dot"/> Personal finance</span></header>
    <section className="intro"><div><p className="eyebrow">YOUR MONEY, IN FOCUS</p><h1>Finance overview</h1><p className="muted">A clearer picture of where your money goes.</p></div><div className="today">{dateLabel(new Date())}</div></section>
    {error && <div className="alert" role="alert">{error}</div>}
    <section className="stats">
      <article className="stat balance"><div className="stat-top"><span>Available balance</span><span className="stat-icon"><Wallet size={19}/></span></div><h2>{money(summary.balance)}</h2><p>Income minus expenses</p></article>
      <article className="stat"><div className="stat-top"><span>Total income</span><span className="stat-icon green"><ArrowDownLeft size={19}/></span></div><h2>{money(summary.income)}</h2><p className="positive"><TrendingUp size={14}/> Money received</p></article>
      <article className="stat"><div className="stat-top"><span>Total expenses</span><span className="stat-icon orange"><ArrowUpRight size={19}/></span></div><h2>{money(summary.expense)}</h2><p className="muted">Money spent</p></article>
    </section>
    <div className="layout">
      <section className="panel form-panel"><div className="panel-heading"><div><p className="eyebrow">RECORD MONEY</p><h3>Add transaction</h3></div><span className="add-icon"><Plus size={18}/></span></div>
        <form onSubmit={addTransaction}>
          <label>Transaction name<input name="title" placeholder="e.g. Monthly salary" value={form.title} onChange={update} maxLength="90" required/></label>
          <label>Amount (₹)<input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={update} required/></label>
          <div className="form-row"><label>Type<select name="type" value={form.type} onChange={update}><option value="expense">Expense</option><option value="income">Income</option></select></label><label>Category<select name="category" value={form.category} onChange={update}>{['Food','Transport','Shopping','Bills','Health','Education','Salary','Freelance','Other'].map(x=><option key={x}>{x}</option>)}</select></label></div>
          <label>Date<input name="date" type="date" value={form.date} onChange={update} required/></label>
          <label>Note <span className="optional">Optional</span><input name="note" placeholder="Add a short note" value={form.note} onChange={update} maxLength="240"/></label>
          <button className="submit" disabled={saving}>{saving ? <><LoaderCircle className="spin" size={17}/> Saving…</> : <><Plus size={17}/> Save transaction</>}</button>
        </form>
      </section>
      <section className="panel history"><div className="history-head"><div><p className="eyebrow">YOUR ACTIVITY</p><h3>Transactions</h3></div><select aria-label="Filter transactions" className="filter" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All activity</option><option value="income">Income</option><option value="expense">Expenses</option></select></div>
        {loading ? <div className="empty"><LoaderCircle className="spin" size={24}/> Loading transactions…</div> : visible.length === 0 ? <div className="empty"><span className="empty-icon"><Wallet size={25}/></span><strong>No transactions yet</strong><span>Your added transactions will appear here.</span></div> :
          <div className="transaction-list">{visible.map(t=><article className="transaction" key={t._id}><span className={`transaction-icon ${t.type}`} >{t.type==='income'?<ArrowDownLeft size={18}/>:<ArrowUpRight size={18}/>}</span><div className="transaction-info"><strong>{t.title}</strong><span>{t.category} · {dateLabel(t.date)}</span>{t.note&&<small>{t.note}</small>}</div><div className="transaction-end"><strong className={t.type==='income'?'positive':'negative'}>{t.type==='income'?'+':'−'}{money(t.amount)}</strong><button className="delete" onClick={()=>removeTransaction(t._id)} aria-label={`Delete ${t.title}`} title="Delete transaction"><Trash2 size={16}/></button></div></article>)}</div>}
        <div className="history-foot">{transactions.length} transaction{transactions.length===1?'':'s'} recorded</div>
      </section>
    </div>
    <footer>finwise <span>·</span> Make every rupee count.</footer>
  </main>;
}
