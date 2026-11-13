/* Dashboard Executivo DR. HOJE - Motor de Renderizacao e Criptografia */
let DATA = null;

/* ---------------- helpers ---------------- */
const COLORS = {
  navy:'#0E2A5E', navy2:'#15347A', teal:'#16A085', blue:'#1F6FB2',
  orange:'#F2994A', purple:'#8E44AD', gray:'#95A5A6', gold:'#D4A017',
  red:'#C0392B', lblue:'#5DADE2', pink:'#D98880', brown:'#7D6608'
};
const DONUT5 = [COLORS.navy2, COLORS.teal, COLORS.orange, COLORS.purple, COLORS.gray];

function fmtInt(n){ return Math.round(n).toLocaleString('pt-BR'); }
function fmtPct(n, d=1){ return n.toLocaleString('pt-BR', {minimumFractionDigits:d, maximumFractionDigits:d}) + '%'; }
function fmtMoeda(n){ return 'R$ ' + (n||0).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function fmtMoedaCompacta(n){
  if(Math.abs(n) >= 1000){ return 'R$ ' + (n/1000).toLocaleString('pt-BR', {minimumFractionDigits:1, maximumFractionDigits:1}) + ' mil'; }
  return fmtMoeda(n);
}
/* Plugin Chart.js nativo (sem dependência externa) para exibir o valor de cada ponto/barra
   acima do elemento. Ativado por dataset via showValueLabels:true. */
const valueLabelsPlugin = {
  id: 'valueLabels',
  afterDatasetsDraw(chart){
    const { ctx } = chart;
    chart.data.datasets.forEach((dataset, i)=>{
      if(!dataset.showValueLabels) return;
      const meta = chart.getDatasetMeta(i);
      if(meta.hidden) return;
      const fmt = dataset.valueLabelFormatter || (v=>v);
      const color = dataset.valueLabelColor || '#1F2A44';
      const offset = dataset.valueLabelOffset || 4;
      ctx.save();
      ctx.font = "600 8px -apple-system, BlinkMacSystemFont, Arial, sans-serif";
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      meta.data.forEach((el, idx)=>{
        const raw = dataset.data[idx];
        if(raw === null || raw === undefined) return;
        const pos = el.tooltipPosition ? el.tooltipPosition() : el.getProps(['x','y'], true);
        ctx.fillText(fmt(raw), pos.x, pos.y - offset);
      });
      ctx.restore();
    });
  }
};
function fmtDateBR(iso){
  if(!iso) return '--/--/----';
  const [y,m,d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function el(tag, cls, html){ const e = document.createElement(tag); if(cls) e.className = cls; if(html!==undefined) e.innerHTML = html; return e; }

/* simple inline icon set */
const ICONS = {
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  building: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="22" x2="9" y2="18"/><line x1="15" y1="22" x2="15" y2="18"/><line x1="8" y1="6" x2="8" y2="6"/><line x1="12" y1="6" x2="12" y2="6"/><line x1="16" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="white" stroke="none"><path d="M12 21s-7.5-4.6-10-9.3C0.3 8.4 1.7 4.8 5 4c2-0.5 3.8 0.4 5 2 1.2-1.6 3-2.5 5-2 3.3 0.8 4.7 4.4 3 7.7C19.5 16.4 12 21 12 21z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  trend: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
  scale: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M5 6h14"/><path d="M3 12l3-6 3 6a3 3 0 0 1-6 0z"/><path d="M15 12l3-6 3 6a3 3 0 0 1-6 0z"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  award: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>'
};

function kpiCard(icon, color, value, label, sub){
  const c = el('div','card kpi-card');
  const ic = el('div','kpi-icon', ICONS[icon]);
  ic.style.background = color;
  const txt = el('div');
  txt.appendChild(el('div','kpi-value', value));
  txt.appendChild(el('div','kpi-label', label));
  if(sub) txt.appendChild(el('div','kpi-sub', sub));
  c.appendChild(ic); c.appendChild(txt);
  return c;
}

function buildTable(tableEl, headers, rows, totalIdx, textCols){
  textCols = textCols || [];
  tableEl.innerHTML = '';
  const thead = el('thead');
  const trh = el('tr');
  headers.forEach((h,i) => trh.appendChild(el('th', (i>0 && !textCols.includes(i)) ? 'num':'', h)));
  thead.appendChild(trh);
  tableEl.appendChild(thead);
  const tbody = el('tbody');
  rows.forEach((r, idx) => {
    const tr = el('tr', idx===totalIdx ? 'total-row' : '');
    r.forEach((val,i) => tr.appendChild(el('td', (i>0 && !textCols.includes(i)) ? 'num':'', val)));
    tbody.appendChild(tr);
  });
  tableEl.appendChild(tbody);
}

function legendList(containerId, items, colors){
  const cont = document.getElementById(containerId);
  cont.innerHTML = '';
  items.forEach((it, i) => {
    const row = el('div','legend-item');
    const dot = el('div','legend-dot'); dot.style.background = colors[i % colors.length];
    const txt = el('div');
    txt.innerHTML = `<span class="legend-label">${it.label}</span><span class="legend-value">${it.value}</span>`;
    row.appendChild(dot); row.appendChild(txt);
    cont.appendChild(row);
  });
}

/* center-text plugin for donuts */
const centerTextPlugin = {
  id: 'centerText',
  afterDraw(chart, args, opts){
    if(!opts || !opts.line1) return;
    const {ctx, chartArea:{left,right,top,bottom}} = chart;
    const cx = (left+right)/2, cy = (top+bottom)/2;
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = opts.color1 || COLORS.navy;
    ctx.font = `800 ${opts.size1||18}px Arial`;
    ctx.fillText(opts.line1, cx, cy - (opts.line2 ? 9 : 0));
    if(opts.line2){
      ctx.fillStyle = opts.color2 || COLORS.gray;
      ctx.font = `700 ${opts.size2||9.5}px Arial`;
      ctx.fillText(opts.line2, cx, cy + 10);
    }
    ctx.restore();
  }
};
if (typeof Chart !== 'undefined') {
  Chart.register(centerTextPlugin);
}

const charts = {};

/* ---------------- PAGE 1 ---------------- */
function renderPage1(){
  const p = DATA.pagina1_visao_executiva;
  const k = p.kpis;
  const kpis = document.getElementById('p1-kpis');
  kpis.innerHTML = '';
  kpis.appendChild(kpiCard('users', COLORS.navy, fmtInt(k.vidas_ativas), 'VIDAS ATIVAS', 'Total de beneficiários'));
  kpis.appendChild(kpiCard('building', COLORS.navy2, fmtInt(k.empresarial), 'EMPRESARIAL', `${fmtPct(k.empresarial_pct)} do total de vidas`));
  kpis.appendChild(kpiCard('heart', COLORS.teal, fmtInt(k.adesao), 'ADESÃO / INDIVIDUAL', `${fmtPct(k.adesao_pct)} do total de vidas`));
  kpis.appendChild(kpiCard('plus', COLORS.orange, `+${fmtInt(k.inclusoes_junho)}`, 'INCLUSÕES NO PERÍODO', k.inclusoes_junho_obs));

  const cc = p.composicao_carteira;
  if(charts.p1Donut) charts.p1Donut.destroy();
  charts.p1Donut = new Chart(document.getElementById('p1DonutComposicao'), {
    type: 'doughnut',
    data: { labels:['Empresarial','Adesão'], datasets:[{ data:[cc.empresarial, cc.adesao], backgroundColor:[COLORS.navy2, COLORS.teal], borderWidth:0 }] },
    options: { responsive:true, maintainAspectRatio:false, cutout:'68%',
      plugins:{ legend:{display:false}, centerText:{ line1: fmtInt(k.vidas_ativas), line2:'VIDAS ATIVAS' } } }
  });
  legendList('p1ComposicaoLegend', [
    {label:'EMPRESARIAL', value:`${fmtInt(cc.empresarial)} vidas (${fmtPct(cc.empresarial_pct)})`},
    {label:'ADESÃO', value:`${fmtInt(cc.adesao)} vidas (${fmtPct(cc.adesao_pct)})`}
  ], [COLORS.navy2, COLORS.teal]);

  /* Observação dinâmica: contrato com mais vidas da base empresarial */
  const p2Data = DATA.pagina2_evolucao_movimentacao;
  const obsEl = document.getElementById('p1ComposicaoObs');
  if(obsEl && p2Data && p2Data.top5_empresas && p2Data.top5_empresas.length > 0){
    const top = p2Data.top5_empresas[0];
    const nomeEmpresa = top.empresa.replace(/\s+(LTDA|S\.?A\.?|ME|EPP|EIRELI)$/i, '').trim();
    obsEl.textContent = `O contrato da ${nomeEmpresa} representa ${fmtInt(top.vidas)} vidas (${fmtPct(top.pct_empresarial)} da base empresarial).`;
    obsEl.style.display = '';
  } else if(obsEl){
    obsEl.style.display = 'none';
  }

  const inc = p.inclusoes_por_dia_junho;
  if(charts.p1Bar) charts.p1Bar.destroy();
  const barValueLabelPlugin = {
    id: 'barValueLabel',
    afterDatasetsDraw(chart){
      const { ctx } = chart;
      chart.data.datasets.forEach((dataset, di) => {
        const meta = chart.getDatasetMeta(di);
        meta.data.forEach((bar, i) => {
          const value = dataset.data[i];
          if(value === null || value === undefined || value === 0) return;
          ctx.save();
          ctx.fillStyle = COLORS.navy;
          ctx.font = '700 9px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(value, bar.x, bar.y - 3);
          ctx.restore();
        });
      });
    }
  };
  charts.p1Bar = new Chart(document.getElementById('p1BarInclusoes'), {
    type: 'bar',
    data: { labels: inc.map(d=>d.dia), datasets:[{ data: inc.map(d=>d.valor), backgroundColor: COLORS.navy2, borderRadius:3, maxBarThickness: 26 }] },
    options: { responsive:true, maintainAspectRatio:false, layout:{ padding:{ top:14 } },
      plugins:{ legend:{display:false} },
      scales:{ y:{ beginAtZero:true, ticks:{font:{size:9}}, grid:{color:'#EEF1F7'} }, x:{ ticks:{font:{size:8.5}}, grid:{display:false} } } },
    plugins: [barValueLabelPlugin]
  });
  // 1. Entradas (Hoje) - Dinâmico para a data atualizada
  const posicaoParts = DATA.meta.posicao_em.split('-');
  const diaHoje = `${posicaoParts[2]}/${posicaoParts[1]}`;
  const hojeEntry = inc.find(d => d.dia === diaHoje);
  const valorHoje = hojeEntry ? hojeEntry.valor : 0;
  document.getElementById('p1EntradaHojeValue').textContent = `+${fmtInt(valorHoje)}`;
  document.getElementById('p1EntradaHojeSub').textContent = `Dia atualizado: ${fmtDateBR(DATA.meta.posicao_em)}`;

  // 2. Entradas Acumuladas do Mês (filtra apenas o mês atual baseado em posicao_em)
  const mesAtual = posicaoParts[1]; // ex: "07"
  const incMesAtual = inc.filter(d => d.dia.endsWith('/' + mesAtual));
  const totalPeriodo = incMesAtual.reduce((acc, d) => acc + d.valor, 0);
  document.getElementById('p1EntradaAcumuladoValue').textContent = `+${fmtInt(totalPeriodo)}`;
  const ultimoDiaMes = incMesAtual.length > 0 ? incMesAtual[incMesAtual.length - 1] : inc[inc.length - 1];
  document.getElementById('p1EntradaAcumuladoSub').textContent = `Último dia com inclusão registrada: ${ultimoDiaMes.dia}/2026`;
  const dCol = [COLORS.navy2, COLORS.teal, COLORS.blue];
  const dest = document.getElementById('p1Destaques'); dest.innerHTML = '';
  p.destaques_periodo.forEach((d,i)=>{
    const row = el('div','destaque-row');
    const dot = el('div','destaque-dot'); dot.style.background = dCol[i%3];
    const txt = el('div'); txt.innerHTML = `<span class="destaque-date">${d.data}</span><span class="destaque-text">${d.texto}</span>`;
    row.appendChild(dot); row.appendChild(txt); dest.appendChild(row);
  });

  const pmt = p.inclusoes_por_mes_tipo;
  const pmtHeaders = ['TIPO', ...pmt.meses, 'TOTAL GERAL'];
  const pmtRowAdesao = ['ADESÃO / INDIVIDUAL', ...pmt.adesao.map(fmtInt), fmtInt(pmt.adesao_total)];
  const pmtRowEmpresarial = ['EMPRESARIAL', ...pmt.empresarial.map(fmtInt), fmtInt(pmt.empresarial_total)];
  const pmtRowTotal = ['TOTAL GERAL', ...pmt.total.map(fmtInt), fmtInt(pmt.total_geral)];
  buildTable(document.getElementById('p1PivotMesTipo'), pmtHeaders, [pmtRowAdesao, pmtRowEmpresarial, pmtRowTotal], 2);

  const pmv = p.valores_inclusoes_por_mes_tipo;
  const pmvHeaders = ['TIPO', ...pmv.meses, 'TOTAL GERAL'];
  const pmvRowAdesao = ['ADESÃO / INDIVIDUAL', ...pmv.adesao.map(fmtMoeda), fmtMoeda(pmv.adesao_total)];
  const pmvRowEmpresarial = ['EMPRESARIAL', ...pmv.empresarial.map(fmtMoeda), fmtMoeda(pmv.empresarial_total)];
  const pmvRowTotal = ['TOTAL GERAL', ...pmv.total.map(fmtMoeda), fmtMoeda(pmv.total_geral)];
  buildTable(document.getElementById('p1PivotMesTipoValor'), pmvHeaders, [pmvRowAdesao, pmvRowEmpresarial, pmvRowTotal], 2);

  const va = p.vendas_adesao_por_produto;
  const headers = ['PRODUTO', ...va.meses, 'TOTAL'];
  const rows = va.produtos.map(pr => [pr.produto, ...pr.valores.map(fmtInt), fmtInt(pr.total)]);
  rows.push(['TOTAL', ...va.total.map(fmtInt), fmtInt(va.total_geral)]);
  buildTable(document.getElementById('p1VendasTable'), headers, rows, rows.length-1);

  const medalColors = [COLORS.gold, '#9AA5B1', '#C0772E'];
  const rk = document.getElementById('p1Ranking'); rk.innerHTML = '';
  p.ranking_vendas.forEach((r,i)=>{
    const b = el('div','rank-badge');
    const m = el('div','rank-medal', r.posicao); m.style.background = medalColors[i%3];
    b.appendChild(m);
    b.appendChild(el('div','rank-name', r.produto));
    b.appendChild(el('div','rank-pct', `${fmtPct(r.pct)} (${fmtInt(r.vidas)})`));
    rk.appendChild(b);
  });

  const stats = document.getElementById('p1Stats'); stats.innerHTML = '';
  const statDefs = [
    ['award', `${p.melhor_mes.mes}`, `Melhor mês (${fmtInt(p.melhor_mes.inclusoes)} inclusões)`],
    ['calendar', fmtPct(p.media_mensal,1).replace('%',''), 'Média mensal'],
    ['box', fmtInt(p.acumulado_2026), `Acumulado ${posicaoParts[0]}`]
  ];
  statDefs.forEach(([ic,val,lbl])=>{
    const chip = el('div','stat-chip');
    const icon = el('div','ic', ICONS[ic]);
    const tx = el('div','tx', `<b>${val}</b>${lbl}`);
    chip.appendChild(icon); chip.appendChild(tx); stats.appendChild(chip);
  });

  const vc = p.vendas_por_consultor;
  if(charts.p1DonutConsultor) charts.p1DonutConsultor.destroy();
  charts.p1DonutConsultor = new Chart(document.getElementById('p1DonutConsultor'), {
    type: 'doughnut',
    data: { labels: vc.map(x=>x.consultor), datasets:[{ data: vc.map(x=>x.vendas), backgroundColor: DONUT5, borderWidth:0 }] },
    options: { responsive:true, maintainAspectRatio:false, cutout:'68%',
      plugins:{ legend:{display:false}, centerText:{ line1: fmtInt(p.vendas_por_consultor_total), line2:'VENDAS' } } }
  });
  legendList('p1ConsultorLegend', vc.map(x=>({label:x.consultor, value:`${fmtInt(x.vendas)} (${fmtPct(x.pct)})`})), DONUT5);

  const ijc = p.inclusoes_junho_por_consultor;
  document.getElementById('p1IncJunConsultorTitle').textContent = `Inclusões de ${ijc.mes_ref} por Consultor/Corretora`;
  const ijcHeaders = ['CONSULTOR / CORRETORA', 'TIPO', 'INCLUSÕES', '% DO TOTAL', 'VALOR DA VIDA (R$)'];
  const ijcRows = ijc.itens.map(it => [it.consultor, it.tipo, fmtInt(it.inclusoes), fmtPct(it.pct), fmtMoeda(it.valor)]);
  ijcRows.push(['TOTAL GERAL', '', fmtInt(ijc.total), fmtPct(100), fmtMoeda(ijc.valor_total)]);
  buildTable(document.getElementById('p1IncJunConsultorTable'), ijcHeaders, ijcRows, ijcRows.length-1, [1]);

  const ijd = p.inclusoes_junho_detalhe;
  document.getElementById('p1IncJunDetalheTitle').textContent = `Inclusões de ${ijd.mes_ref} — Detalhamento por Beneficiário`;
  const ijdHeaders = ['TIPO DE CONTRATO', 'DATA VIGÊNCIA', 'CONTRATANTE (INDIVIDUAL OU NOME DA EMPRESA)', 'CONSULTOR', 'TIPO DESCRIÇÃO', 'TIPO BENEFICIÁRIO', 'BENEFICIÁRIO', 'CPF/CNPJ BENEFICIÁRIO', 'TOTAL GERAL (R$)'];
  const parseVig = s => { const [d,m,y] = (s||'').split('/'); return new Date(+y,+m-1,+d); };
  const ijdSorted = [...ijd.itens].sort((a,b) => parseVig(a.vigencia) - parseVig(b.vigencia));
  const ijdRows = ijdSorted.map(it => [it.tipo, it.vigencia, it.contratante, (it.consultor === 'null' || !it.consultor) ? 'VENDA DIRETA (SITE)' : it.consultor, it.tipo_descricao, it.tipo_beneficiario, it.beneficiario, it.cpf_cnpj, fmtMoeda(it.valor)]);
  ijdRows.push(['TOTAL GERAL', '', '', '', '', '', '', '', fmtMoeda(ijd.valor_total)]);
  buildTable(document.getElementById('p1IncJunDetalheTable'), ijdHeaders, ijdRows, ijdRows.length-1, [1,2,3,4,5,6,7]);

  document.getElementById('p1Mensagem').textContent = p.mensagem_diretoria;

  // Títulos dinâmicos - Page 1
  const anoRef = posicaoParts[0];
  const mesesGrafico = [...new Set(inc.map(d => d.dia.split('/')[1]))].map(m => {
    const nomes = {'01':'Jan','02':'Fev','03':'Mar','04':'Abr','05':'Mai','06':'Jun','07':'Jul','08':'Ago','09':'Set','10':'Out','11':'Nov','12':'Dez'};
    return nomes[m] || m;
  });
  document.getElementById('p1IncDiaTitle').textContent = `Inclusões Individual por Dia — ${mesesGrafico.join('+')}/${anoRef}`;
  document.getElementById('p1ConsultorTitle').textContent = `Vendas por Consultor — ${anoRef}`;
  document.getElementById('p1VendasTitle').textContent = `Vendas Individual por Produto — ${anoRef}`;
  document.getElementById('p1IncMesTipoTitle').textContent = `Inclusões por Mês e Tipo — ${anoRef}`;
  document.getElementById('p1ValorIncTitle').textContent = `Valor das Inclusões por Mês e Tipo — ${anoRef}`;
}

/* ---------------- PAGE 2 ---------------- */
function renderPage2(){
  const p = DATA.pagina2_evolucao_movimentacao;
  const k = p.kpis;
  const kpis = document.getElementById('p2-kpis'); kpis.innerHTML = '';
  kpis.appendChild(kpiCard('trend', COLORS.navy2, fmtInt(k.inclusoes_2026), 'INCLUSÕES EM 2026', 'Total acumulado no ano'));
  kpis.appendChild(kpiCard('trend', COLORS.red, fmtInt(k.exclusoes_2026), 'EXCLUSÕES EM 2026', 'Total acumulado no ano'));
  kpis.appendChild(kpiCard('scale', k.saldo_liquido >= 0 ? COLORS.teal : COLORS.red, `${k.saldo_liquido >= 0 ? '+' : ''}${fmtInt(k.saldo_liquido)}`, 'SALDO LÍQUIDO', 'Inclusões − Exclusões'));
  kpis.appendChild(kpiCard('building', COLORS.navy, fmtInt(k.base_atual), 'BASE ATUAL', `Vidas ativas em ${fmtDateBR(DATA.meta.posicao_em)}`));
  kpis.appendChild(kpiCard('layers', COLORS.purple, fmtPct(k.concentracao_empresarial_pct), 'CONCENTRAÇÃO EMPRESARIAL', '% da base ativa'));

  document.getElementById('p2Note').textContent = `${fmtInt(k.obs_s1_saude)} vidas via referentes às inclusões da S1 SAÚDE no mês 05/2026`;

  const evo = p.evolucao_mensal;
  if(charts.p2Evo) charts.p2Evo.destroy();
  charts.p2Evo = new Chart(document.getElementById('p2Evolucao'), {
    data: {
      labels: evo.map(m=>m.mes),
      datasets: [
        { type:'bar', label:'Inclusões', data: evo.map(m=>m.inclusoes), backgroundColor: COLORS.navy2, borderRadius:3, order:2 },
        { type:'bar', label:'Exclusões', data: evo.map(m=>m.exclusoes), backgroundColor: COLORS.red, borderRadius:3, order:2 },
        { type:'line', label:'Saldo Líquido', data: evo.map(m=>m.saldo), borderColor: COLORS.teal, backgroundColor: COLORS.teal,
          borderDash:[5,3], pointRadius:3, tension:0.25, yAxisID:'y1', order:1 }
      ]
    },
    options: { responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ position:'top', align:'start', labels:{ font:{size:9.5}, boxWidth:10 } } },
      scales:{
        y:{ beginAtZero:true, ticks:{font:{size:9}}, grid:{color:'#EEF1F7'} },
        y1:{ position:'right', grid:{display:false}, ticks:{font:{size:9}} },
        x:{ ticks:{font:{size:8.5}}, grid:{display:false} }
      } }
  });

  const incP = p.inclusoes_por_produto;
  if(charts.p2DonutInc) charts.p2DonutInc.destroy();
  charts.p2DonutInc = new Chart(document.getElementById('p2DonutInclusoes'), {
    type:'doughnut',
    data:{ labels: incP.map(x=>x.produto), datasets:[{ data: incP.map(x=>x.vidas), backgroundColor: DONUT5, borderWidth:0 }] },
    options:{ responsive:true, maintainAspectRatio:false, cutout:'68%',
      plugins:{ legend:{display:false}, centerText:{ line1: fmtInt(p.inclusoes_por_produto_total), line2:'INCLUSÕES' } } }
  });
  legendList('p2IncLegend', incP.map(x=>({label:x.produto, value:`${fmtInt(x.vidas)} (${fmtPct(x.pct)})`})), DONUT5);

  const mot = p.motivos_exclusao;
  if(charts.p2DonutMot) charts.p2DonutMot.destroy();
  charts.p2DonutMot = new Chart(document.getElementById('p2DonutMotivos'), {
    type:'doughnut',
    data:{ labels: mot.map(x=>x.motivo), datasets:[{ data: mot.map(x=>x.vidas), backgroundColor: DONUT5, borderWidth:0 }] },
    options:{ responsive:true, maintainAspectRatio:false, cutout:'68%',
      plugins:{ legend:{display:false}, centerText:{ line1: fmtInt(p.motivos_exclusao_total), line2:'EXCLUSÕES' } } }
  });
  legendList('p2MotLegend', mot.map(x=>({label:x.motivo, value:`${fmtInt(x.vidas)} (${fmtPct(x.pct)})`})), DONUT5);

  const headers = ['#','EMPRESA','VIDAS','% EMPRESARIAL'];
  const rows = p.top5_empresas.map(e=>[e.posicao, e.empresa, fmtInt(e.vidas), fmtPct(e.pct_empresarial)]);
  buildTable(document.getElementById('p2EmpresasTable'), headers, rows, -1, [1]);

  const stats2 = document.getElementById('p2Stats'); stats2.innerHTML = '';
  const statDefs2 = [
    ['box', fmtInt(p.top5_total_vidas), 'Vidas no Top 5'],
    ['layers', fmtPct(p.top5_pct_base_empresarial), 'da base empresarial'],
    ['trend', `+${fmtInt(p.top5_vidas_acima_demais)}`, 'vidas acima das demais empresas']
  ];
  statDefs2.forEach(([ic,val,lbl])=>{
    const chip = el('div','stat-chip');
    const icon = el('div','ic', ICONS[ic]);
    const tx = el('div','tx', `<b>${val}</b>${lbl}`);
    chip.appendChild(icon); chip.appendChild(tx); stats2.appendChild(chip);
  });

  const rCol = [COLORS.teal, COLORS.navy2, COLORS.orange, COLORS.purple];
  const resumo = document.getElementById('p2Resumo'); resumo.innerHTML = '';
  p.resumo_executivo.forEach((r,i)=>{
    const row = el('div','resumo-item');
    const dot = el('div','resumo-dot'); dot.style.background = rCol[i%4];
    const txt = el('div');
    txt.appendChild(el('div','resumo-title', r.titulo));
    txt.appendChild(el('div','resumo-text', r.texto));
    row.appendChild(dot); row.appendChild(txt); resumo.appendChild(row);
  });

  document.getElementById('p2Mensagem').textContent = p.mensagem_diretoria;

  // Títulos dinâmicos - Page 2
  const anoRef2 = DATA.meta.posicao_em.split('-')[0];
  document.getElementById('p2IncProdTitle').textContent = `Inclusões ${anoRef2} por Produto`;
  document.getElementById('p2MotivosTitle').textContent = `Principais Motivos de Exclusão ${anoRef2}`;
}

/* ---------------- PAGE 3 ---------------- */
function renderPage3(){
  const p = DATA.pagina3_carteira_por_produto;
  const k = p.kpis;
  const kpis = document.getElementById('p3-kpis'); kpis.innerHTML = '';
  kpis.appendChild(kpiCard('users', COLORS.navy, fmtInt(k.vidas_ativas), 'VIDAS ATIVAS', 'Total da carteira'));
  kpis.appendChild(kpiCard('heart', COLORS.teal, fmtInt(k.adesao), 'ADESÃO', `${fmtPct(k.adesao_pct)} do total`));
  kpis.appendChild(kpiCard('building', COLORS.navy2, fmtInt(k.empresarial), 'EMPRESARIAL', `${fmtPct(k.empresarial_pct)} do total`));
  kpis.appendChild(kpiCard('layers', COLORS.orange, fmtInt(k.produtos_disponiveis), 'PRODUTOS', 'Disponíveis na carteira'));

  function buildDistTable(tableId, items){
    const headers = ['PRODUTO','VIDAS','%'];
    const rows = items.map(it => [it.produto, fmtInt(it.vidas), fmtPct(it.pct)]);
    const totalIdx = items.findIndex(it=>it.destaque);
    buildTable(document.getElementById(tableId), headers, rows, totalIdx);
  }
  buildDistTable('p3AdesaoTable', p.distribuicao_adesao);
  buildDistTable('p3EmpresarialTable', p.distribuicao_empresarial);

  const da = p.donut_adesao;
  if(charts.p3DonutA) charts.p3DonutA.destroy();
  charts.p3DonutA = new Chart(document.getElementById('p3DonutAdesao'), {
    type:'doughnut',
    data:{ labels: da.map(x=>x.produto), datasets:[{ data: da.map(x=>x.vidas), backgroundColor: DONUT5, borderWidth:0 }] },
    options:{ responsive:true, maintainAspectRatio:false, cutout:'68%',
      plugins:{ legend:{display:false}, centerText:{ line1: fmtInt(k.adesao), line2:'VIDAS ATIVAS' } } }
  });
  legendList('p3AdesaoLegend', da.map(x=>({label:x.produto, value:`${fmtInt(x.vidas)} (${fmtPct(x.pct)})`})), DONUT5);
  document.getElementById('p3DestaqueAdesao').textContent = p.destaques.adesao;

  const de = p.donut_empresarial;
  if(charts.p3DonutE) charts.p3DonutE.destroy();
  charts.p3DonutE = new Chart(document.getElementById('p3DonutEmpresarial'), {
    type:'doughnut',
    data:{ labels: de.map(x=>x.produto), datasets:[{ data: de.map(x=>x.vidas), backgroundColor: DONUT5, borderWidth:0 }] },
    options:{ responsive:true, maintainAspectRatio:false, cutout:'68%',
      plugins:{ legend:{display:false}, centerText:{ line1: fmtInt(k.empresarial), line2:'VIDAS ATIVAS' } } }
  });
  legendList('p3EmpresarialLegend', de.map(x=>({label:x.produto, value:`${fmtInt(x.vidas)} (${fmtPct(x.pct)})`})), DONUT5);
  document.getElementById('p3DestaqueEmpresarial').textContent = p.destaques.empresarial;

  document.getElementById('p3Mensagem').textContent = p.resumo_geral;
}

/* ---------------- PAGE 4 — FATURAMENTO ---------------- */
function renderPage4(){
  const p = DATA.faturamento;
  const k = p.kpis;
  const kpis = document.getElementById('p4-kpis'); kpis.innerHTML = '';
  kpis.appendChild(kpiCard('layers', COLORS.navy, fmtMoeda(k.total_gerado), 'TOTAL FATURADO (GERADO)', 'Acumulado 2026'));
  kpis.appendChild(kpiCard('scale', COLORS.teal, fmtMoeda(k.total_pago), 'TOTAL RECEBIDO (PAGO)', 'Acumulado 2026'));
  kpis.appendChild(kpiCard('award', COLORS.navy2, fmtPct(k.taxa_pagamento_pct), 'TAXA DE PAGAMENTO', 'Pago / Gerado'));
  kpis.appendChild(kpiCard('trend', COLORS.orange, fmtMoeda(k.saldo_a_receber), 'SALDO A RECEBER', 'Gerado − Pago'));
  kpis.appendChild(kpiCard('calendar', COLORS.purple, fmtMoeda(k.ticket_medio_mensal), 'TICKET MÉDIO MENSAL', 'Média Jan–Jun/2026'));
  kpis.appendChild(kpiCard('calendar', COLORS.gray, fmtMoeda(k.ticket_medio_mensal_por_vida), 'TICKET MÉDIO MENSAL POR VIDA', `Base de ${fmtInt(k.vidas_consideradas_ticket)} vidas (exclui ${fmtInt(k.vidas_internas_grupo)} internas do grupo)`));

  document.getElementById('p4Note').textContent = p.observacao_periodo;

  const evo = p.evolucao_mensal;
  if(charts.p4Evo) charts.p4Evo.destroy();
  charts.p4Evo = new Chart(document.getElementById('p4Evolucao'), {
    plugins: [valueLabelsPlugin],
    data: {
      labels: evo.map(m=>m.mes),
      datasets: [
        { type:'bar', label:'Gerado', data: evo.map(m=>m.gerado), backgroundColor: COLORS.navy2, borderRadius:3, order:2,
          showValueLabels:true, valueLabelColor:COLORS.navy2, valueLabelOffset:1, valueLabelFormatter:fmtMoedaCompacta },
        { type:'bar', label:'Pago', data: evo.map(m=>m.pago), backgroundColor: COLORS.teal, borderRadius:3, order:2,
          showValueLabels:true, valueLabelColor:COLORS.teal, valueLabelOffset:1, valueLabelFormatter:fmtMoedaCompacta },
        { type:'line', label:'Taxa de Pagamento %', data: evo.map(m=>m.taxa_pct), borderColor: COLORS.orange, backgroundColor: COLORS.orange,
          borderDash:[5,3], pointRadius:3, tension:0.25, yAxisID:'y1', order:1,
          showValueLabels:true, valueLabelColor:COLORS.orange, valueLabelOffset:6, valueLabelFormatter:v=>fmtPct(v) }
      ]
    },
    options: { responsive:true, maintainAspectRatio:false,
      layout:{ padding:{ top:16 } },
      plugins:{ legend:{ position:'top', align:'start', labels:{ font:{size:9.5}, boxWidth:10 } } },
      scales:{
        y:{ beginAtZero:true, ticks:{font:{size:9}}, grid:{color:'#EEF1F7'} },
        y1:{ position:'right', grid:{display:false}, ticks:{font:{size:9}} },
        x:{ ticks:{font:{size:8.5}}, grid:{display:false} }
      } }
  });

  const evoSeg = p.evolucao_por_segmento;
  if(charts.p4EvoAdesao) charts.p4EvoAdesao.destroy();
  charts.p4EvoAdesao = new Chart(document.getElementById('p4EvoAdesao'), {
    type:'bar',
    plugins: [valueLabelsPlugin],
    data: {
      labels: evoSeg.map(m=>m.mes),
      datasets: [
        { label:'Gerado', data: evoSeg.map(m=>m.adesao_gerado), backgroundColor: COLORS.navy2, borderRadius:3,
          showValueLabels:true, valueLabelColor:COLORS.navy2, valueLabelOffset:1, valueLabelFormatter:fmtMoedaCompacta },
        { label:'Pago', data: evoSeg.map(m=>m.adesao_pago), backgroundColor: COLORS.teal, borderRadius:3,
          showValueLabels:true, valueLabelColor:COLORS.teal, valueLabelOffset:1, valueLabelFormatter:fmtMoedaCompacta }
      ]
    },
    options: { responsive:true, maintainAspectRatio:false,
      layout:{ padding:{ top:16 } },
      plugins:{ legend:{ position:'top', align:'start', labels:{ font:{size:9.5}, boxWidth:10 } } },
      scales:{ y:{ beginAtZero:true, ticks:{font:{size:9}}, grid:{color:'#EEF1F7'} }, x:{ ticks:{font:{size:8.5}}, grid:{display:false} } } }
  });
  if(charts.p4EvoEmpresarial) charts.p4EvoEmpresarial.destroy();
  charts.p4EvoEmpresarial = new Chart(document.getElementById('p4EvoEmpresarial'), {
    type:'bar',
    plugins: [valueLabelsPlugin],
    data: {
      labels: evoSeg.map(m=>m.mes),
      datasets: [
        { label:'Gerado', data: evoSeg.map(m=>m.empresarial_gerado), backgroundColor: COLORS.navy2, borderRadius:3,
          showValueLabels:true, valueLabelColor:COLORS.navy2, valueLabelOffset:1, valueLabelFormatter:fmtMoedaCompacta },
        { label:'Pago', data: evoSeg.map(m=>m.empresarial_pago), backgroundColor: COLORS.teal, borderRadius:3,
          showValueLabels:true, valueLabelColor:COLORS.teal, valueLabelOffset:1, valueLabelFormatter:fmtMoedaCompacta }
      ]
    },
    options: { responsive:true, maintainAspectRatio:false,
      layout:{ padding:{ top:16 } },
      plugins:{ legend:{ position:'top', align:'start', labels:{ font:{size:9.5}, boxWidth:10 } } },
      scales:{ y:{ beginAtZero:true, ticks:{font:{size:9}}, grid:{color:'#EEF1F7'} }, x:{ ticks:{font:{size:8.5}}, grid:{display:false} } } }
  });

  function buildPivotSegMes(tableId, adesaoKey, empresarialKey){
    const headers = ['SEGMENTO', ...evoSeg.map(m=>m.mes), 'TOTAL GERAL'];
    const adesaoVals = evoSeg.map(m=>m[adesaoKey]);
    const empresarialVals = evoSeg.map(m=>m[empresarialKey]);
    const totalVals = adesaoVals.map((v,i)=>v + empresarialVals[i]);
    const rowAdesao = ['ADESÃO', ...adesaoVals.map(fmtMoeda), fmtMoeda(adesaoVals.reduce((s,v)=>s+v,0))];
    const rowEmpresarial = ['EMPRESARIAL', ...empresarialVals.map(fmtMoeda), fmtMoeda(empresarialVals.reduce((s,v)=>s+v,0))];
    const rowTotal = ['TOTAL GERAL', ...totalVals.map(fmtMoeda), fmtMoeda(totalVals.reduce((s,v)=>s+v,0))];
    buildTable(document.getElementById(tableId), headers, [rowAdesao, rowEmpresarial, rowTotal], 2);
  }
  buildPivotSegMes('p4PivotGerado', 'adesao_gerado', 'empresarial_gerado');
  buildPivotSegMes('p4PivotPago', 'adesao_pago', 'empresarial_pago');

  const seg = p.por_segmento;
  if(charts.p4DonutSeg) charts.p4DonutSeg.destroy();
  charts.p4DonutSeg = new Chart(document.getElementById('p4DonutSegmento'), {
    type:'doughnut',
    data:{ labels: seg.map(x=>x.segmento), datasets:[{ data: seg.map(x=>x.gerado), backgroundColor:[COLORS.navy2, COLORS.teal], borderWidth:0 }] },
    options:{ responsive:true, maintainAspectRatio:false, cutout:'68%',
      plugins:{ legend:{display:false}, centerText:{ line1: fmtMoedaCompacta(k.total_gerado), line2:'GERADO 2026' } } }
  });
  legendList('p4SegLegend', seg.map(x=>({label:x.segmento, value:`${fmtMoeda(x.gerado)} (${fmtPct(x.pct)})`})), [COLORS.navy2, COLORS.teal]);

  const top = p.top_produtos;
  if(charts.p4DonutTop) charts.p4DonutTop.destroy();
  charts.p4DonutTop = new Chart(document.getElementById('p4DonutTop'), {
    type:'doughnut',
    data:{ labels: top.map(x=>x.produto), datasets:[{ data: top.map(x=>x.valor), backgroundColor: DONUT5, borderWidth:0 }] },
    options:{ responsive:true, maintainAspectRatio:false, cutout:'68%',
      plugins:{ legend:{display:false}, centerText:{ line1: fmtMoedaCompacta(k.total_gerado), line2:'GERADO 2026' } } }
  });
  legendList('p4TopLegend', top.map(x=>({label:x.produto, value:`${fmtMoeda(x.valor)} (${fmtPct(x.pct)})`})), DONUT5);

  function buildFatTable(tableId, items){
    const headers = ['PRODUTO','GERADO (R$)','PAGO (R$)','%'];
    const rows = items.map(it => [it.produto, fmtMoeda(it.valor), fmtMoeda(it.pago || 0), fmtPct(it.pct)]);
    const totalVal = items.reduce((s,it)=>s+it.valor,0);
    const totalPago = items.reduce((s,it)=>s+(it.pago || 0),0);
    rows.push(['TOTAL', fmtMoeda(totalVal), fmtMoeda(totalPago), fmtPct(100)]);
    buildTable(document.getElementById(tableId), headers, rows, rows.length-1);
  }
  buildFatTable('p4AdesaoTable', p.produtos_adesao);
  buildFatTable('p4EmpresarialTable', p.produtos_empresarial);
  document.getElementById('p4DestaqueAdesao').textContent = p.destaques.adesao;
  document.getElementById('p4DestaqueEmpresarial').textContent = p.destaques.empresarial;

  document.getElementById('p4Mensagem').textContent = p.mensagem_diretoria;

  // Títulos dinâmicos - Page 4 (Faturamento)
  const anoRef4 = DATA.meta.posicao_em.split('-')[0];
  const periodoFat = p.periodo || `Janeiro a Julho/${anoRef4}`;
  document.getElementById('p4EvoTitle').textContent = `Evolução Mensal — Faturamento Gerado x Pago — ${periodoFat}`;
  document.getElementById('p4SegTitle').textContent = `Faturamento por Segmento — Gerado de ${periodoFat}`;
  document.getElementById('p4TopTitle').textContent = `Top Produtos por Receita — Gerado de ${periodoFat}`;
  document.getElementById('p4PivotGeradoTitle').textContent = `Faturamento Gerado por Segmento — Mês a Mês (${anoRef4})`;
  document.getElementById('p4EvoAdesaoTitle').textContent = `Faturamento Mensal — Adesão (Gerado x Pago) — ${periodoFat}`;
  document.getElementById('p4EvoEmpresarialTitle').textContent = `Faturamento Mensal — Empresarial (Gerado x Pago) — ${periodoFat}`;
  document.getElementById('p4PivotPagoTitle').textContent = `Faturamento Pago por Segmento — Mês a Mês (${anoRef4})`;
  document.getElementById('p4AdesaoTableTitle').textContent = `Faturamento por Produto — Adesão (Gerado de ${periodoFat})`;
  document.getElementById('p4EmpresarialTableTitle').textContent = `Faturamento por Produto — Empresarial (Gerado de ${periodoFat})`;
}

/* ---------------- header + footer + tabs ---------------- */
function safeGetStorage(key, defaultVal = null) {
  try {
    const val = sessionStorage.getItem(key);
    return val !== null ? val : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function safeSetStorage(key, val) {
  try {
    sessionStorage.setItem(key, val);
  } catch (e) {}
}

const TAB_META = {
  '1': { kicker:'DR. HOJE', title:'VISÃO EXECUTIVA - VENDAS', subtitle:'CARTEIRA DE BENEFICIÁRIOS' },
  '2': { kicker:'DR. HOJE', title:'VISÃO EXECUTIVA 02', subtitle:'EVOLUÇÃO E MOVIMENTAÇÃO DA CARTEIRA' },
  '3': { kicker:'DR. HOJE', title:'VIDAS ATIVAS POR PRODUTO', subtitle:'DISTRIBUIÇÃO DE VIDAS POR TIPO E PRODUTO' },
  '4': { kicker:'DR. HOJE', title:'VISÃO FATURAMENTO', subtitle:'RECEITA GERADA E PAGA' }
};
let rendered = { '1':false, '2':false, '3':false, '4':false };
const renderers = { '1':renderPage1, '2':renderPage2, '3':renderPage3, '4':renderPage4 };

function activateTab(n){
  document.querySelectorAll('.tab-btn').forEach(b => {
    if (b.id !== 'btnPlayPause') b.classList.toggle('active', b.dataset.tab === n);
  });
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === 'panel-'+n));
  const m = TAB_META[n];
  document.getElementById('hdrKicker').textContent = m.kicker;
  document.getElementById('hdrTitle').textContent = m.title;
  document.getElementById('hdrSubtitle').textContent = m.subtitle;
  safeSetStorage('dh_active_tab', n);
  if(!rendered[n]){ renderers[n](); rendered[n] = true; }
  else { Object.values(charts).forEach(c => c && c.resize && c.resize()); }
}

let presentationInterval = null;
let isPlaying = safeGetStorage('dh_presentation_playing') !== 'false';

function startPresentation() {
  if (presentationInterval) clearInterval(presentationInterval);
  presentationInterval = setInterval(() => {
    if (!isPlaying) return;
    const currentTab = safeGetStorage('dh_active_tab', '1');
    let nextTab = '1';
    if (currentTab === '1') nextTab = '2';
    else if (currentTab === '2') nextTab = '3';
    else if (currentTab === '3') nextTab = '4';
    else if (currentTab === '4') nextTab = '1';
    activateTab(nextTab);
  }, 60000);
}

function updatePlayPauseButton() {
  const btn = document.getElementById('btnPlayPause');
  if (!btn) return;
  if (isPlaying) {
    btn.innerHTML = '⏸ Pausar';
    btn.style.background = '#F2994A';
    btn.style.borderColor = '#F2994A';
  } else {
    btn.innerHTML = '▶ Apresentação';
    btn.style.background = '#16A085';
    btn.style.borderColor = '#16A085';
  }
}

function togglePresentation() {
  isPlaying = !isPlaying;
  safeSetStorage('dh_presentation_playing', isPlaying ? 'true' : 'false');
  updatePlayPauseButton();
  if (isPlaying) {
    startPresentation();
  } else {
    if (presentationInterval) clearInterval(presentationInterval);
  }
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  if (btn.id === 'btnPlayPause') return;
  btn.addEventListener('click', () => {
    if (isPlaying) {
      togglePresentation();
    }
    activateTab(btn.dataset.tab);
  });
});

/* ---------------- Criptografia Militar AES-256-GCM + PBKDF2-SHA256 ---------------- */
function b64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToB64(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

async function decryptWithMasterKeyBytes(encPayload, rawMasterKey) {
  const masterCryptoKey = await window.crypto.subtle.importKey(
    'raw',
    rawMasterKey,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  const dataIv = b64ToBytes(encPayload.iv);
  const dataCt = b64ToBytes(encPayload.ct);
  const plainBuf = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: dataIv },
    masterCryptoKey,
    dataCt
  );
  const jsonText = new TextDecoder().decode(plainBuf);
  return JSON.parse(jsonText);
}

async function unlockPayloadWithCredentials(encPayload, username, password) {
  if (!encPayload || !encPayload.ct || !Array.isArray(encPayload.slots)) {
    throw new Error('Pacote criptografado ausente ou invalido.');
  }
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error('Ambiente sem suporte a Web Crypto API (acesse via HTTPS ou localhost).');
  }
  const credStr = `${username.trim().toLowerCase()}:${password.trim()}`;
  const credBytes = new TextEncoder().encode(credStr);
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    credBytes,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  for (const slot of encPayload.slots) {
    try {
      const salt = b64ToBytes(slot.s);
      const wrapIv = b64ToBytes(slot.iv);
      const wrappedKey = b64ToBytes(slot.k);
      const kek = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: encPayload.iter || 100000,
          hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );
      const unwrapped = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: wrapIv },
        kek,
        wrappedKey
      );
      const rawMasterKey = new Uint8Array(unwrapped);
      const decryptedData = await decryptWithMasterKeyBytes(encPayload, rawMasterKey);
      return { data: decryptedData, masterKeyB64: bytesToB64(rawMasterKey) };
    } catch (_) {
      // Slot nao pertence a esta credencial
    }
  }
  return null;
}

function initializeAuthenticatedDashboard(decryptedData, defaultTab) {
  DATA = decryptedData;
  if (DATA && DATA.meta && DATA.meta.posicao_em && TAB_META['4']) {
    TAB_META['4'].subtitle = `RECEITA GERADA E PAGA — ${DATA.meta.posicao_em.split('-')[0]}`;
  }
  document.getElementById('hdrDate').textContent = fmtDateBR(DATA.meta.posicao_em);
  document.getElementById('footFonte').textContent = `Fonte: ${DATA.meta.fonte} | Desenvolvido por Geisa Gomes`;
  const atData = DATA.meta.atualizado_em || '';
  document.getElementById('footAtualizado').textContent = atData.includes('às')
    ? `Dados atualizados em ${atData}`
    : `Dados atualizados em ${fmtDateBR(atData)}`;

  document.getElementById('login-overlay').style.display = 'none';
  document.getElementById('main-content-wrap').style.display = 'block';

  const activeTab = safeGetStorage('dh_active_tab', defaultTab);
  rendered = { '1': false, '2': false, '3': false, '4': false };
  activateTab(activeTab);
  if (typeof charts !== 'undefined') {
    Object.values(charts).forEach(c => c && c.resize && c.resize());
  }
}

async function handleLogin() {
  const userEl = document.getElementById('username');
  const passEl = document.getElementById('password');
  const errorEl = document.getElementById('login-error-msg');
  const btn = document.getElementById('login-submit-btn');

  const user = (userEl ? userEl.value : '').trim();
  const pass = (passEl ? passEl.value : '').trim();
  errorEl.textContent = '';

  if (!user || !pass) {
    errorEl.textContent = 'Preencha o usuário e a senha.';
    return;
  }

  const originalBtnText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Verificando...';

  try {
    const unlocked = await unlockPayloadWithCredentials(window.ENCRYPTED_PAYLOAD, user, pass);
    if (unlocked && unlocked.data) {
      safeSetStorage('dh_session_mk', unlocked.masterKeyB64);
      initializeAuthenticatedDashboard(unlocked.data, '1');
    } else {
      errorEl.textContent = 'Acesso negado. Usuário ou senha incorretos.';
    }
  } catch (err) {
    console.error('Erro na descriptografia:', err);
    errorEl.textContent = 'Não foi possível validar as credenciais neste ambiente.';
  } finally {
    btn.disabled = false;
    btn.textContent = originalBtnText;
  }
}

async function initLogin() {
  const submitBtn = document.getElementById('login-submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', handleLogin);
  }
  const passInput = document.getElementById('password');
  if (passInput) {
    passInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
  }

  const btnPP = document.getElementById('btnPlayPause');
  if (btnPP) btnPP.addEventListener('click', togglePresentation);
  updatePlayPauseButton();
  if (isPlaying) {
    startPresentation();
  }

  // Restaura sessao autenticada na aba atual usando apenas a chave de sessao em memoria temporaria
  const cachedMk = safeGetStorage('dh_session_mk', null);
  if (cachedMk && window.ENCRYPTED_PAYLOAD) {
    try {
      const rawMk = b64ToBytes(cachedMk);
      const decryptedData = await decryptWithMasterKeyBytes(window.ENCRYPTED_PAYLOAD, rawMk);
      if (decryptedData) {
        initializeAuthenticatedDashboard(decryptedData, '1');
      }
    } catch (_) {
      try { sessionStorage.removeItem('dh_session_mk'); } catch (e) {}
    }
  }
}

// Auto-refresh a cada 10 minutos (600.000 ms)
setTimeout(() => {
  window.location.reload();
}, 600000);

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initLogin);
} else {
  initLogin();
}
