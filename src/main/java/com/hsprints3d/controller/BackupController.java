package com.hsprints3d.controller;

import com.hsprints3d.dto.BackupDTO;
import com.hsprints3d.model.Cliente;
import com.hsprints3d.model.Impressora;
import com.hsprints3d.model.Orcamento;
import com.hsprints3d.repository.ClienteRepository;
import com.hsprints3d.repository.ImpressoraRepository;
import com.hsprints3d.repository.OrcamentoRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/backup")
public class BackupController {

    private final ImpressoraRepository impressoraRepo;
    private final OrcamentoRepository orcamentoRepo;
    private final ClienteRepository clienteRepo;

    public BackupController(ImpressoraRepository impressoraRepo, OrcamentoRepository orcamentoRepo, ClienteRepository clienteRepo) {
        this.impressoraRepo = impressoraRepo;
        this.orcamentoRepo = orcamentoRepo;
        this.clienteRepo = clienteRepo;
    }

    @GetMapping("/exportar")
    public ResponseEntity<BackupDTO> exportarBackup(){
        List<Impressora> impressoras = impressoraRepo.findAll();
        List<Cliente> clientes = clienteRepo.findAll();
        List<Orcamento> orcamentos = orcamentoRepo.findAll();

        BackupDTO backup = new BackupDTO(impressoras, clientes, orcamentos);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=backup_3d.json");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_JSON)
                .body(backup);
    }

    @PostMapping("/importar")
    public ResponseEntity<String> importarBackup(@RequestBody BackupDTO backup){


        if(backup.clientes() != null){
            clienteRepo.saveAll(backup.clientes());
        }
        if(backup.impressoras() != null){
            impressoraRepo.saveAll(backup.impressoras());
        }

        if(backup.orcamentos() != null){
            orcamentoRepo.saveAll(backup.orcamentos());
        }

        return ResponseEntity.ok("Backup restaurado com sucesso!");
    }
}