package com.seu_pacote.model;

public class Sonho {
    private int id;
    private String titulo;  // Novo campo para título
    private String sonho;
    private String data;
    private String hora;

    public Sonho(String titulo, String sonho, String data, String hora) {
        this.titulo = titulo;  // Inicialize o título
        this.sonho = sonho;
        this.data = data;
        this.hora = hora;
    }

    public int getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;  // Adicionando o getter para título
    }

    public String getSonho() {
        return sonho;
    }

    public String getData() {
        return data;
    }

    public String getHora() {
        return hora;
    }
}
