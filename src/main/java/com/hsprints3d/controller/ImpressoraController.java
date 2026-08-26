package com.hsprints3d.controller;

import com.hsprints3d.model.Impressora;
import com.hsprints3d.repository.ImpressoraRepository;
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
    public Impressora cadastrar(@RequestBody Impressora impressora){
        return repository.save(impressora);
    }

    @GetMapping
    public List<Impressora> listarTodas(){
        return repository.findAll();
    }
}
