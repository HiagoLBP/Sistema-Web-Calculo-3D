/* global html2pdf */
let listaEstoqueGlobal = [];

function carregarEstoque() {
    fetch('/api/orcamentos')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro no servidor ao buscar orçamentos');
            }
            return response.json();
        })
        .then(orcamentos => {
            listaEstoqueGlobal = orcamentos;

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

                let nomeExibicao = 'Pedido Vazio';
                let pesoTotal = 0;
                let horasTotais = 0;

                if (orc.itens && orc.itens.length > 0) {
                    if (orc.itens.length === 1) {
                        nomeExibicao = `${orc.itens[0].quantidade}x ${orc.itens[0].nomePeca}`;
                    } else {
                        const qtdTotal = orc.itens.reduce((acc, item) => acc + item.quantidade, 0);
                        nomeExibicao = `Lote Diversos (${qtdTotal} peças)`;
                    }

                    orc.itens.forEach(item => {
                        pesoTotal += (item.pesoPeca * item.quantidade);
                        horasTotais += (item.horasImpressao * item.quantidade);
                    });
                }

                const nomeSeguro = nomeExibicao.replace(/'/g, "\\'");

                const badgeHTML = orc.vendido
                    ? `<span class="badge badge-vendido" onclick="desfazerVenda(${orc.id}, '${nomeSeguro}')" style="cursor: pointer; transition: 0.2s;" onmouseover="this.style.opacity=0.7" onmouseout="this.style.opacity=1" title="Clique para desfazer a venda">VENDIDA</span>`
                    : `<span class="badge badge-disponivel" onclick="venderPeca(${orc.id}, '${nomeSeguro}', ${orc.precoFinal})" style="cursor: pointer; transition: 0.2s;" onmouseover="this.style.opacity=0.7" onmouseout="this.style.opacity=1" title="Clique para vender">DISPONÍVEL</span>`;

                const trPrincipal = document.createElement('tr');
                const tempoFormatado = converterDecimalParaTempo(horasTotais);

                trPrincipal.innerHTML = `
                    <td style="width: 40px;"><button class="btn-expand" onclick="toggleDetails(${orc.id}, this)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button></td>
                    <td style="color: var(--text-dim);">#${orc.id}</td>
                    <td style="font-weight: 600;">${nomeExibicao}</td>
                    <td>${pesoTotal.toFixed(0)}g</td>
                    <td>${tempoFormatado}h</td>
                    <td class="text-accent">R$ ${orc.precoFinal.toFixed(2).replace('.', ',')}</td>
                    <td>${badgeHTML}</td>
                    <td style="color: var(--text-dim); font-size: 0.8rem;">${dataFormatada}</td>
                    <td style="text-align: right; display: flex; justify-content: flex-end; gap: 8px;">
                        <button class="btn-expand" onclick="gerarPDF(${orc.id})" title="Gerar Orçamento em PDF" style="padding: 4px; color: var(--text-dim);">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </button>
                        <button class="btn-delete" onclick="excluirOrcamento(${orc.id})" title="Excluir"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                    </td>
                `;

                const nomeCliente = orc.cliente ? orc.cliente.nome : 'Avulso (Sem cliente)';
                const status = orc.statusPedido || 'Pendente';
                let previsao = 'Não informada';
                if (orc.dataPrevisaoEntrega) {
                    const partes = orc.dataPrevisaoEntrega.split('-');
                    if (partes.length === 3) previsao = `${partes[2]}/${partes[1]}/${partes[0]}`;
                }

                const trDetalhes = document.createElement('tr');
                trDetalhes.id = `details-${orc.id}`;
                trDetalhes.className = 'details-row d-none';
                trDetalhes.innerHTML = `
                    <td colspan="9">
                        <div class="details-content">
                            <div style="margin-bottom: 15px; padding-bottom: 12px; border-bottom: 1px solid var(--line); font-size: 0.85rem; color: var(--text-dim); display: flex; gap: 20px;">
                                <div><span style="display: block; font-size: 0.75rem;">Cliente</span> <strong style="color: var(--text);">${nomeCliente}</strong></div>
                                <div><span style="display: block; font-size: 0.75rem;">Status</span> <strong style="color: var(--accent);">${status}</strong></div>
                                <div><span style="display: block; font-size: 0.75rem;">Entrega</span> <strong style="color: var(--text);">${previsao}</strong></div>
                            </div>
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
    if (!confirm('Tem certeza que deseja excluir esta venda/pedido?')) {
        return;
    }

    fetch(`/api/orcamentos/${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                carregarEstoque();
            } else {
                alert('Erro ao excluir o pedido. Tente novamente.');
            }
        })
        .catch(error => console.error('Erro ao excluir:', error));
}

function venderPeca(id, nomeExibicao, valorVenda) {
    if (!confirm(`Confirmar a venda do "${nomeExibicao}" por R$ ${valorVenda.toFixed(2).replace('.', ',')}?`)) {
        return;
    }

    fetch(`/api/orcamentos/${id}/vender`, { method: 'PATCH' })
        .then(response => {
            if(response.ok) {
                const transacao = {
                    descricao: `Venda: ${nomeExibicao} (#${id})`,
                    valor: valorVenda,
                    tipo: 'RECEITA'
                };
                return fetch('/api/financeiro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(transacao)
                });
            } else {
                throw new Error('Erro ao atualizar status do pedido.');
            }
        })
        .then(response => {
            if(response && response.ok) {
                carregarEstoque();
            }
        })
        .catch(error => console.error('Erro no fluxo de venda:', error));
}

function desfazerVenda(id, nomeExibicao) {
    if (!confirm(`Deseja desfazer a venda de "${nomeExibicao}" e devolvê-la ao estoque?`)) {
        return;
    }

    fetch(`/api/orcamentos/${id}/desfazer-venda`, { method: 'PATCH' })
        .then(response => {
            if(response.ok) {
                carregarEstoque();
                alert(`Venda desfeita! Lembre-se de excluir a entrada desse valor lá na aba Financeiro.`);
            } else {
                alert('Erro ao desfazer o status do pedido.');
            }
        })
        .catch(error => console.error('Erro ao desfazer venda:', error));
}

function gerarPDF(id) {
    const orc = listaEstoqueGlobal.find(o => o.id === id);
    if (!orc) {
        alert("Pedido não encontrado!");
        return;
    }

    document.getElementById('pdfId').innerText = orc.id;
    document.getElementById('pdfData').innerText = new Date(orc.dataCalculo).toLocaleDateString('pt-BR');
    document.getElementById('pdfClienteNome').innerText = orc.cliente ? orc.cliente.nome : 'Cliente Balcão';
    document.getElementById('pdfClienteTel').innerText = (orc.cliente && orc.cliente.telefone) ? orc.cliente.telefone : 'Não informado';

    let previsao = 'A combinar';
    if (orc.dataPrevisaoEntrega) {
        const partes = orc.dataPrevisaoEntrega.split('-');
        if (partes.length === 3) previsao = `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    document.getElementById('pdfPrevisao').innerText = previsao;


    const tbodyPdf = document.querySelector('#reciboTemplate tbody');
    tbodyPdf.innerHTML = ''; // Limpa a linha estática antiga

    if (orc.itens && orc.itens.length > 0) {
        orc.itens.forEach(item => {
            const tr = document.createElement('tr');


            const tempoItemFormatado = converterDecimalParaTempo(item.horasImpressao * item.quantidade);
            const pesoItemSoma = (item.pesoPeca * item.quantidade).toFixed(0);
            const valorSubtotal = item.precoUnitario * item.quantidade;

            tr.innerHTML = `
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-size: 0.92rem;">${item.quantidade}x ${item.nomePeca}</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-size: 0.9rem; text-align: center; font-family: 'IBM Plex Mono', 'Courier New', monospace;">${pesoItemSoma}g</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-size: 0.9rem; text-align: center; font-family: 'IBM Plex Mono', 'Courier New', monospace;">${tempoItemFormatado}h</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-size: 0.9rem; text-align: right; font-family: 'IBM Plex Mono', 'Courier New', monospace;">R$ ${valorSubtotal.toFixed(2).replace('.', ',')}</td>
            `;
            tbodyPdf.appendChild(tr);
        });
    }

    const precoArredondado = Math.ceil(orc.precoFinal);
    document.getElementById('pdfTotal').innerText = precoArredondado.toFixed(2).replace('.', ',');

    const elementoHTML = document.getElementById('reciboTemplate');

    const opcoes = {
        margin: 0.5,
        filename: `Pedido_${orc.id}_HS_Prints3D.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opcoes).from(elementoHTML).save();
}