package devandroid.bender.ecosdacama.view;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.View;
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
    private EditText editTextSearch;  // Campo de pesquisa

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

        // Inicializa o campo de pesquisa
        editTextSearch = findViewById(R.id.editTextSearch);

        // Adiciona o TextWatcher para o campo de pesquisa
        editTextSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int start, int count, int after) {
                // Não é necessário fazer nada aqui
            }

            @Override
            public void onTextChanged(CharSequence charSequence, int start, int before, int count) {
                // Realiza a pesquisa sempre que o texto mudar
                String query = charSequence.toString();
                searchSonhos(query);  // Chama a função de pesquisa
            }

            @Override
            public void afterTextChanged(Editable editable) {
                // Não é necessário fazer nada aqui
            }
        });

        // Pegue a conta do usuário
        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(this);
        if (account != null) {
            Uri photoUri = account.getPhotoUrl();  // <- Aqui está a imagem de perfil

            if (photoUri != null) {
                ImageView imageProfile = findViewById(R.id.imageProfile);

                Glide.with(this)
                        .load(photoUri)
                        .circleCrop() // Deixa redondinha
                        .placeholder(R.drawable.cama) // Imagem padrão enquanto carrega
                        .into(imageProfile);
            }
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadSonhosFromDatabase(); // Atualiza a lista de sonhos sempre que a activity for retomada
        editTextSearch.setText("");
    }

    // Método para realizar a pesquisa
    private void searchSonhos(String query) {
        List<Sonho> filteredSonhos = dbHelper.searchSonhos(query);  // Pesquisa no banco de dados
        sonhoAdapter.updateList(filteredSonhos);  // Atualiza a lista no adapter
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
