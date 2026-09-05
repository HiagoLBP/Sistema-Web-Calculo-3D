// --- CRUD de Clientes ---

function abrirModalClientes() {
    document.getElementById('modalClientes').classList.remove('d-none');
    carregarClientes(); // Carrega os dados sempre que abrir a tela
}

function fecharModalClientes() {
    document.getElementById('modalClientes').classList.add('d-none');
    limparFormCliente();
}

function limparFormCliente() {
    document.getElementById('cliModalId').value = '';
    document.getElementById('cliModalNome').value = '';
    document.getElementById('cliModalTelefone').value = '';
}

function carregarClientes() {
    fetch('/api/clientes')
        .then(res => res.json())
        .then(data => {
            listaClientes = data;
            renderizarListaClientesModal();
            popularSelectClientes(); // Atualiza o select do formulário de pedidos
        })
        .catch(err => console.error(err));
}

function renderizarListaClientesModal() {
    const tbody = document.getElementById('listaClientesModal');
    if(!tbody) return;

    tbody.innerHTML = '';

    listaClientes.forEach(cli => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight: 500;">${cli.nome}</td>
            <td style="color: var(--text-dim); font-size: 0.85rem;">${cli.telefone || 'Sem número'}</td>
            <td style="text-align: right;">
                <button type="button" class="btn-expand" onclick="editarCliente(${cli.id})" title="Editar" style="padding: 4px; margin-right: 5px;">✏️</button>
                <button type="button" class="btn-delete" onclick="excluirCliente(${cli.id})" title="Excluir" style="padding: 4px;">❌</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function salvarCliente(event) {
    event.preventDefault();

    const id = document.getElementById('cliModalId').value;
    const cliente = {
        nome: document.getElementById('cliModalNome').value,
        telefone: document.getElementById('cliModalTelefone').value
    };

    const url = id ? `/api/clientes/${id}` : '/api/clientes';
    const method = id ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
    })
        .then(response => {
            if(response.ok) {
                limparFormCliente();
                carregarClientes(); // Recarrega os clientes e atualiza o select
            } else {
                alert('Erro ao salvar cliente.');
            }
        })
        .catch(error => console.error(error));
}

function editarCliente(id) {
    const cli = listaClientes.find(c => c.id === id);
    if(cli) {
        document.getElementById('cliModalId').value = cli.id;
        document.getElementById('cliModalNome').value = cli.nome;
        document.getElementById('cliModalTelefone').value = cli.telefone;
    }
}

function excluirCliente(id) {
    if(!confirm('Tem certeza que deseja excluir este cliente?')) return;

    fetch(`/api/clientes/${id}`, { method: 'DELETE' })
        .then(response => {
            if(response.ok) {
                carregarClientes();
            } else {
                alert('Não foi possível excluir.');
            }
        });
}

function popularSelectClientes() {
    const select = document.getElementById('pedidoClienteId');
    if (!select) return;

    const valorSelecionado = select.value;
    select.innerHTML = '<option value="">Sem cliente vinculado</option>';

    listaClientes.forEach(cli => {
        const opt = document.createElement('option');
        opt.value = cli.id;
        opt.textContent = cli.nome;
        select.appendChild(opt);
    });

    select.value = valorSelecionado;
}