package devandroid.bender.ecosdacama.view;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
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

        // Inicializa os componentes
        recyclerView = findViewById(R.id.recyclerViewSonhos);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        dbHelper = new EcosDaCamaDB(this);
        fabAddSonho = findViewById(R.id.fabAddSonho);
        editTextSearch = findViewById(R.id.editTextSearch);
        imageProfile = findViewById(R.id.imageProfile);

        // Botão flutuante para adicionar sonho
        fabAddSonho.setOnClickListener(v -> {
            Intent intent = new Intent(HomeSonhosActivity.this, EcosDaCamaActivity.class);
            startActivity(intent);
        });

        // Pesquisa no campo de busca
        editTextSearch.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) { }
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) {
                searchSonhos(s.toString());
            }
            @Override public void afterTextChanged(Editable s) { }
        });

        // Clique na imagem de perfil
        imageProfile.setOnClickListener(v -> {
            GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(HomeSonhosActivity.this);

            if (account != null) {
                // Se estiver logado, vai para a tela de perfil
                Intent intent = new Intent(HomeSonhosActivity.this, PerfilActivity.class);
                startActivity(intent);
            } else {
                // Se não estiver logado, volta para a tela de login
                Intent intent = new Intent(HomeSonhosActivity.this, LoginActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                finish();
            }
        });

        // Carrega a foto do perfil se estiver logado
        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(this);
        if (account != null) {
            Uri photoUri = account.getPhotoUrl();
            if (photoUri != null) {
                Glide.with(this)
                        .load(photoUri)
                        .circleCrop()
                        .placeholder(R.drawable.cama)
                        .into(imageProfile);
            }
        }
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
                intent.putExtra("descricao", sonho.getSonho());
                intent.putExtra("data", sonho.getData());
                intent.putExtra("hora", sonho.getHora());
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
