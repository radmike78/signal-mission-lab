import React from 'react';
import corpus from '../../data/sources.json';
import register from '../../data/publications.json';

export function DoctrineEvidence(){
 const claims=corpus.claims.filter(c=>'publication_id' in c);
 return <section><span className="badge">Primary-source reading</span><h2>Planning foundations and staff responsibilities</h2><p>These narrow claims were checked against the retrieved public editions. Human doctrine review and current-edition checks remain pending.</p><div className="grid">{claims.map(c=><article key={c.id}><h3>{c.subject}</h3><p>{c.statement}</p><a href={c.url+('#page='+('pdf_page' in c?c.pdf_page:1))} target="_blank" rel="noreferrer">{c.source_title}</a><p><small>{c.locator}<br/>Published {c.published} · Source checked {c.retrieved}</small></p></article>)}</div><h3>Supplied publication register</h3>{register.publications.map(p=><article key={p.id}><h3>{p.designation} — {p.title}</h3><p>{p.edition}</p><span className="badge">{p.status==='content_retrieved'?'Content retrieved · human review pending':'Retrieval pending'}</span><p>{p.access_note}</p><a href={p.url} target="_blank" rel="noreferrer">Open supplied official publication</a><p className="muted">{'catalog_status' in p?<>APD record: {p.catalog_status} as of {p.catalog_checked_at}. <a href={p.catalog_url} target="_blank" rel="noreferrer">View catalog record</a></>:'Catalog matching and content retrieval remain pending.'}</p></article>)}</section>;
}
