// --- CRUD de Impressoras (Modal) ---

function abrirModalImpressoras() {
    document.getElementById('modalImpressoras').classList.remove('d-none');
    renderizarListaImpressorasModal();
}

function fecharModalImpressoras() {
    document.getElementById('modalImpressoras').classList.add('d-none');
    limparFormImpressora();
    carregarImpressoras(); // Atualiza o select da calculadora ao fechar
}

function limparFormImpressora() {
    document.getElementById('impModalId').value = '';
    document.getElementById('impModalNome').value = '';
    document.getElementById('impModalPotencia').value = '';
    document.getElementById('impModalPreco').value = '';
    document.getElementById('impModalManutencao').value = '';
    document.getElementById('impModalVidaUtil').value = '';
    document.getElementById('impModalHorasAno').value = '';
}

function renderizarListaImpressorasModal() {
    const tbody = document.getElementById('listaImpressorasModal');
    tbody.innerHTML = '';

    listaImpressoras.forEach(imp => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight: 500;">${imp.nome}</td>
            <td style="color: var(--text-dim); font-size: 0.85rem;">${imp.potenciaWatts}W</td>
            <td style="text-align: right;">
                <button type="button" class="btn-expand" onclick="editarImpressora(${imp.id})" title="Editar" style="padding: 4px; margin-right: 5px;">✏️</button>
                <button type="button" class="btn-delete" onclick="excluirImpressora(${imp.id})" title="Excluir" style="padding: 4px;">❌</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function salvarImpressora(event) {
    event.preventDefault();

    const id = document.getElementById('impModalId').value;
    const impressora = {
        nome: document.getElementById('impModalNome').value,
        potenciaWatts: parseFloat(document.getElementById('impModalPotencia').value),
        precoImpressora: parseFloat(document.getElementById('impModalPreco').value),
        manutencaoAno: parseFloat(document.getElementById('impModalManutencao').value),
        vidaUtilHoras: parseFloat(document.getElementById('impModalVidaUtil').value),
        horasUsoAno: parseFloat(document.getElementById('impModalHorasAno').value)
    };

    const url = id ? `/api/impressoras/${id}` : '/api/impressoras';
    const method = id ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(impressora)
    })
        .then(response => {
            if(response.ok) {
                limparFormImpressora();
                fetch('/api/impressoras').then(res => res.json()).then(data => {
                    listaImpressoras = data;
                    renderizarListaImpressorasModal();
                });
            } else {
                alert('Erro ao salvar impressora.');
            }
        })
        .catch(error => console.error(error));
}

function editarImpressora(id) {
    const imp = listaImpressoras.find(i => i.id === id);
    if(imp) {
        document.getElementById('impModalId').value = imp.id;
        document.getElementById('impModalNome').value = imp.nome;
        document.getElementById('impModalPotencia').value = imp.potenciaWatts;
        document.getElementById('impModalPreco').value = imp.precoImpressora;
        document.getElementById('impModalManutencao').value = imp.manutencaoAno;
        document.getElementById('impModalVidaUtil').value = imp.vidaUtilHoras;
        document.getElementById('impModalHorasAno').value = imp.horasUsoAno;
    }
}

function excluirImpressora(id) {
    if(!confirm('Tem certeza que deseja excluir esta impressora?')) return;

    fetch(`/api/impressoras/${id}`, { method: 'DELETE' })
        .then(response => {
            if(response.ok) {
                // Recarrega a lista atualizada
                fetch('/api/impressoras').then(res => res.json()).then(data => {
                    listaImpressoras = data;
                    renderizarListaImpressorasModal();
                });
            } else {
                alert('Não foi possível excluir. Talvez ela esteja vinculada a orçamentos.');
            }
        });
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