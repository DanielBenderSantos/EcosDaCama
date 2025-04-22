package devandroid.bender.ecosdacama.view;

import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.content.ContentValues;
import android.database.sqlite.SQLiteDatabase;
import android.os.Bundle;
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

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Locale;
import android.content.Intent;
import android.speech.RecognizerIntent;

public class EcosDaCamaActivity extends AppCompatActivity {

    TextView tvDate;
    TextView tvTime;
    Button btnSalvar;
    EditText editSonho;
    EditText editTitulo;
    ImageButton btnMicrofone;

    private static final int REQUEST_CODE_SPEECH_INPUT = 1;
    private EcosDaCamaDB dbHelper;
    private Calendar calendar;

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

        // Inicializando o helper do banco de dados
        dbHelper = new EcosDaCamaDB(this);

        // Inicializa o calendário com a data e hora atuais
        calendar = Calendar.getInstance();
        updateDateTimeDisplay();

        // Configura o clique para selecionar data
        tvDate.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showDatePicker();
            }
        });

        // Configura o clique para selecionar hora
        tvTime.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showTimePicker();
            }
        });

        // Ação do microfone para reconhecimento de fala
        btnMicrofone.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault());
                intent.putExtra(RecognizerIntent.EXTRA_PROMPT, "Fale seu sonho...");

                try {
                    startActivityForResult(intent, REQUEST_CODE_SPEECH_INPUT);
                } catch (Exception e) {
                    Toast.makeText(EcosDaCamaActivity.this, "Seu dispositivo não suporta entrada de voz", Toast.LENGTH_SHORT).show();
                }
            }
        });

        // Ação do botão Salvar
        btnSalvar.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String titulo = editTitulo.getText().toString();
                String sonho = editSonho.getText().toString();
                String data = tvDate.getText().toString();
                String hora = tvTime.getText().toString();

                // Salvar no banco de dados
                salvarSonho(titulo, sonho, data, hora);

                // Desabilitar o botão e mostrar uma mensagem
                btnSalvar.setEnabled(false);
                Toast.makeText(EcosDaCamaActivity.this, "Sonho salvo!", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showDatePicker() {
        DatePickerDialog datePickerDialog = new DatePickerDialog(
                this,
                new DatePickerDialog.OnDateSetListener() {
                    @Override
                    public void onDateSet(DatePicker view, int year, int month, int dayOfMonth) {
                        calendar.set(Calendar.YEAR, year);
                        calendar.set(Calendar.MONTH, month);
                        calendar.set(Calendar.DAY_OF_MONTH, dayOfMonth);
                        updateDateTimeDisplay();
                    }
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
                new TimePickerDialog.OnTimeSetListener() {
                    @Override
                    public void onTimeSet(TimePicker view, int hourOfDay, int minute) {
                        calendar.set(Calendar.HOUR_OF_DAY, hourOfDay);
                        calendar.set(Calendar.MINUTE, minute);
                        updateDateTimeDisplay();
                    }
                },
                calendar.get(Calendar.HOUR_OF_DAY),
                calendar.get(Calendar.MINUTE),
                true // formato 24 horas
        );
        timePickerDialog.show();
    }

    private void updateDateTimeDisplay() {
        // Formata a data como "dd/MM/yyyy"
        String dateText = String.format(Locale.getDefault(), "%02d/%02d/%04d",
                calendar.get(Calendar.DAY_OF_MONTH),
                calendar.get(Calendar.MONTH) + 1, // Mês começa em 0
                calendar.get(Calendar.YEAR));

        // Formata a hora como "HH:mm"
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

        db.insert(EcosDaCamaDB.TABLE_SONHOS, null, values);
        db.close();
    }
}