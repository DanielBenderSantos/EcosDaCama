package devandroid.bender.ecosdacama.view;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.util.List;

import devandroid.bender.ecosdacama.R;
import devandroid.bender.ecosdacama.database.EcosDaCamaDB;
import devandroid.bender.ecosdacama.model.Sonho;

public class HomeSonhosActivity extends AppCompatActivity {

    private RecyclerView recyclerView;
    private SonhoAdapter sonhoAdapter;
    private EcosDaCamaDB dbHelper;
    private FloatingActionButton fabAddSonho;
    private EditText editTextSearch;
    private ImageView imageProfile;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_homesonhos_ecosdacama);

        recyclerView = findViewById(R.id.recyclerViewSonhos);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        dbHelper = new EcosDaCamaDB(this);
        fabAddSonho = findViewById(R.id.fabAddSonho);
        editTextSearch = findViewById(R.id.editTextSearch);
        imageProfile = findViewById(R.id.imageProfile);

        fabAddSonho.setOnClickListener(v -> {
            Intent intent = new Intent(HomeSonhosActivity.this, EcosDaCamaActivity.class);
            startActivity(intent);
        });

        editTextSearch.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) { }
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) {
                searchSonhos(s.toString());
            }
            @Override public void afterTextChanged(Editable s) { }
        });

        imageProfile.setOnClickListener(v -> {
                Intent intent = new Intent(HomeSonhosActivity.this, PerfilActivity.class);
                startActivity(intent);
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadSonhosFromDatabase();
        editTextSearch.setText("");
    }

    private void searchSonhos(String query) {
        List<Sonho> filteredSonhos = dbHelper.searchSonhos(query);
        sonhoAdapter.updateList(filteredSonhos);
    }

    private void loadSonhosFromDatabase() {
        List<Sonho> sonhos = dbHelper.getAllSonhos();

        if (sonhos.isEmpty()) {
            Toast.makeText(this, "Nenhum sonho encontrado!", Toast.LENGTH_SHORT).show();
        }

        sonhoAdapter = new SonhoAdapter(sonhos, new SonhoAdapter.OnItemClickListener() {
            @Override
            public void onItemClick(Sonho sonho) {
                Intent intent = new Intent(HomeSonhosActivity.this, EcosDaCamaActivity.class);
                intent.putExtra("sonho_id", sonho.getId());
                intent.putExtra("titulo", sonho.getTitulo());
                intent.putExtra("descricao", sonho.getDescricao());
                intent.putExtra("data", sonho.getData());
                intent.putExtra("hora", sonho.getHora());
                intent.putExtra("significado", sonho.getSignificado()); // Campo adicionado aqui
                startActivity(intent);
            }

            @Override
            public void onDeleteSonho(Sonho sonho) {
                dbHelper.deleteSonho(sonho.getId());
                loadSonhosFromDatabase();
            }
        }, dbHelper);

        recyclerView.setAdapter(sonhoAdapter);
    }
}
