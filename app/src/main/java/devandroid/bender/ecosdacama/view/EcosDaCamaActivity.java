package devandroid.bender.ecosdacama.view;

import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.DatePicker;
import android.widget.TextView;
import android.widget.TimePicker;
import android.widget.Toast;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import java.util.Calendar;
import devandroid.bender.ecosdacama.R;

public class EcosDaCamaActivity extends AppCompatActivity {

    TextView tvDate;
    TextView tvTime;
    Button btnSalvar;
    Button btnFinalizar;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_ecosdacama);

        // Inicializando os elementos após o setContentView
        tvDate = findViewById(R.id.tvDate);
        tvTime = findViewById(R.id.tvTime);
        btnSalvar = findViewById(R.id.btnSalvar);
        btnFinalizar = findViewById(R.id.btnFinalizar);

        // Abrir seletor de data ao clicar no campo
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

        // Abrir seletor de hora ao clicar no campo
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

        btnSalvar.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                // TODO: Desabilitar o botão salvar
                btnSalvar.setEnabled(false);
                Toast.makeText(EcosDaCamaActivity.this, "Sonho salvo!", Toast.LENGTH_SHORT).show();
            }
        });

        btnFinalizar.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Toast.makeText(EcosDaCamaActivity.this, "Volte Sempre", Toast.LENGTH_LONG).show();
                finish();
            }
        });
    }
}
