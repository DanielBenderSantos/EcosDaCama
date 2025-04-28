package devandroid.bender.ecosdacama.view;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.FileProvider;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;

import java.io.File;
import java.util.List;

import devandroid.bender.ecosdacama.R;
import devandroid.bender.ecosdacama.database.EcosDaCamaDB;
import devandroid.bender.ecosdacama.model.Sonho;
import devandroid.bender.ecosdacama.util.SonhosExporter;

public class PerfilActivity extends AppCompatActivity {

    private GoogleSignInClient mGoogleSignInClient;
    private Button btnLogout;
    private Button btnExportarSonhos;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_perfil);

        mGoogleSignInClient = GoogleSignIn.getClient(this,
                new com.google.android.gms.auth.api.signin.GoogleSignInOptions.Builder(
                        com.google.android.gms.auth.api.signin.GoogleSignInOptions.DEFAULT_SIGN_IN)
                        .build());

        btnLogout = findViewById(R.id.btnLogout);
        btnExportarSonhos = findViewById(R.id.btnExportarSonhos); // novo botão

        btnLogout.setOnClickListener(v -> {
            mGoogleSignInClient.signOut().addOnCompleteListener(this, task -> {
                Intent intent = new Intent(PerfilActivity.this, LoginActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                finish();
            });
        });

        btnExportarSonhos.setOnClickListener(v -> exportarSonhosParaArquivo());
    }

    private void exportarSonhosParaArquivo() {
        // 1. Buscar todos os sonhos do banco
        EcosDaCamaDB db = new EcosDaCamaDB(this);
        List<Sonho> sonhos = db.getAllSonhos();

        if (sonhos.isEmpty()) {
            // Nada para exportar
            return;
        }

        // 2. Exportar para arquivo
        File file = SonhosExporter.exportSonhos(this, sonhos);

        // 3. Compartilhar para salvar no Google Drive
        Uri uri = FileProvider.getUriForFile(this, getPackageName() + ".fileprovider", file);

        Intent intent = new Intent(Intent.ACTION_SEND);
        intent.setType("text/plain");
        intent.putExtra(Intent.EXTRA_STREAM, uri);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

        startActivity(Intent.createChooser(intent, "Salvar Sonhos no Drive"));
    }
}
