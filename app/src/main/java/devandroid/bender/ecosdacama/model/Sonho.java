package devandroid.bender.ecosdacama.model;

public class Sonho {
    private int id;
    private String titulo;
    private String descricao; // Renomeado de 'sonho' para 'descricao' para melhor clareza
    private String data;
    private String hora;
    private String significado; // Adicionado para armazenar o significado

    // Construtor
    public Sonho(String titulo, String descricao, String data, String hora) {
        this.titulo = titulo;
        this.descricao = descricao;
        this.data = data;
        this.hora = hora;
        this.significado = ""; // Inicializa o significado como vazio
    }

    // Getters e Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public String getHora() {
        return hora;
    }

    public void setHora(String hora) {
        this.hora = hora;
    }

    public String getSignificado() {
        return significado;
    }

    public void setSignificado(String significado) {
        this.significado = significado;
    }

    @Override
    public String toString() {
        return "Sonho{" +
                "id=" + id +
                ", titulo='" + titulo + '\'' +
                ", descricao='" + descricao + '\'' +
                ", data='" + data + '\'' +
                ", hora='" + hora + '\'' +
                ", significado='" + significado + '\'' +
                '}';
    }
}