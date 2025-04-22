package devandroid.bender.ecosdacama.model;

public class Sonho {
    private int id;
    private String titulo;
    private String sonho;
    private String data;
    private String hora;

    // Construtor
    public Sonho(String titulo, String sonho, String data, String hora) {
        this.titulo = titulo;
        this.sonho = sonho;
        this.data = data;
        this.hora = hora;
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

    public String getSonho() {
        return sonho;
    }

    public String getData() {
        return data;
    }

    public String getHora() {
        return hora;
    }

    @Override
    public String toString() {
        return "Sonho{" +
                "titulo='" + titulo + '\'' +
                ", sonho='" + sonho + '\'' +
                ", data='" + data + '\'' +
                ", hora='" + hora + '\'' +
                '}';
    }
}
