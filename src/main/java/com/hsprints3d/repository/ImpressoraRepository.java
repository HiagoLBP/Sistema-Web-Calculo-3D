package com.hsprints3d.repository;

import com.hsprints3d.model.Impressora;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ImpressoraRepository extends JpaRepository<Impressora, Long>{
}
