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

        // Inicializa o RecyclerView
        recyclerView = findViewById(R.id.recyclerViewSonhos);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));

        // Inicializa o banco de dados
        dbHelper = new EcosDaCamaDB(this);

        // Inicializa o botão flutuante para adicionar sonho
        fabAddSonho = findViewById(R.id.fabAddSonho);
        fabAddSonho.setOnClickListener(v -> {
            // Abre a tela para adicionar um novo sonho
            Intent intent = new Intent(HomeSonhosActivity.this, EcosDaCamaActivity.class);
            startActivity(intent);
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadSonhosFromDatabase(); // Atualiza a lista de sonhos sempre que a activity for retomada
    }

    private void loadSonhosFromDatabase() {
        List<Sonho> sonhos = dbHelper.getAllSonhos();

        if (sonhos.isEmpty()) {
            Toast.makeText(this, "Nenhum sonho encontrado!", Toast.LENGTH_SHORT).show();
        }

        // Inicializa o adapter e configura o listener
        sonhoAdapter = new SonhoAdapter(sonhos, new SonhoAdapter.OnItemClickListener() {
            @Override
            public void onItemClick(Sonho sonho) {
                // Abre a tela de detalhes do sonho
                Intent intent = new Intent(HomeSonhosActivity.this, EcosDaCamaActivity.class);
                intent.putExtra("sonho_id", sonho.getId());
                intent.putExtra("titulo", sonho.getTitulo());
                intent.putExtra("descricao", sonho.getSonho());
                intent.putExtra("data", sonho.getData());
                intent.putExtra("hora", sonho.getHora());
                startActivity(intent);
            }

            @Override
            public void onDeleteSonho(Sonho sonho) {
                // Excluir o sonho do banco de dados
                dbHelper.deleteSonho(sonho.getId());

                // Atualiza a lista após a exclusão
                loadSonhosFromDatabase();
            }
        }, dbHelper); // Passando o dbHelper para o Adapter

        // Configura o adapter no RecyclerView
        recyclerView.setAdapter(sonhoAdapter);
    }
}
