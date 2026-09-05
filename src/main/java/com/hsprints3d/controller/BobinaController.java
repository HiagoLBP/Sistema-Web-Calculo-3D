package com.hsprints3d.controller;

import com.hsprints3d.model.Bobina;
import com.hsprints3d.repository.BobinaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bobinas")
public class BobinaController {

    @Autowired
    private BobinaRepository repository;

    @GetMapping
    public List<Bobina> listarTodas(){
        return repository.findAll();
    }

    @PostMapping
    public Bobina cadastrar(@RequestBody Bobina bobina){
        if (bobina.getPesoAtual() == null){
           bobina.setPesoAtual(bobina.getPesoInicial());
        }
        return repository.save(bobina);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/debitar")
    public ResponseEntity<Bobina> debitarPeso(@PathVariable Long id, @RequestBody Double pesoGasto){
        Optional<Bobina> bobinaOpt = repository.findById(id);
        if(bobinaOpt.isPresent()) {
            Bobina bobina = bobinaOpt.get();
            double novoPeso = bobina.getPesoAtual() - pesoGasto;
            bobina.setPesoAtual(Math.max(novoPeso, 0.0));
            repository.save(bobina);
            return ResponseEntity.ok(bobina);
        }
        return ResponseEntity.notFound().build();
    }

}
