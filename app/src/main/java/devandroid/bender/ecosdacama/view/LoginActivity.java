package devandroid.bender.ecosdacama.view;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.Toast;
import com.google.android.gms.auth.api.signin.*;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;

import devandroid.bender.ecosdacama.R;

public class LoginActivity extends AppCompatActivity {

    private static final int RC_SIGN_IN = 100;
    private GoogleSignInClient mGoogleSignInClient;
    private static final String TAG = "LoginGoogle";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        Button btnLogin = findViewById(R.id.btnLogin);

        // Configura o login com o Google
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()  // Solicita o e-mail do usuário
                .build();
        mGoogleSignInClient = GoogleSignIn.getClient(this, gso);

        btnLogin.setOnClickListener(v -> {
            Intent signInIntent = mGoogleSignInClient.getSignInIntent();
            startActivityForResult(signInIntent, RC_SIGN_IN);
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == RC_SIGN_IN) {
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            try {
                GoogleSignInAccount account = task.getResult();
                String email = account.getEmail();
                Toast.makeText(this, "Login com: " + email, Toast.LENGTH_SHORT).show();

                // Redireciona para a próxima tela
                Intent intent = new Intent(LoginActivity.this, HomeSonhosActivity.class);
                startActivity(intent);
                finish();  // Fecha a LoginActivity para evitar que o usuário volte a ela com o botão "voltar"

            } catch (Exception e) {
                Log.e(TAG, "Falha no login", e);
                Toast.makeText(this, "Erro no login", Toast.LENGTH_SHORT).show();
            }
        }
    }
}
