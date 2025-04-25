package devandroid.bender.ecosdacama.database;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

import devandroid.bender.ecosdacama.model.Sonho;

import java.util.ArrayList;
import java.util.List;

public class EcosDaCamaDB extends SQLiteOpenHelper {

    private static final String DATABASE_NAME = "sonhos_db";
    private static final int DATABASE_VERSION = 2;
    public static final String TABLE_SONHOS = "sonhos";
    public static final String COLUMN_ID = "id";
    public static final String COLUMN_TITULO = "titulo";
    public static final String COLUMN_SONHO = "sonho";
    public static final String COLUMN_DATA = "data";
    public static final String COLUMN_HORA = "hora";

    private static final String TABLE_CREATE =
            "CREATE TABLE " + TABLE_SONHOS + " (" +
                    COLUMN_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    COLUMN_TITULO + " TEXT, " +
                    COLUMN_SONHO + " TEXT, " +
                    COLUMN_DATA + " TEXT, " +
                    COLUMN_HORA + " TEXT);";

    private static final String TABLE_ALTER =
            "ALTER TABLE " + TABLE_SONHOS + " ADD COLUMN " + COLUMN_TITULO + " TEXT;";

    public EcosDaCamaDB(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL(TABLE_CREATE);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        if (oldVersion < 2) {
            db.execSQL(TABLE_ALTER);
        }
    }

    // Método para pegar todos os sonhos do banco
    public List<Sonho> getAllSonhos() {
        List<Sonho> sonhosList = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();

        // Query para selecionar todos os registros
        Cursor cursor = db.query(TABLE_SONHOS, null, null, null, null, null, null);

        if (cursor != null) {
            // Verifique os índices das colunas
            int idIndex = cursor.getColumnIndex(COLUMN_ID);
            int tituloIndex = cursor.getColumnIndex(COLUMN_TITULO);
            int sonhoIndex = cursor.getColumnIndex(COLUMN_SONHO);
            int dataIndex = cursor.getColumnIndex(COLUMN_DATA);
            int horaIndex = cursor.getColumnIndex(COLUMN_HORA);

            // Verifique se algum índice é inválido
            if (idIndex == -1 || tituloIndex == -1 || sonhoIndex == -1 || dataIndex == -1 || horaIndex == -1) {
                Log.e("getAllSonhos", "Uma ou mais colunas não foram encontradas no banco de dados.");
            } else {
                while (cursor.moveToNext()) {
                    // Pegando os dados de cada coluna
                    int id = cursor.getInt(idIndex);
                    String titulo = cursor.getString(tituloIndex);
                    String sonho = cursor.getString(sonhoIndex);
                    String data = cursor.getString(dataIndex);
                    String hora = cursor.getString(horaIndex);

                    // Criando o objeto Sonho
                    Sonho sonhoObj = new Sonho(titulo, sonho, data, hora);
                    sonhoObj.setId(id);  // Definindo o ID para o objeto

                    // Adicionando o sonho à lista
                    sonhosList.add(sonhoObj);
                }
            }
            cursor.close();
        }

        db.close();
        return sonhosList;
    }
    public void deleteSonho(int sonhoId) {
        SQLiteDatabase db = this.getWritableDatabase();
        db.delete(TABLE_SONHOS, COLUMN_ID + " = ?", new String[]{String.valueOf(sonhoId)});
        db.close();
    }

    // Método para pesquisar sonhos com base no título ou descrição
    public List<Sonho> searchSonhos(String query) {
        List<Sonho> sonhosList = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();

        // Query para buscar sonhos pelo título ou descrição
        String selection = COLUMN_TITULO + " LIKE ? OR " + COLUMN_SONHO + " LIKE ?";
        String[] selectionArgs = {"%" + query + "%", "%" + query + "%"};  // "%" para buscar qualquer ocorrência da string

        Cursor cursor = db.query(TABLE_SONHOS, null, selection, selectionArgs, null, null, null);

        if (cursor != null) {
            // Verifique os índices das colunas
            int idIndex = cursor.getColumnIndex(COLUMN_ID);
            int tituloIndex = cursor.getColumnIndex(COLUMN_TITULO);
            int sonhoIndex = cursor.getColumnIndex(COLUMN_SONHO);
            int dataIndex = cursor.getColumnIndex(COLUMN_DATA);
            int horaIndex = cursor.getColumnIndex(COLUMN_HORA);

            while (cursor.moveToNext()) {
                // Pegando os dados de cada coluna
                int id = cursor.getInt(idIndex);
                String titulo = cursor.getString(tituloIndex);
                String sonho = cursor.getString(sonhoIndex);
                String data = cursor.getString(dataIndex);
                String hora = cursor.getString(horaIndex);

                // Criando o objeto Sonho
                Sonho sonhoObj = new Sonho(titulo, sonho, data, hora);
                sonhoObj.setId(id);  // Definindo o ID para o objeto

                // Adicionando o sonho à lista
                sonhosList.add(sonhoObj);
            }
            cursor.close();
        }

        db.close();
        return sonhosList;
    }

}
