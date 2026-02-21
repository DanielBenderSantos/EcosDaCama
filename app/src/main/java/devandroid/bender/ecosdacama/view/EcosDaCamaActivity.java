package devandroid.bender.ecosdacama.view;

import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.content.ContentValues;
import android.database.sqlite.SQLiteDatabase;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.DatePicker;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.TimePicker;
import android.widget.Toast;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import devandroid.bender.ecosdacama.BuildConfig;
import devandroid.bender.ecosdacama.R;
import devandroid.bender.ecosdacama.database.EcosDaCamaDB;
import devandroid.bender.ecosdacama.model.Sonho;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

import android.content.Intent;
import android.speech.RecognizerIntent;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

import org.json.JSONException;
import org.json.JSONObject;

public class EcosDaCamaActivity extends AppCompatActivity {

    TextView tvDate, tvTime, tvSignificado;
    Button btnSalvar, btnVerSignificado;
    EditText editSonho, editTitulo;
    ImageButton btnMicrofone;

    private static final int REQUEST_CODE_SPEECH_INPUT = 1;
    private EcosDaCamaDB dbHelper;
    private Calendar calendar;
    private int sonhoId = -1;
    private String significadoDoSonho = "";

    private static final String API_URL = BuildConfig.DREAM_API_URL;
    private final OkHttpClient client = new OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(15, TimeUnit.SECONDS)
            .build();

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_ecosdacama);

        tvDate = findViewById(R.id.tvDate);
        tvTime = findViewById(R.id.tvTime);
        btnSalvar = findViewById(R.id.btnSalvar);
        editSonho = findViewById(R.id.editSonho);
        editTitulo = findViewById(R.id.editTitulo);
        btnMicrofone = findViewById(R.id.btnMicrofone);
        btnVerSignificado = findViewById(R.id.btnVerSignificado);
        tvSignificado = findViewById(R.id.tvSignificado);

        dbHelper = new EcosDaCamaDB(this);
        calendar = Calendar.getInstance();
        updateDateTimeDisplay();

        // Verifica se veio um sonho para editar
        if (getIntent().hasExtra("sonho_id")) {
            sonhoId = getIntent().getIntExtra("sonho_id", -1);
            String titulo = getIntent().getStringExtra("titulo");
            String descricao = getIntent().getStringExtra("descricao");
            String data = getIntent().getStringExtra("data");
            String hora = getIntent().getStringExtra("hora");
            String significado = getIntent().getStringExtra("significado");

            editTitulo.setText(titulo);
            editSonho.setText(descricao);
            tvDate.setText(data);
            tvTime.setText(hora);

            if (significado != null && !significado.isEmpty()) {
                tvSignificado.setVisibility(View.VISIBLE);
                tvSignificado.setText(significado);
                significadoDoSonho = significado;
            }
        }

        tvDate.setOnClickListener(v -> showDatePicker());
        tvTime.setOnClickListener(v -> showTimePicker());

        btnMicrofone.setOnClickListener(v -> {
            Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault());
            intent.putExtra(RecognizerIntent.EXTRA_PROMPT, "Fale seu sonho...");

            try {
                startActivityForResult(intent, REQUEST_CODE_SPEECH_INPUT);
            } catch (Exception e) {
                Toast.makeText(this, "Seu dispositivo não suporta entrada de voz", Toast.LENGTH_SHORT).show();
            }
        });

        btnSalvar.setOnClickListener(view -> {
            String titulo = editTitulo.getText().toString();
            String descricao = editSonho.getText().toString();
            String data = tvDate.getText().toString();
            String hora = tvTime.getText().toString();

            Sonho sonho = new Sonho(titulo, descricao, data, hora);
            sonho.setSignificado(significadoDoSonho);

            salvarSonhoNoBanco(sonho);
            btnSalvar.setEnabled(false);
            Toast.makeText(this, sonhoId != -1 ? "Sonho atualizado!" : "Sonho salvo!", Toast.LENGTH_SHORT).show();
            finish();
        });

        btnVerSignificado.setOnClickListener(v -> {
            String textoDoSonho = editSonho.getText().toString();
            if (!textoDoSonho.isEmpty()) {
                obterSignificadoDoSonho(textoDoSonho);
                tvSignificado.setVisibility(View.VISIBLE);
                tvSignificado.setText("Carregando significado...");
            } else {
                Toast.makeText(this, "Por favor, digite a descrição do seu sonho.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showDatePicker() {
        new DatePickerDialog(this, (view, year, month, dayOfMonth) -> {
            calendar.set(Calendar.YEAR, year);
            calendar.set(Calendar.MONTH, month);
            calendar.set(Calendar.DAY_OF_MONTH, dayOfMonth);
            updateDateTimeDisplay();
        }, calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DAY_OF_MONTH)).show();
    }

    private void showTimePicker() {
        new TimePickerDialog(this, (view, hourOfDay, minute) -> {
            calendar.set(Calendar.HOUR_OF_DAY, hourOfDay);
            calendar.set(Calendar.MINUTE, minute);
            updateDateTimeDisplay();
        }, calendar.get(Calendar.HOUR_OF_DAY), calendar.get(Calendar.MINUTE), true).show();
    }

    private void updateDateTimeDisplay() {
        String dateText = String.format(Locale.getDefault(), "%02d/%02d/%04d",
                calendar.get(Calendar.DAY_OF_MONTH),
                calendar.get(Calendar.MONTH) + 1,
                calendar.get(Calendar.YEAR));

        String timeText = String.format(Locale.getDefault(), "%02d:%02d",
                calendar.get(Calendar.HOUR_OF_DAY),
                calendar.get(Calendar.MINUTE));

        tvDate.setText(dateText);
        tvTime.setText(timeText);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_CODE_SPEECH_INPUT && resultCode == RESULT_OK && data != null) {
            ArrayList<String> result = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            if (result != null && !result.isEmpty()) {
                editSonho.append(result.get(0) + " ");
            }
        }
    }

    private void salvarSonhoNoBanco(Sonho sonho) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(EcosDaCamaDB.COLUMN_TITULO, sonho.getTitulo());
        values.put(EcosDaCamaDB.COLUMN_SONHO, sonho.getDescricao());
        values.put(EcosDaCamaDB.COLUMN_DATA, sonho.getData());
        values.put(EcosDaCamaDB.COLUMN_HORA, sonho.getHora());
        values.put(EcosDaCamaDB.COLUMN_SIGNIFICADO, sonho.getSignificado());

        if (sonhoId != -1) {
            db.update(EcosDaCamaDB.TABLE_SONHOS, values, "id = ?", new String[]{String.valueOf(sonhoId)});
        } else {
            db.insert(EcosDaCamaDB.TABLE_SONHOS, null, values);
        }
        db.close();
    }

    private void obterSignificadoDoSonho(String textoDoSonho) {
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("sonho", textoDoSonho);
            jsonObject.put("prompt", "Analise o seguinte sonho e me diga seu possível significado com base em interpretações comuns da simbologia dos sonhos. Seja objetivo e considere aspectos psicológicos e simbólicos tradicionais.");

        } catch (JSONException e) {
            Log.e("EcosDaCama", "Erro ao criar requisição JSON", e);
            runOnUiThread(() -> tvSignificado.setText("Erro ao criar requisição."));
            return;
        }

        MediaType JSON = MediaType.parse("application/json; charset=utf-8");
        RequestBody body = RequestBody.create(jsonObject.toString(), JSON);

        Request request = new Request.Builder().url(API_URL).post(body).build();

        new Thread(() -> {
            try (Response response = client.newCall(request).execute()) {
                if (response.isSuccessful()) {
                    final String resposta = response.body().string();
                    runOnUiThread(() -> {
                        try {
                            JSONObject respostaJson = new JSONObject(resposta);
                            significadoDoSonho = respostaJson.getString("significado");
                            tvSignificado.setText(significadoDoSonho);
                        } catch (JSONException e) {
                            tvSignificado.setText("Erro ao processar a resposta.");
                            significadoDoSonho = "";
                        }
                    });
                } else {
                    final String errorBody = response.body() != null ? response.body().string() : "Erro desconhecido";
                    runOnUiThread(() -> tvSignificado.setText("Erro: " + response.code() + " - " + errorBody));
                    significadoDoSonho = "";
                }
            } catch (IOException e) {
                runOnUiThread(() -> tvSignificado.setText("Erro de rede ao obter o significado."));
                significadoDoSonho = "";
            }
        }).start();
    }
}
