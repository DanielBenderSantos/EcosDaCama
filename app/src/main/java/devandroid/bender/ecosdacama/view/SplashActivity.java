package devandroid.bender.ecosdacama.view;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;

import devandroid.bender.ecosdacama.R;
import devandroid.bender.ecosdacama.database.EcosDaCamaDB;

public class SplashActivity extends AppCompatActivity {

    public static final int TIME_OUT_SPLASH = 3000;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        comutarTelaSplash();
    }

    private void comutarTelaSplash() {
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {

                EcosDaCamaDB db = new EcosDaCamaDB(SplashActivity.this);
                Intent telaPrincipal = new Intent(SplashActivity.this, LoginActivity.class);

                startActivity(telaPrincipal);
                finish();
            }
        },TIME_OUT_SPLASH);
    }
}