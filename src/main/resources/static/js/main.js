let listaImpressoras = [];
let ultimoPrecoCalculado = 0;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', function () {
    carregarImpressoras();
});

// --- Lógica de Abas ---
function switchTab(tab) {
    document.getElementById('btnTabCalculadora').classList.toggle('active', tab === 'calculadora');
    document.getElementById('btnTabEstoque').classList.toggle('active', tab === 'estoque');

    document.getElementById('tabCalculadora').classList.toggle('d-none', tab !== 'calculadora');
    document.getElementById('tabEstoque').classList.toggle('d-none', tab !== 'estoque');

    if (tab === 'estoque') {
        carregarEstoque();
    }
}

// --- Funções da Calculadora ---
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

function calcularPreco() {
    const dados = {
        impressoraId: parseFloat(document.getElementById('impressoraId').value),
        precoRolo: parseFloat(document.getElementById('precoRolo').value),
        pesoRolo: parseFloat(document.getElementById('pesoRolo').value),
        pesoPeca: parseFloat(document.getElementById('pesoPeca').value),
        horasImpressao: parseFloat(document.getElementById('horasImpressao').value),
        precoKwh: parseFloat(document.getElementById('precoKwh').value),
        tempoTrabalhoMin: parseFloat(document.getElementById('tempoTrabalhoMin').value),
        valorHoraTrabalho: parseFloat(document.getElementById('valorHoraTrabalho').value),
        markupDesejado: parseFloat(document.getElementById('markupDesejado').value),
        taxaMarketplace: parseFloat(document.getElementById('taxaMarketplace').value)
    };

    const btn = document.querySelector('.btn-calc');
    btn.disabled = true;

    // Na função calcularPreco(), atualize o .then(response => response.json()) para:

    fetch('/api/calculadora/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
        .then(response => response.json())
        .then(resultado => {
            // Agora 'resultado' é um objeto (CalculoResponse)
            ultimoPrecoCalculado = resultado.valorFinal;

            sweepRail();
            setResultState('filled');
            animateValue(document.getElementById('valorFinal'), resultado.valorFinal);

            // Preenche os campos de detalhamento na tela
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
    const dadosOrcamento = {
        nomePeca: document.getElementById('nomePeca').value,
        pesoPeca: parseFloat(document.getElementById('pesoPeca').value),
        horasImpressao: parseFloat(document.getElementById('horasImpressao').value),
        precoFinal: ultimoPrecoCalculado
    };

    fetch('/api/orcamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosOrcamento)
    })
        .then(response => {
            if(response.ok) {
                alert('Peça salva com sucesso no estoque!');
                document.getElementById('btnSalvar').classList.add('d-none');
                switchTab('estoque'); // Muda de aba automaticamente
            }
        })
        .catch(error => console.error('Erro ao salvar:', error));
}

// --- Funções de Estoque ---
function carregarEstoque() {
    fetch('/api/orcamentos')
        .then(response => {
            // Se o status da resposta não for ok (ex: 500, 404), joga um erro
            if (!response.ok) {
                throw new Error('Erro no servidor ao buscar orçamentos');
            }
            return response.json();
        })
        .then(orcamentos => {
            const tbody = document.getElementById('estoqueTbody');
            tbody.innerHTML = ''; // Limpa a tabela antes de preencher

            // Verifica se o que chegou é realmente uma lista
            if (!Array.isArray(orcamentos)) {
                console.error("Formato inválido recebido do servidor:", orcamentos);
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger); padding: 30px;">Erro ao carregar os dados.</td></tr>`;
                return;
            }

            if (orcamentos.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-faint); padding: 30px;">Nenhuma peça salva no estoque ainda.</td></tr>`;
                return;
            }

            // Inverte o array para mostrar os mais recentes primeiro
            orcamentos.reverse().forEach(orc => {
                const tr = document.createElement('tr');
                let dataFormatada = '-';
                if(orc.dataCalculo) {
                    const dataObj = new Date(orc.dataCalculo);
                    dataFormatada = dataObj.toLocaleDateString('pt-BR');
                }

                tr.innerHTML = `
                    <td style="color: var(--text-dim);">#${orc.id}</td>
                    <td style="font-family: 'Space Grotesk', sans-serif; font-weight: 600;">${orc.nomePeca}</td>
                    <td>${orc.pesoPeca}g</td>
                    <td>${orc.horasImpressao}h</td>
                    <td class="text-accent">R$ ${orc.precoFinal.toFixed(2).replace('.', ',')}</td>
                    <td style="color: var(--text-dim); font-size: 0.8rem;">${dataFormatada}</td>
                    <td style="text-align: right;">
                        <button class="btn-delete" onclick="excluirOrcamento(${orc.id})" title="Excluir peça">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar estoque:', error);
            const tbody = document.getElementById('estoqueTbody');
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger); padding: 30px;">Falha de conexão com o servidor.</td></tr>`;
        });
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

// --- Funções de Backup ---

function exportarBackup() {
    // Ao redirecionar o navegador para a rota de GET, como configuramos o header "attachment", ele inicia o download automaticamente.
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

    // Inicia a leitura do arquivo
    reader.readAsText(file);
}