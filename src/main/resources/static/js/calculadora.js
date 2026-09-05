let carrinho = [];

function carregarBobinasCalculadora() {
    fetch('/api/bobinas')
        .then(res => res.json())
        .then(bobinas => {
            const select = document.getElementById('calculadoraBobinaId');
            select.innerHTML = '<option value="">Escolha uma bobina do estoque...</option>';
            bobinas.forEach(bob => {
                const opt = document.createElement('option');
                opt.value = bob.id;
                opt.dataset.preco = bob.precoCompra;
                opt.dataset.peso = bob.pesoInicial;
                opt.innerText = `${bob.material} ${bob.cor} (Resta ${bob.pesoAtual.toFixed(0)}g)`;
                select.appendChild(opt);
            });
        });
}

function aplicarBobinaSelecionada() {
    const select = document.getElementById('calculadoraBobinaId');
    const opt = select.options[select.selectedIndex];

    if (opt.value) {
        document.getElementById('precoRolo').value = opt.dataset.preco;
        document.getElementById('pesoRolo').value = opt.dataset.peso;
    } else {
        document.getElementById('precoRolo').value = 0;
        document.getElementById('pesoRolo').value = 0;
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
            document.getElementById('valorFinal').value = resultado.valorFinal.toFixed(2);
            verificarPrejuizo();

            document.getElementById('bkMaterial').innerText = 'R$ ' + resultado.custoMaterial.toFixed(2).replace('.', ',');
            document.getElementById('bkEnergia').innerText = 'R$ ' + resultado.custoEnergia.toFixed(2).replace('.', ',');
            document.getElementById('bkManutencao').innerText = 'R$ ' + resultado.custoManutencao.toFixed(2).replace('.', ',');
            document.getElementById('bkDepreciacao').innerText = 'R$ ' + resultado.custoDepreciacao.toFixed(2).replace('.', ',');
            document.getElementById('bkMaoObra').innerText = 'R$ ' + resultado.custoMaoDeObra.toFixed(2).replace('.', ',');
            document.getElementById('bkLucro').innerText = 'R$ ' + resultado.valorLucro.toFixed(2).replace('.', ',');
            document.getElementById('bkTaxa').innerText = 'R$ ' + resultado.valorTaxa.toFixed(2).replace('.', ',');
        })
        .catch(error => {
            console.error(error);
            setResultState('error');
        })
        .finally(() => {
            btn.disabled = false;
        });
}

function verificarPrejuizo() {
    if (!ultimoCalculoDetalhado) return;

    const custoReal = ultimoCalculoDetalhado.custoMaterial +
        ultimoCalculoDetalhado.custoEnergia +
        ultimoCalculoDetalhado.custoManutencao +
        ultimoCalculoDetalhado.custoDepreciacao +
        ultimoCalculoDetalhado.custoMaoDeObra;

    const inputValor = document.getElementById('valorFinal');
    let valorNegociado = parseFloat(inputValor.value);

    if (isNaN(valorNegociado)) valorNegociado = 0;

    const alerta = document.getElementById('alertaPrejuizo');

    if (valorNegociado < custoReal) {
        const prejuizo = custoReal - valorNegociado;
        document.getElementById('custoBaseAlerta').innerText = custoReal.toFixed(2).replace('.', ',');
        document.getElementById('valorPrejuizo').innerText = prejuizo.toFixed(2).replace('.', ',');

        alerta.classList.remove('d-none');
        inputValor.style.color = 'var(--danger)';
        inputValor.style.borderColor = 'var(--danger)';
    } else {
        alerta.classList.add('d-none');
        inputValor.style.color = 'var(--result)';
        inputValor.style.borderColor = 'var(--line)';
    }

    ultimoPrecoCalculado = valorNegociado;
}

function adicionarAoCarrinho() {
    const bobinaSelect = document.getElementById('calculadoraBobinaId');
    if (!bobinaSelect.value) {
        alert('Por favor, selecione uma bobina antes de adicionar ao pedido.');
        return;
    }

    const qtdInput = document.getElementById('quantidadeItem');
    let qtd = parseInt(qtdInput.value);
    if (isNaN(qtd) || qtd < 1) qtd = 1;

    const nome = document.getElementById('nomePeca').value;
    const peso = parseFloat(document.getElementById('pesoPeca').value) || 0;
    const horasDecimais = converterTempoParaDecimal(document.getElementById('horasImpressao').value);

    const item = {
        nomePeca: nome,
        pesoPeca: peso,
        horasImpressao: horasDecimais,
        quantidade: qtd,
        precoUnitario: ultimoPrecoCalculado,
        detalhesCusto: ultimoCalculoDetalhado,
        bobinaId: bobinaSelect.value
    };

    carrinho.push(item);
    atualizarCarrinhoUI();

    document.getElementById('resultadoBox').classList.add('d-none');
    document.getElementById('resultIdle').classList.remove('d-none');
}

function atualizarCarrinhoUI() {
    const areaCarrinho = document.getElementById('areaCarrinho');
    const lista = document.getElementById('listaCarrinho');
    const totalSpan = document.getElementById('totalCarrinho');

    if (carrinho.length === 0) {
        areaCarrinho.classList.add('d-none');
        return;
    }

    areaCarrinho.classList.remove('d-none');
    lista.innerHTML = '';
    let total = 0;

    carrinho.forEach((item, index) => {
        const subtotal = item.precoUnitario * item.quantidade;
        total += subtotal;

        const div = document.createElement('div');
        div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--line);';
        div.innerHTML = `
            <div>
                <div style="font-weight: bold; font-size: 0.9rem;">${item.quantidade}x ${item.nomePeca}</div>
                <div style="font-size: 0.8rem; color: var(--text-dim);">Un: R$ ${item.precoUnitario.toFixed(2).replace('.', ',')}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <strong style="color: var(--text);">R$ ${subtotal.toFixed(2).replace('.', ',')}</strong>
                <button type="button" onclick="removerDoCarrinho(${index})" style="background: none; border: none; color: var(--danger); cursor: pointer; font-size: 1.5rem; padding: 0 5px;">&times;</button>
            </div>
        `;
        lista.appendChild(div);
    });

    totalSpan.innerText = total.toFixed(2).replace('.', ',');
}

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    atualizarCarrinhoUI();
}

function salvarOrcamento() {
    if (carrinho.length === 0) return;

    const clienteId = document.getElementById('pedidoClienteId').value;
    const previsao = document.getElementById('pedidoPrevisao').value;

    let totalFinal = 0;
    let totalMaterial = 0;
    let totalEnergia = 0;
    let totalManutencao = 0;
    let totalDepreciacao = 0;
    let totalMaoDeObra = 0;
    let totalLucro = 0;
    let totalTaxa = 0;

    const itensPayload = carrinho.map(item => {
        const qtd = item.quantidade;
        totalFinal += (item.precoUnitario * qtd);

        totalMaterial += (item.detalhesCusto.custoMaterial * qtd);
        totalEnergia += (item.detalhesCusto.custoEnergia * qtd);
        totalManutencao += (item.detalhesCusto.custoManutencao * qtd);
        totalDepreciacao += (item.detalhesCusto.custoDepreciacao * qtd);
        totalMaoDeObra += (item.detalhesCusto.custoMaoDeObra * qtd);
        totalLucro += (item.detalhesCusto.valorLucro * qtd);
        totalTaxa += (item.detalhesCusto.valorTaxa * qtd);

        return {
            nomePeca: item.nomePeca,
            pesoPeca: item.pesoPeca,
            horasImpressao: item.horasImpressao,
            quantidade: qtd,
            precoUnitario: item.precoUnitario
        };
    });

    const dadosPedido = {
        precoFinal: totalFinal,
        custoMaterial: totalMaterial,
        custoEnergia: totalEnergia,
        custoManutencao: totalManutencao,
        custoDepreciacao: totalDepreciacao,
        custoMaoDeObra: totalMaoDeObra,
        valorLucro: totalLucro,
        valorTaxa: totalTaxa,
        statusPedido: "Pendente",
        dataPrevisaoEntrega: previsao || null,
        cliente: clienteId ? { id: parseInt(clienteId) } : null,
        itens: itensPayload
    };

    fetch('/api/orcamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosPedido)
    })
        .then(response => {
            if(response.ok) {
                carrinho.forEach(item => {
                    const pesoGasto = item.pesoPeca * item.quantidade;
                    fetch(`/api/bobinas/${item.bobinaId}/debitar`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(pesoGasto)
                    });
                });

                alert('Pedido salvo! O material foi debitado automaticamente da(s) bobina(s).');
                carrinho = [];
                atualizarCarrinhoUI();
                document.getElementById('pedidoClienteId').value = '';
                document.getElementById('pedidoPrevisao').value = '';
                switchTab('estoque');
            } else {
                alert('Erro ao salvar pedido.');
            }
        })
        .catch(error => console.error('Erro ao salvar:', error));
}