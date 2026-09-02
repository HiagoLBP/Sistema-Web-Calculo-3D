package com.hsprints3d.controller;

import com.hsprints3d.model.TipoTransacao;
import com.hsprints3d.model.Transacao;
import com.hsprints3d.repository.TransacaoRepository;
import org.springframework.http.ResponseEntity; // NÃO ESQUEÇA ESTE IMPORT
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/financeiro")
public class TransacaoController {

    private final TransacaoRepository repository;

    public TransacaoController(TransacaoRepository repository) {
        this.repository = repository;
    }

    public record DashboardFinanceiro(
            double saldoAtual, double totalReceitas,
            double totalDespesas, List<Transacao> historico
    ) {}

    @GetMapping("/dashboard")
    public DashboardFinanceiro obterDashboard(@RequestParam(required = false) String mesAno) {
        List<Transacao> historico;

        if (mesAno != null && !mesAno.isEmpty()) {
            YearMonth ym = YearMonth.parse(mesAno);
            LocalDateTime inicio = ym.atDay(1).atStartOfDay();
            LocalDateTime fim = ym.atEndOfMonth().atTime(23, 59, 59);
            historico = repository.findByDataBetween(inicio, fim);
        } else {
            historico = repository.findAll();
        }

        // Calcula os totais usando a lista filtrada (usando a Stream API do Java)
        double receitas = historico.stream()
                .filter(t -> t.getTipo() == TipoTransacao.RECEITA)
                .mapToDouble(Transacao::getValor).sum();

        double despesas = historico.stream()
                .filter(t -> t.getTipo() == TipoTransacao.DESPESA)
                .mapToDouble(Transacao::getValor).sum();

        double saldo = receitas - despesas;

        return new DashboardFinanceiro(saldo, receitas, despesas, historico);
    }

    @PostMapping
    public Transacao registrarTransacao(@Valid @RequestBody Transacao transacao) {
        transacao.setValor(Math.abs(transacao.getValor()));
        return repository.save(transacao);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirTransacao(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}