function carregarBobinas() {
    fetch('/api/bobinas')
        .then(res => res.json())
        .then(bobinas => {
            const grid = document.getElementById('listaBobinasGrid');
            grid.innerHTML = '';

            if (bobinas.length === 0) {
                grid.innerHTML = '<p style="color: var(--text-dim);">Nenhuma bobina cadastrada no estoque.</p>';
                return;
            }

            bobinas.forEach(bob => {
                const pct = (bob.pesoAtual / bob.pesoInicial) * 100;
                const corBarra = pct > 20 ? 'var(--result)' : 'var(--danger)';

                const card = document.createElement('div');
                card.className = 'dash-card';
                card.style.position = 'relative';

                card.innerHTML = `
                    <button onclick="excluirBobina(${bob.id})" style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: var(--danger); cursor: pointer; font-size: 1.2rem;">&times;</button>
                    
                    <div style="font-weight: bold; font-size: 1.1rem; color: var(--text);">${bob.material} - ${bob.cor}</div>
                    <div style="font-size: 0.85rem; color: var(--text-dim); margin-bottom: 15px;">${bob.marca || 'Sem marca'}</div>
                    
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 5px; color: var(--text);">
                        <span>Restante: <strong>${bob.pesoAtual.toFixed(0)}g</strong></span>
                        <span>${pct.toFixed(0)}%</span>
                    </div>
                    
                    <div style="width: 100%; height: 8px; background: var(--surface-2); border-radius: 4px; overflow: hidden; border: 1px solid var(--line);">
                        <div style="width: ${pct}%; height: 100%; background: ${corBarra}; transition: 0.5s;"></div>
                    </div>
                `;
                grid.appendChild(card);
            });
        });
}

function salvarBobina(e) {
    e.preventDefault();

    const dados = {
        material: document.getElementById('bobMaterial').value,
        cor: document.getElementById('bobCor').value,
        marca: document.getElementById('bobMarca').value,
        pesoInicial: parseFloat(document.getElementById('bobPesoInicial').value),
        precoCompra: parseFloat(document.getElementById('bobPreco').value)
    };

    fetch('/api/bobinas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    }).then(res => {
        if(res.ok) {
            document.getElementById('formBobina').reset();
            carregarBobinas();
        } else {
            alert('Erro ao salvar bobina.');
        }
    });
}

function excluirBobina(id) {
    if(confirm('Tem certeza que deseja excluir esta bobina do sistema?')) {
        fetch('/api/bobinas/' + id, { method: 'DELETE' })
            .then(() => carregarBobinas());
    }
}