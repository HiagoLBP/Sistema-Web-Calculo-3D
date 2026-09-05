function carregarFinanceiro() {
    const filtroMes = document.getElementById('filtroMesFinanceiro').value;
    let url = '/api/financeiro/dashboard';

    if (filtroMes) {
        url += `?mesAno=${filtroMes}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const saldoEl = document.getElementById('dashSaldo');
            saldoEl.innerText = `R$ ${data.saldoAtual.toFixed(2).replace('.', ',')}`;
            saldoEl.style.color = data.saldoAtual >= 0 ? 'var(--result)' : 'var(--danger)';
            document.getElementById('dashReceitas').innerText = `R$ ${data.totalReceitas.toFixed(2).replace('.', ',')}`;
            document.getElementById('dashDespesas').innerText = `R$ ${data.totalDespesas.toFixed(2).replace('.', ',')}`;

            const tbody = document.getElementById('financeiroTbody');
            tbody.innerHTML = '';

            if(data.historico.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-faint);">Nenhuma transação neste período.</td></tr>`;
            } else {
                data.historico.reverse().forEach(t => {
                    const dataFormatada = new Date(t.data).toLocaleDateString('pt-BR');
                    const corValor = t.tipo === 'RECEITA' ? 'var(--result)' : 'var(--danger)';
                    const sinal = t.tipo === 'RECEITA' ? '+' : '-';

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td style="color: var(--text-dim); font-size: 0.85rem;">${dataFormatada}</td>
                        <td style="font-weight: 500;">${t.descricao}</td>
                        <td style="font-size: 0.8rem; color: var(--text-dim);">${t.tipo}</td>
                        <td style="text-align: right; color: ${corValor}; font-family: 'IBM Plex Mono', monospace;">
                            ${sinal} R$ ${t.valor.toFixed(2).replace('.', ',')}
                        </td>
                        <td style="text-align: right;">
                            <button class="btn-delete" onclick="excluirTransacao(${t.id})" title="Excluir">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            const ctx = document.getElementById('graficoFinanceiro').getContext('2d');
            if(chartInstancia) chartInstancia.destroy();
            chartInstancia = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Receitas', 'Despesas'],
                    datasets: [{
                        data: [data.totalReceitas, data.totalDespesas],
                        backgroundColor: ['#35d69a', '#ff7a7a'], borderWidth: 0, hoverOffset: 4
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#eef1f6' } } } }
            });
        })
        .catch(error => console.error('Erro ao carregar o dashboard:', error));
}

function salvarTransacao() {
    const descricao = document.getElementById('descTransacao').value;
    const valor = parseFloat(document.getElementById('valorTransacao').value);
    const tipo = document.getElementById('tipoTransacao').value;

    if(!descricao || isNaN(valor) || valor <= 0) {
        alert("Preencha a descrição e um valor maior que zero!");
        return;
    }

    const transacao = { descricao, valor, tipo };

    fetch('/api/financeiro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transacao)
    })
        .then(response => {
            if(response.ok) {
                document.getElementById('descTransacao').value = '';
                document.getElementById('valorTransacao').value = '';

                carregarFinanceiro();
            }
        })
        .catch(error => console.error('Erro ao salvar transação:', error));
}



function excluirTransacao(id) {
    if (!confirm('Deseja realmente excluir este lançamento financeiro?')) return;

    fetch(`/api/financeiro/${id}`, { method: 'DELETE' })
        .then(response => {
            if (response.ok) carregarFinanceiro();
            else alert('Erro ao excluir transação.');
        })
        .catch(error => console.error(error));
}

function carregarFinanceiro() {
    const filtroMes = document.getElementById('filtroMesFinanceiro').value;
    let url = '/api/financeiro/dashboard';

    if (filtroMes) {
        url += `?mesAno=${filtroMes}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const saldoEl = document.getElementById('dashSaldo');
            saldoEl.innerText = `R$ ${data.saldoAtual.toFixed(2).replace('.', ',')}`;
            saldoEl.style.color = data.saldoAtual >= 0 ? 'var(--result)' : 'var(--danger)';
            document.getElementById('dashReceitas').innerText = `R$ ${data.totalReceitas.toFixed(2).replace('.', ',')}`;
            document.getElementById('dashDespesas').innerText = `R$ ${data.totalDespesas.toFixed(2).replace('.', ',')}`;

            const tbody = document.getElementById('financeiroTbody');
            tbody.innerHTML = '';

            if(data.historico.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-faint);">Nenhuma transação neste período.</td></tr>`;
            } else {
                data.historico.reverse().forEach(t => {
                    const dataFormatada = new Date(t.data).toLocaleDateString('pt-BR');
                    const corValor = t.tipo === 'RECEITA' ? 'var(--result)' : 'var(--danger)';
                    const sinal = t.tipo === 'RECEITA' ? '+' : '-';

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td style="color: var(--text-dim); font-size: 0.85rem;">${dataFormatada}</td>
                        <td style="font-weight: 500;">${t.descricao}</td>
                        <td style="font-size: 0.8rem; color: var(--text-dim);">${t.tipo}</td>
                        <td style="text-align: right; color: ${corValor}; font-family: 'IBM Plex Mono', monospace;">
                            ${sinal} R$ ${t.valor.toFixed(2).replace('.', ',')}
                        </td>
                        <td style="text-align: right;">
                            <button class="btn-delete" onclick="excluirTransacao(${t.id})" title="Excluir">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            const ctx = document.getElementById('graficoFinanceiro').getContext('2d');
            if(chartInstancia) chartInstancia.destroy();
            chartInstancia = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Receitas', 'Despesas'],
                    datasets: [{
                        data: [data.totalReceitas, data.totalDespesas],
                        backgroundColor: ['#35d69a', '#ff7a7a'], borderWidth: 0, hoverOffset: 4
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#eef1f6' } } } }
            });
        })
        .catch(error => console.error('Erro ao carregar o dashboard:', error));
}

