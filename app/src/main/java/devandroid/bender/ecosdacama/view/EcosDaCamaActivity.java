package devandroid.bender.ecosdacama.view;

import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.content.ContentValues;
import android.database.sqlite.SQLiteDatabase;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
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
import devandroid.bender.ecosdacama.R;
import devandroid.bender.ecosdacama.database.EcosDaCamaDB;

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

    TextView tvDate;
    TextView tvTime;
    Button btnSalvar;
    EditText editSonho;
    EditText editTitulo;
    ImageButton btnMicrofone;
    Button btnVerSignificado;
    TextView tvSignificado;

    private static final int REQUEST_CODE_SPEECH_INPUT = 1;
    private EcosDaCamaDB dbHelper;
    private Calendar calendar;
    private int sonhoId = -1;

    // Substitua pela URL da sua API de backend
    private static final String API_URL = "http://192.168.1.79:3000/api/interpretar-sonho";

    // Crie um cliente OkHttpClient para fazer as requisições HTTP

    private final OkHttpClient client = new OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS) // Tempo para estabelecer a conexão inicial
            .readTimeout(30, TimeUnit.SECONDS)    // Tempo máximo para receber os dados
            .writeTimeout(15, TimeUnit.SECONDS)   // Tempo máximo para enviar os dados
            .build();
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_ecosdacama);

        // Inicialização dos componentes
        tvDate = findViewById(R.id.tvDate);
        tvTime = findViewById(R.id.tvTime);
        btnSalvar = findViewById(R.id.btnSalvar);
        editSonho = findViewById(R.id.editSonho);
        editTitulo = findViewById(R.id.editTitulo);
        btnMicrofone = findViewById(R.id.btnMicrofone);
        btnVerSignificado = findViewById(R.id.btnVerSignificado);
        tvSignificado = findViewById(R.id.tvSignificado);

        // Inicializando o helper do banco de dados
        dbHelper = new EcosDaCamaDB(this);

        // Inicializa o calendário com a data e hora atuais
        calendar = Calendar.getInstance();
        updateDateTimeDisplay();

        // Verifica se veio um sonho para editar
        if (getIntent().hasExtra("sonho_id")) {
            sonhoId = getIntent().getIntExtra("sonho_id", -1);
            String titulo = getIntent().getStringExtra("titulo");
            String descricao = getIntent().getStringExtra("descricao");
            String data = getIntent().getStringExtra("data");
            String hora = getIntent().getStringExtra("hora");

            editTitulo.setText(titulo);
            editSonho.setText(descricao);
            tvDate.setText(data);
            tvTime.setText(hora);
        }

        // Selecionar data
        tvDate.setOnClickListener(v -> showDatePicker());

        // Selecionar hora
        tvTime.setOnClickListener(v -> showTimePicker());

        // Reconhecimento de voz
        btnMicrofone.setOnClickListener(v -> {
            Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault());
            intent.putExtra(RecognizerIntent.EXTRA_PROMPT, "Fale seu sonho...");

            try {
                startActivityForResult(intent, REQUEST_CODE_SPEECH_INPUT);
            } catch (Exception e) {
                Toast.makeText(EcosDaCamaActivity.this, "Seu dispositivo não suporta entrada de voz", Toast.LENGTH_SHORT).show();
            }
        });

        // Salvar sonho
        btnSalvar.setOnClickListener(view -> {
            String titulo = editTitulo.getText().toString();
            String sonho = editSonho.getText().toString();
            String data = tvDate.getText().toString();
            String hora = tvTime.getText().toString();

            salvarSonho(titulo, sonho, data, hora);

            btnSalvar.setEnabled(false);
            Toast.makeText(EcosDaCamaActivity.this, sonhoId != -1 ? "Sonho atualizado!" : "Sonho salvo!", Toast.LENGTH_SHORT).show();

            finish(); // Fecha a tela e volta para a anterior
        });

        // Ver significado do sonho
        btnVerSignificado.setOnClickListener(v -> {
            String textoDoSonho = editSonho.getText().toString();
            if (!textoDoSonho.isEmpty()) {
                // Chame a função para obter o significado da API
                obterSignificadoDoSonho(textoDoSonho);
                tvSignificado.setVisibility(View.VISIBLE);
                tvSignificado.setText("Carregando significado...");
            } else {
                Toast.makeText(EcosDaCamaActivity.this, "Por favor, digite a descrição do seu sonho.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showDatePicker() {
        DatePickerDialog datePickerDialog = new DatePickerDialog(
                this,
                (view, year, month, dayOfMonth) -> {
                    calendar.set(Calendar.YEAR, year);
                    calendar.set(Calendar.MONTH, month);
                    calendar.set(Calendar.DAY_OF_MONTH, dayOfMonth);
                    updateDateTimeDisplay();
                },
                calendar.get(Calendar.YEAR),
                calendar.get(Calendar.MONTH),
                calendar.get(Calendar.DAY_OF_MONTH)
        );
        datePickerDialog.show();
    }

    private void showTimePicker() {
        TimePickerDialog timePickerDialog = new TimePickerDialog(
                this,
                (view, hourOfDay, minute) -> {
                    calendar.set(Calendar.HOUR_OF_DAY, hourOfDay);
                    calendar.set(Calendar.MINUTE, minute);
                    updateDateTimeDisplay();
                },
                calendar.get(Calendar.HOUR_OF_DAY),
                calendar.get(Calendar.MINUTE),
                true
        );
        timePickerDialog.show();
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
                String spokenText = result.get(0);
                editSonho.append(spokenText + " ");
            }
        }
    }

    private void salvarSonho(String titulo, String sonho, String data, String hora) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();

        ContentValues values = new ContentValues();
        values.put(EcosDaCamaDB.COLUMN_TITULO, titulo);
        values.put(EcosDaCamaDB.COLUMN_SONHO, sonho);
        values.put(EcosDaCamaDB.COLUMN_DATA, data);
        values.put(EcosDaCamaDB.COLUMN_HORA, hora);

        if (sonhoId != -1) {
            db.update(EcosDaCamaDB.TABLE_SONHOS, values, "id = ?", new String[]{String.valueOf(sonhoId)});
        } else {
            db.insert(EcosDaCamaDB.TABLE_SONHOS, null, values);
        }

        db.close();
    }
    private void obterSignificadoDoSonho(String sonho) {
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("sonho", sonho);
        } catch (JSONException e) {
            Log.e("EcosDaCama", "Erro ao criar requisição JSON", e);
            runOnUiThread(() -> tvSignificado.setText("Erro ao criar requisição."));
            return;
        }

        MediaType JSON = MediaType.parse("application/json; charset=utf-8");
        RequestBody body = RequestBody.create(jsonObject.toString(), JSON);

        Request request = new Request.Builder()
                .url(API_URL)
                .post(body)
                .build();

        Log.d("EcosDaCama", "Enviando requisição para: " + API_URL);
        Log.d("EcosDaCama", "Corpo da requisição: " + jsonObject.toString());

        new Thread(() -> {
            try (Response response = client.newCall(request).execute()) {
                Log.d("EcosDaCama", "Resposta recebida. Código: " + response.code());
                if (response.isSuccessful()) {
                    final String resposta = response.body().string();
                    Log.d("EcosDaCama", "Corpo da resposta: " + resposta);
                    runOnUiThread(() -> {
                        try {
                            JSONObject respostaJson = new JSONObject(resposta);
                            String significado = respostaJson.getString("significado");
                            tvSignificado.setText(significado);
                        } catch (JSONException e) {
                            Log.e("EcosDaCama", "Erro ao processar JSON da resposta", e);
                            tvSignificado.setText("Erro ao processar a resposta.");
                        }
                    });
                } else {
                    final String errorBody = response.body() != null ? response.body().string() : "Erro desconhecido";
                    Log.e("EcosDaCama", "Erro na requisição: " + response.code() + " - " + errorBody);
                    runOnUiThread(() -> tvSignificado.setText("Erro na requisição: " + response.code() + " - " + errorBody));
                }
            } catch (IOException e) {
                Log.e("EcosDaCama", "Erro de rede ao obter o significado", e);
                runOnUiThread(() -> tvSignificado.setText("Erro de rede ao obter o significado."));
            }
        }).start();
    }

}