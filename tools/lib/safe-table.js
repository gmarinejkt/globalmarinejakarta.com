/**
 * tools/lib/safe-table.js
 *
 * AI-written raw Markdown tables are a known source of broken Hugo builds. Instead the AI
 * outputs table DATA as one JSON object per line inside a plain-text block:
 *
 *   [[TABEL_MULAI]]
 *   {"title": "Judul singkat (opsional)", "headers": ["Kolom 1", "Kolom 2"]}
 *   {"row": ["nilai A1", "nilai A2"]}
 *   [[TABEL_SELESAI]]
 *
 * This module renders that data into a raw HTML `<table class="table">` block (requires
 * `[markup.goldmark.renderer] unsafe = true` in hugo.toml). Rows whose JSON fails to parse are
 * dropped; an unparseable header drops the WHOLE block.
 */

const TABLE_BLOCK_RE = /\[\[TABEL_MULAI\]\]\s*\n([\s\S]*?)\n?\s*\[\[TABEL_SELESAI\]\]/g;

function escapeHtml(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\r?\n/g, ' ')
    .trim();
}

function renderHtmlTable({ title, headers, rows }) {
  if (!Array.isArray(headers) || headers.length === 0) return '';
  const cleanHeaders = headers.map(escapeHtml);
  const colCount = cleanHeaders.length;

  const cleanRows = (rows || [])
    .filter(r => Array.isArray(r) && r.length > 0)
    .map(r => {
      const cells = r.map(escapeHtml);
      while (cells.length < colCount) cells.push('');
      return cells.slice(0, colCount);
    });

  if (!cleanRows.length) return '';

  const captionHtml = title ? `\n  <caption>${escapeHtml(title)}</caption>` : '';
  const theadHtml = `\n  <thead>\n    <tr>${cleanHeaders.map(h => `<th>${h}</th>`).join('')}</tr>\n  </thead>`;
  const tbodyRows = cleanRows.map(r => `    <tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('\n');
  const tbodyHtml = `\n  <tbody>\n${tbodyRows}\n  </tbody>`;

  return `<table class="table">${captionHtml}${theadHtml}${tbodyHtml}\n</table>`;
}

// Backward-compatible alias.
const renderMarkdownTable = renderHtmlTable;

function parseTableBlock(rawBlock) {
  const lines = rawBlock.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines.length) return null;

  let meta;
  try { meta = JSON.parse(lines[0]); } catch { return null; }
  if (!meta || !Array.isArray(meta.headers) || meta.headers.length === 0) return null;

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    let obj;
    try { obj = JSON.parse(lines[i]); } catch { continue; }
    if (obj && Array.isArray(obj.row) && obj.row.length > 0) rows.push(obj.row);
  }

  return { title: (meta.title || '').toString(), headers: meta.headers, rows };
}

function renderSafeTables(body) {
  return body.replace(TABLE_BLOCK_RE, (match, inner) => {
    const parsed = parseTableBlock(inner);
    if (!parsed) return '';
    const table = renderHtmlTable(parsed);
    return table ? `\n${table}\n` : '';
  });
}

function hasLeftoverTableMarkers(body) {
  return /\[\[TABEL_(MULAI|SELESAI)\]\]/.test(body);
}

module.exports = {
  renderSafeTables,
  renderMarkdownTable,
  parseTableBlock,
  hasLeftoverTableMarkers,
};
