package com.hsprints3d.controller;

import com.hsprints3d.model.Cliente;
import com.hsprints3d.repository.ClienteRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteRepository repository;

    public ClienteController(ClienteRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Cliente cadastrar(@Valid @RequestBody Cliente cliente){
        return repository.save(cliente);
    }

    @GetMapping
    public List<Cliente> listar(){
        return repository.findAll();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> atualizar(@PathVariable Long id, @Valid @RequestBody Cliente dados) {
        return repository.findById(id).map(cli -> {
            cli.setNome(dados.getNome());
            cli.setTelefone(dados.getTelefone());
            return ResponseEntity.ok(repository.save(cli));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
