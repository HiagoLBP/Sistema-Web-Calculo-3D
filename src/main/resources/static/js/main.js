let listaImpressoras = [];
let ultimoPrecoCalculado = 0;
let ultimoCalculoDetalhado = null;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let chartInstancia = null;

document.addEventListener('DOMContentLoaded', function () {
    const now = new Date();
    const ano = now.getFullYear();
    const mes = String(now.getMonth() + 1).padStart(2, '0');
    document.getElementById('filtroMesFinanceiro').value = `${ano}-${mes}`;
    carregarImpressoras();
});

function switchTab(tab) {
    document.getElementById('btnTabCalculadora').classList.toggle('active', tab === 'calculadora');
    document.getElementById('btnTabEstoque').classList.toggle('active', tab === 'estoque');
    document.getElementById('btnTabFinanceiro').classList.toggle('active', tab === 'financeiro');

    document.getElementById('tabCalculadora').classList.toggle('d-none', tab !== 'calculadora');
    document.getElementById('tabEstoque').classList.toggle('d-none', tab !== 'estoque');
    document.getElementById('tabFinanceiro').classList.toggle('d-none', tab !== 'financeiro');

    if (tab === 'estoque') carregarEstoque();
    if (tab === 'financeiro') carregarFinanceiro();
}

function carregarImpressoras() {
    fetch('/api/impressoras')
        .then(response => response.json())
        .then(impressoras => {
            listaImpressoras = impressoras;
            const select = document.getElementById('impressoraId');
            select.innerHTML = '<option value="">Escolha uma impressora...</option>';
            impressoras.forEach(imp => {
                const option = document.createElement('option');
                option.value = imp.id;
                option.text = imp.nome;
                select.appendChild(option);
            });
        })
        .catch(error => console.error(error));
}

function mostrarDetalhesImpressora() {
    const select = document.getElementById('impressoraId');
    const detalhes = document.getElementById('detalhesImpressora');

    if (!select.value) {
        detalhes.className = 'machine-plate machine-plate--empty';
        detalhes.innerHTML = 'Selecione uma impressora para ver os detalhes.';
        return;
    }

    const imp = listaImpressoras.find(i => i.id == select.value);

    if (imp) {
        detalhes.className = 'machine-plate';
        detalhes.innerHTML = `
        <div class="machine-plate-grid">
          <div class="machine-stat">
            <div class="machine-stat-value">${imp.potenciaWatts}W</div>
            <div class="machine-stat-label">Potência</div>
          </div>
          <div class="machine-stat">
            <div class="machine-stat-value">R$ ${imp.precoImpressora.toFixed(2)}</div>
            <div class="machine-stat-label">Máquina</div>
          </div>
          <div class="machine-stat">
            <div class="machine-stat-value">R$ ${imp.manutencaoAno}</div>
            <div class="machine-stat-label">Manutenção/ano</div>
          </div>
        </div>`;
    }
}

function setResultState(state) {
    document.getElementById('resultIdle').classList.toggle('d-none', state !== 'idle');
    document.getElementById('resultadoBox').classList.toggle('d-none', state !== 'filled');
    document.getElementById('resultError').classList.toggle('d-none', state !== 'error');
}

function sweepRail() {
    const head = document.getElementById('resultRailHead');
    if (!head) return;
    head.style.transition = reduceMotion ? 'none' : '';
    head.style.left = '0px';
    requestAnimationFrame(() => {
        head.style.left = 'calc(100% - 36px)';
    });
    setTimeout(() => {
        head.style.transition = 'none';
        head.style.left = '0px';
    }, 650);
}

function animateValue(el, end) {
    if (reduceMotion) {
        el.innerText = end.toFixed(2).replace('.', ',');
        return;
    }
    const duration = 550;
    const startTime = performance.now();
    function tick(now) {
        const p = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.innerText = (end * eased).toFixed(2).replace('.', ',');
        if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

function formatarTempo(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 2) {
        value = value.substring(0, 2) + ':' + value.substring(2, 4);
    }
    input.value = value;
}

function converterTempoParaDecimal(tempoStr) {
    if (!tempoStr || !tempoStr.includes(':')) return 0;
    const partes = tempoStr.split(':');
    const horas = parseInt(partes[0]) || 0;
    const minutos = parseInt(partes[1]) || 0;
    return horas + (minutos / 60.0);
}

function converterDecimalParaTempo(horasDecimais) {
    if (!horasDecimais) return "00:00";
    const horas = Math.floor(horasDecimais);
    const minutos = Math.round((horasDecimais - horas) * 60);
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

function calcularPreco() {
    const btn = document.querySelector('button[onclick="calcularPreco()"]');
    btn.disabled = true;

    const impressoraSelect = document.getElementById('impressoraId');
    const impressoraId = impressoraSelect.value;

    if (!impressoraId) {
        alert("Por favor, selecione uma impressora.");
        btn.disabled = false;
        return;
    }

    const dados = {
        impressoraId: parseInt(impressoraId),
        precoRolo: parseFloat(document.getElementById('precoRolo').value) || 0,
        pesoRolo: parseFloat(document.getElementById('pesoRolo').value) || 0,
        nomePeca: document.getElementById('nomePeca').value,
        pesoPeca: parseFloat(document.getElementById('pesoPeca').value) || 0,
        horasImpressao: converterTempoParaDecimal(document.getElementById('horasImpressao').value),
        precoKwh: parseFloat(document.getElementById('precoKwh').value) || 0,
        tempoTrabalhoMin: parseFloat(document.getElementById('tempoTrabalhoMin').value) || 0,
        valorHoraTrabalho: parseFloat(document.getElementById('valorHoraTrabalho').value) || 0,
        markupDesejado: parseFloat(document.getElementById('markupDesejado').value) || 0,
        taxaMarketplace: parseFloat(document.getElementById('taxaMarketplace').value) || 0
    };

    fetch('/api/calculadora/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
        .then(async response => {
            if (!response.ok) {
                const erroData = await response.json();
                console.warn("Validação falhou no Backend:", erroData);
                throw new Error("Dados inválidos");
            }
            return response.json();
        })
        .then(resultado => {
            ultimoPrecoCalculado = resultado.valorFinal;
            ultimoCalculoDetalhado = resultado;

            sweepRail();
            setResultState('filled');
            animateValue(document.getElementById('valorFinal'), resultado.valorFinal);

            document.getElementById('bkMaterial').innerText = 'R$ ' + resultado.custoMaterial.toFixed(2).replace('.', ',');
            document.getElementById('bkEnergia').innerText = 'R$ ' + resultado.custoEnergia.toFixed(2).replace('.', ',');
            document.getElementById('bkManutencao').innerText = 'R$ ' + resultado.custoManutencao.toFixed(2).replace('.', ',');
            document.getElementById('bkDepreciacao').innerText = 'R$ ' + resultado.custoDepreciacao.toFixed(2).replace('.', ',');
            document.getElementById('bkMaoObra').innerText = 'R$ ' + resultado.custoMaoDeObra.toFixed(2).replace('.', ',');
            document.getElementById('bkLucro').innerText = 'R$ ' + resultado.valorLucro.toFixed(2).replace('.', ',');
            document.getElementById('bkTaxa').innerText = 'R$ ' + resultado.valorTaxa.toFixed(2).replace('.', ',');

            document.getElementById('btnSalvar').classList.remove('d-none');
        })
        .catch(error => {
            console.error(error);
            setResultState('error');
        })
        .finally(() => {
            btn.disabled = false;
        });
}

function salvarOrcamento() {
    const dados = {
        nomePeca: document.getElementById('nomePeca').value,
        pesoPeca: parseFloat(document.getElementById('pesoPeca').value) || 0,
        horasImpressao: converterTempoParaDecimal(document.getElementById('horasImpressao').value),
        precoFinal: ultimoPrecoCalculado,
        custoMaterial: ultimoCalculoDetalhado.custoMaterial,
        custoEnergia: ultimoCalculoDetalhado.custoEnergia,
        custoManutencao: ultimoCalculoDetalhado.custoManutencao,
        custoDepreciacao: ultimoCalculoDetalhado.custoDepreciacao,
        custoMaoDeObra: ultimoCalculoDetalhado.custoMaoDeObra,
        valorLucro: ultimoCalculoDetalhado.valorLucro,
        valorTaxa: ultimoCalculoDetalhado.valorTaxa
    };

    fetch('/api/orcamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
        .then(response => {
            if(response.ok) {
                alert('Peça salva com sucesso no estoque!');
                document.getElementById('btnSalvar').classList.add('d-none');
                switchTab('estoque');
            }
        })
        .catch(error => console.error('Erro ao salvar:', error));
}

function carregarEstoque() {
    fetch('/api/orcamentos')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro no servidor ao buscar orçamentos');
            }
            return response.json();
        })
        .then(orcamentos => {
            const tbody = document.getElementById('estoqueTbody');
            tbody.innerHTML = '';

            if (!Array.isArray(orcamentos)) {
                console.error("Formato inválido recebido do servidor:", orcamentos);
                tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--danger); padding: 30px;">Erro ao carregar os dados.</td></tr>`;
                return;
            }

            if (orcamentos.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-faint); padding: 30px;">Nenhuma peça salva no estoque ainda.</td></tr>`;
                return;
            }

            orcamentos.reverse().forEach(orc => {
                let dataFormatada = '-';
                if(orc.dataCalculo) {
                    const dataObj = new Date(orc.dataCalculo);
                    dataFormatada = dataObj.toLocaleDateString('pt-BR');
                }

                const badgeHTML = orc.vendido
                    ? '<span class="badge badge-vendido">Vendida</span>'
                    : '<span class="badge badge-disponivel">Disponível</span>';

                const btnVenderHTML = orc.vendido
                    ? ''
                    : `<button class="btn-delete" style="color: var(--result);" onclick="venderPeca(${orc.id}, '${orc.nomePeca}', ${orc.precoFinal})" title="Marcar como Vendido"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></button>`;

                const trPrincipal = document.createElement('tr');
                const tempoFormatado = converterDecimalParaTempo(orc.horasImpressao);
                trPrincipal.innerHTML = `
                    <td style="width: 40px;"><button class="btn-expand" onclick="toggleDetails(${orc.id}, this)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button></td>
                    <td style="color: var(--text-dim);">#${orc.id}</td>
                    <td style="font-weight: 600;">${orc.nomePeca}</td>
                    <td>${orc.pesoPeca}g</td>
                    <td>${tempoFormatado}h</td>
                    <td class="text-accent">R$ ${orc.precoFinal.toFixed(2).replace('.', ',')}</td>
                    <td>${badgeHTML}</td>
                    <td style="color: var(--text-dim); font-size: 0.8rem;">${dataFormatada}</td>
                    <td style="text-align: right; display: flex; justify-content: flex-end; gap: 8px;">
                        ${btnVenderHTML}
                        <button class="btn-delete" onclick="excluirOrcamento(${orc.id})" title="Excluir"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                    </td>
                `;

                const trDetalhes = document.createElement('tr');
                trDetalhes.id = `details-${orc.id}`;
                trDetalhes.className = 'details-row d-none';
                trDetalhes.innerHTML = `
                    <td colspan="9">
                        <div class="details-content">
                            <div class="breakdown-list" style="margin-top: 0; border-top: none; padding-top: 0; gap: 4px; max-width: 400px;">
                                <div class="breakdown-item"><span>Material:</span> <strong>R$ ${(orc.custoMaterial || 0).toFixed(2).replace('.', ',')}</strong></div>
                                <div class="breakdown-item"><span>Energia:</span> <strong>R$ ${(orc.custoEnergia || 0).toFixed(2).replace('.', ',')}</strong></div>
                                <div class="breakdown-item"><span>Manutenção:</span> <strong>R$ ${(orc.custoManutencao || 0).toFixed(2).replace('.', ',')}</strong></div>
                                <div class="breakdown-item"><span>Depreciação:</span> <strong>R$ ${(orc.custoDepreciacao || 0).toFixed(2).replace('.', ',')}</strong></div>
                                <div class="breakdown-item"><span>Mão de Obra:</span> <strong>R$ ${(orc.custoMaoDeObra || 0).toFixed(2).replace('.', ',')}</strong></div>
                                <div class="breakdown-item"><span>Lucro:</span> <strong style="color: var(--result);">R$ ${(orc.valorLucro || 0).toFixed(2).replace('.', ',')}</strong></div>
                                <div class="breakdown-item"><span>Taxa Marketplace:</span> <strong style="color: var(--danger);">R$ ${(orc.valorTaxa || 0).toFixed(2).replace('.', ',')}</strong></div>
                            </div>
                        </div>
                    </td>
                `;

                tbody.appendChild(trPrincipal);
                tbody.appendChild(trDetalhes);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar estoque:', error);
            const tbody = document.getElementById('estoqueTbody');
            tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--danger); padding: 30px;">Falha de conexão com o servidor.</td></tr>`;
        });
}

function toggleDetails(id, btnElement) {
    const row = document.getElementById(`details-${id}`);
    row.classList.toggle('d-none');
    btnElement.classList.toggle('expanded');
}

function excluirOrcamento(id) {
    if (!confirm('Tem certeza que deseja excluir esta peça do estoque?')) {
        return;
    }

    fetch(`/api/orcamentos/${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                carregarEstoque();
            } else {
                alert('Erro ao excluir a peça. Tente novamente.');
            }
        })
        .catch(error => console.error('Erro ao excluir:', error));
}

function exportarBackup() {
    window.location.href = '/api/backup/exportar';
}

function importarBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const conteudo = e.target.result;

        fetch('/api/backup/importar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: conteudo
        })
            .then(response => {
                if (response.ok) {
                    alert('Backup restaurado com sucesso!');
                    location.reload();
                } else {
                    alert('Erro ao processar o arquivo de backup.');
                }
            })
            .catch(error => console.error('Erro na importação:', error))
            .finally(() => {
                event.target.value = '';
            });
    };

    reader.readAsText(file);
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

function venderPeca(id, nomePeca, valorVenda) {
    if (!confirm(`Confirmar a venda de "${nomePeca}" por R$ ${valorVenda.toFixed(2).replace('.', ',')}?`)) {
        return;
    }

    fetch(`/api/orcamentos/${id}/vender`, { method: 'PATCH' })
        .then(response => {
            if(response.ok) {
                const transacao = {
                    descricao: `Venda: ${nomePeca} (#${id})`,
                    valor: valorVenda,
                    tipo: 'RECEITA'
                };
                return fetch('/api/financeiro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(transacao)
                });
            } else {
                throw new Error('Erro ao atualizar status da peça.');
            }
        })
        .then(response => {
            if(response && response.ok) {
                carregarEstoque();
            }
        })
        .catch(error => console.error('Erro no fluxo de venda:', error));
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