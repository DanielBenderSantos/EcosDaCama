package devandroid.bender.ecosdacama.view;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import devandroid.bender.ecosdacama.R;
import devandroid.bender.ecosdacama.database.EcosDaCamaDB;
import devandroid.bender.ecosdacama.model.Sonho;
import devandroid.bender.ecosdacama.view.SonhoAdapter;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.util.List;

public class HomeSonhosActivity extends AppCompatActivity {

    private RecyclerView recyclerView;
    private SonhoAdapter sonhoAdapter;
    private EcosDaCamaDB dbHelper;
    private FloatingActionButton fabAddSonho;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_homesonhos_ecosdacama);

        recyclerView = findViewById(R.id.recyclerViewSonhos);  // Certifique-se de ter o ID correto

        // Configuração do RecyclerView
        recyclerView.setLayoutManager(new LinearLayoutManager(this));

        // Instancia o helper do banco de dados
        dbHelper = new EcosDaCamaDB(this);

        // Carrega os dados do banco
        loadSonhosFromDatabase();

        // Configura o botão flutuante (+)
        fabAddSonho = findViewById(R.id.fabAddSonho);
        fabAddSonho.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Navega para a EcosDaCamaActivity
                Intent intent = new Intent(HomeSonhosActivity.this, EcosDaCamaActivity.class);
                startActivity(intent);
            }
        });
    }

    private void loadSonhosFromDatabase() {
        List<Sonho> sonhos = dbHelper.getAllSonhos();

        if (sonhos.isEmpty()) {
            Toast.makeText(this, "Nenhum sonho encontrado!", Toast.LENGTH_SHORT).show();
        }

        // Cria e configura o Adapter
        sonhoAdapter = new SonhoAdapter(sonhos);
        recyclerView.setAdapter(sonhoAdapter);
    }
}
