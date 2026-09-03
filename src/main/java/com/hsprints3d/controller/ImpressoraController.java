package com.hsprints3d.controller;

import com.hsprints3d.model.Impressora;
import com.hsprints3d.repository.ImpressoraRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.config.RepositoryNameSpaceHandler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/impressoras")
public class ImpressoraController {

    private final ImpressoraRepository repository;

    public ImpressoraController(ImpressoraRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Impressora cadastrar(@Valid @RequestBody Impressora impressora){
        return repository.save(impressora);
    }

    @GetMapping
    public List<Impressora> listarTodas(){
        return repository.findAll();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Impressora> atualizar(@PathVariable Long id, @Valid @RequestBody Impressora dados) {
        return repository.findById(id).map(imp -> {
            imp.setNome(dados.getNome());
            imp.setPotenciaWatts(dados.getPotenciaWatts());
            imp.setPrecoImpressora(dados.getPrecoImpressora());
            imp.setManutencaoAno(dados.getManutencaoAno());
            imp.setVidaUtilHoras(dados.getVidaUtilHoras());
            imp.setHorasUsoAno(dados.getHorasUsoAno());

            return ResponseEntity.ok(repository.save(imp));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id){
        if (repository.existsById(id)){
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
