let listaImpressoras = [];
let listaClientes = [];
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
    carregarClientes();
});

function switchTab(tabId) {
    document.getElementById('tabCalculadora').classList.add('d-none');
    document.getElementById('tabEstoque').classList.add('d-none');
    document.getElementById('tabFinanceiro').classList.add('d-none');
    document.getElementById('tabBobinas').classList.add('d-none');

    document.getElementById('btnTabCalculadora').classList.remove('active');
    document.getElementById('btnTabEstoque').classList.remove('active');
    document.getElementById('btnTabFinanceiro').classList.remove('active');
    document.getElementById('btnTabBobinas').classList.remove('active');

    if (tabId === 'calculadora') {
        document.getElementById('tabCalculadora').classList.remove('d-none');
        document.getElementById('btnTabCalculadora').classList.add('active');
        carregarBobinasCalculadora();
    } else if (tabId === 'estoque') {
        document.getElementById('tabEstoque').classList.remove('d-none');
        document.getElementById('btnTabEstoque').classList.add('active');
        carregarEstoque();
    } else if (tabId === 'financeiro') {
        document.getElementById('tabFinanceiro').classList.remove('d-none');
        document.getElementById('btnTabFinanceiro').classList.add('active');
        carregarFinanceiro();
    } else if (tabId === 'bobinas') {
        document.getElementById('tabBobinas').classList.remove('d-none');
        document.getElementById('btnTabBobinas').classList.add('active');
        carregarBobinas();
    }
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


