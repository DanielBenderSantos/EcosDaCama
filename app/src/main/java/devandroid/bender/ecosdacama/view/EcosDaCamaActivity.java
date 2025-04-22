package devandroid.bender.ecosdacama.view;

import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
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
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Locale;
import android.content.Intent;
import android.speech.RecognizerIntent;
import devandroid.bender.ecosdacama.R;

public class EcosDaCamaActivity extends AppCompatActivity {

    TextView tvDate;
    TextView tvTime;
    Button btnSalvar;
    Button btnFinalizar;

    EditText editSonho;
    ImageButton btnMicrofone;

    private static final int REQUEST_CODE_SPEECH_INPUT = 1;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_ecosdacama); // Coloque isso antes da inicialização dos elementos

        // Agora, inicialize os componentes
        tvDate = findViewById(R.id.tvDate);
        tvTime = findViewById(R.id.tvTime);
        btnSalvar = findViewById(R.id.btnSalvar);

        editSonho = findViewById(R.id.editSonho);
        btnMicrofone = findViewById(R.id.btnMicrofone);

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

        // Seletor de data
        tvDate.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Calendar c = Calendar.getInstance();
                int year = c.get(Calendar.YEAR);
                int month = c.get(Calendar.MONTH);
                int day = c.get(Calendar.DAY_OF_MONTH);

                DatePickerDialog datePickerDialog = new DatePickerDialog(
                        EcosDaCamaActivity.this,
                        new DatePickerDialog.OnDateSetListener() {
                            @Override
                            public void onDateSet(DatePicker view, int year, int month, int dayOfMonth) {
                                String dataSelecionada = String.format("%02d/%02d/%04d", dayOfMonth, month + 1, year);
                                tvDate.setText(dataSelecionada);
                            }
                        },
                        year, month, day
                );
                datePickerDialog.show();
            }
        });

        // Seletor de hora
        tvTime.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Calendar c = Calendar.getInstance();
                int hour = c.get(Calendar.HOUR_OF_DAY);
                int minute = c.get(Calendar.MINUTE);

                TimePickerDialog timePickerDialog = new TimePickerDialog(
                        EcosDaCamaActivity.this,
                        new TimePickerDialog.OnTimeSetListener() {
                            @Override
                            public void onTimeSet(TimePicker view, int hourOfDay, int minute) {
                                String horaSelecionada = String.format("%02d:%02d", hourOfDay, minute);
                                tvTime.setText(horaSelecionada);
                            }
                        },
                        hour, minute, true
                );
                timePickerDialog.show();
            }
        });

        // Ação do botão Salvar
        btnSalvar.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                // TODO: Desabilitar o botão salvar
                btnSalvar.setEnabled(false);
                Toast.makeText(EcosDaCamaActivity.this, "Sonho salvo!", Toast.LENGTH_SHORT).show();
            }
        });


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
}
