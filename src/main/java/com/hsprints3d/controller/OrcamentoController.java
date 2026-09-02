package com.hsprints3d.controller;

import com.fasterxml.jackson.core.util.RecyclerPool;
import com.hsprints3d.model.Orcamento;
import com.hsprints3d.repository.OrcamentoRepository;
import org.apache.coyote.Response;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/api/orcamentos")
public class OrcamentoController {

    private final OrcamentoRepository repository;

    public OrcamentoController(OrcamentoRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Orcamento salvar(@RequestBody Orcamento orcamento){
        return this.repository.save(orcamento);
    }

    @GetMapping
    public List<Orcamento> listarTodos(){
        return repository.findAll();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id){
        if(repository.existsById(id)){
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/vender")
    public ResponseEntity<Orcamento> marcarComoVendido(@PathVariable Long id){
        return repository.findById(id).map(orcamento -> {
            orcamento.setVendido(true);
            return ResponseEntity.ok(repository.save(orcamento));
        }).orElse(ResponseEntity.notFound().build());
    }
}
