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
    private static final int DATABASE_VERSION = 3; // Incrementado para incluir a coluna 'significado'
    public static final String TABLE_SONHOS = "sonhos";
    public static final String COLUMN_ID = "id";
    public static final String COLUMN_TITULO = "titulo";
    public static final String COLUMN_SONHO = "sonho";
    public static final String COLUMN_DATA = "data";
    public static final String COLUMN_HORA = "hora";
    public static final String COLUMN_SIGNIFICADO = "significado"; // Nova coluna para o significado

    private static final String TABLE_CREATE =
            "CREATE TABLE " + TABLE_SONHOS + " (" +
                    COLUMN_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    COLUMN_TITULO + " TEXT, " +
                    COLUMN_SONHO + " TEXT, " +
                    COLUMN_DATA + " TEXT, " +
                    COLUMN_HORA + " TEXT, " +
                    COLUMN_SIGNIFICADO + " TEXT);"; // Coluna 'significado' adicionada

    private static final String TABLE_ALTER_ADD_TITULO =
            "ALTER TABLE " + TABLE_SONHOS + " ADD COLUMN " + COLUMN_TITULO + " TEXT;";

    private static final String TABLE_ALTER_ADD_SIGNIFICADO =
            "ALTER TABLE " + TABLE_SONHOS + " ADD COLUMN " + COLUMN_SIGNIFICADO + " TEXT;";

    public EcosDaCamaDB(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL(TABLE_CREATE);
        Log.d("EcosDaCamaDB", "Banco de dados criado.");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        Log.w("EcosDaCamaDB", "Atualizando o banco de dados da versão " + oldVersion + " para " + newVersion);

        if (oldVersion < 2) {
            try {
                db.execSQL(TABLE_ALTER_ADD_TITULO);
                Log.i("EcosDaCamaDB", "Coluna 'titulo' adicionada.");
            } catch (SQLException e) {
                Log.e("EcosDaCamaDB", "Erro ao adicionar coluna 'titulo': " + e.getMessage());
            }
        }
        if (oldVersion < 3) {
            try {
                db.execSQL(TABLE_ALTER_ADD_SIGNIFICADO);
                Log.i("EcosDaCamaDB", "Coluna 'significado' adicionada.");
            } catch (SQLException e) {
                Log.e("EcosDaCamaDB", "Erro ao adicionar coluna 'significado': " + e.getMessage());
            }
        }
    }

    // Método para pegar todos os sonhos do banco
    public List<Sonho> getAllSonhos() {
        List<Sonho> sonhosList = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();

        Cursor cursor = null;
        try {
            cursor = db.query(TABLE_SONHOS, null, null, null, null, null, null);

            if (cursor != null && cursor.moveToFirst()) {
                do {
                    int idIndex = cursor.getColumnIndex(COLUMN_ID);
                    int tituloIndex = cursor.getColumnIndex(COLUMN_TITULO);
                    int sonhoIndex = cursor.getColumnIndex(COLUMN_SONHO);
                    int dataIndex = cursor.getColumnIndex(COLUMN_DATA);
                    int horaIndex = cursor.getColumnIndex(COLUMN_HORA);
                    int significadoIndex = cursor.getColumnIndex(COLUMN_SIGNIFICADO);

                    int id = -1;
                    String titulo = "";
                    String sonhoTexto = "";
                    String dataTexto = "";
                    String horaTexto = "";
                    String significadoTexto = "";

                    if (idIndex != -1) id = cursor.getInt(idIndex);
                    if (tituloIndex != -1) titulo = cursor.getString(tituloIndex);
                    if (sonhoIndex != -1) sonhoTexto = cursor.getString(sonhoIndex);
                    if (dataIndex != -1) dataTexto = cursor.getString(dataIndex);
                    if (horaIndex != -1) horaTexto = cursor.getString(horaIndex);
                    if (significadoIndex != -1) significadoTexto = cursor.getString(significadoIndex);

                    Sonho sonhoObj = new Sonho(titulo, sonhoTexto, dataTexto, horaTexto);
                    sonhoObj.setId(id);
                    sonhoObj.setSignificado(significadoTexto);
                    sonhosList.add(sonhoObj);
                } while (cursor.moveToNext());
            }
        } catch (SQLException e) {
            Log.e("getAllSonhos", "Erro ao buscar sonhos: " + e.getMessage());
        } finally {
            if (cursor != null) {
                cursor.close();
            }
            db.close();
        }
        return sonhosList;
    }

    public long insertSonho(Sonho sonho) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_TITULO, sonho.getTitulo());
        values.put(COLUMN_SONHO, sonho.getDescricao());
        values.put(COLUMN_DATA, sonho.getData());
        values.put(COLUMN_HORA, sonho.getHora());
        values.put(COLUMN_SIGNIFICADO, sonho.getSignificado());

        long newRowId = -1;
        try {
            newRowId = db.insert(TABLE_SONHOS, null, values);
            Log.i("insertSonho", "Novo sonho inserido com ID: " + newRowId);
        } catch (SQLException e) {
            Log.e("insertSonho", "Erro ao inserir sonho: " + e.getMessage());
        } finally {
            db.close();
        }
        return newRowId;
    }

    public int updateSonho(Sonho sonho) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_TITULO, sonho.getTitulo());
        values.put(COLUMN_SONHO, sonho.getDescricao());
        values.put(COLUMN_DATA, sonho.getData());
        values.put(COLUMN_HORA, sonho.getHora());
        values.put(COLUMN_SIGNIFICADO, sonho.getSignificado());

        int rowsAffected = 0;
        try {
            rowsAffected = db.update(TABLE_SONHOS, values, COLUMN_ID + " = ?", new String[]{String.valueOf(sonho.getId())});
            Log.i("updateSonho", "Sonho com ID " + sonho.getId() + " atualizado. Linhas afetadas: " + rowsAffected);
        } catch (SQLException e) {
            Log.e("updateSonho", "Erro ao atualizar sonho: " + e.getMessage());
        } finally {
            db.close();
        }
        return rowsAffected;
    }

    public void deleteSonho(int sonhoId) {
        SQLiteDatabase db = this.getWritableDatabase();
        try {
            int rowsDeleted = db.delete(TABLE_SONHOS, COLUMN_ID + " = ?", new String[]{String.valueOf(sonhoId)});
            Log.i("deleteSonho", "Sonho com ID " + sonhoId + " deletado. Linhas afetadas: " + rowsDeleted);
        } catch (SQLException e) {
            Log.e("deleteSonho", "Erro ao deletar sonho: " + e.getMessage());
        } finally {
            db.close();
        }
    }

    // Método para pesquisar sonhos com base no título ou descrição
    public List<Sonho> searchSonhos(String query) {
        List<Sonho> sonhosList = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = null;

        try {
            String selection = COLUMN_TITULO + " LIKE ? OR " + COLUMN_SONHO + " LIKE ?";
            String[] selectionArgs = {"%" + query + "%", "%" + query + "%"};

            cursor = db.query(TABLE_SONHOS, null, selection, selectionArgs, null, null, null);

            if (cursor != null && cursor.moveToFirst()) {
                do {
                    int idIndex = cursor.getColumnIndex(COLUMN_ID);
                    int tituloIndex = cursor.getColumnIndex(COLUMN_TITULO);
                    int sonhoIndex = cursor.getColumnIndex(COLUMN_SONHO);
                    int dataIndex = cursor.getColumnIndex(COLUMN_DATA);
                    int horaIndex = cursor.getColumnIndex(COLUMN_HORA);
                    int significadoIndex = cursor.getColumnIndex(COLUMN_SIGNIFICADO);

                    int id = -1;
                    String titulo = "";
                    String sonhoTexto = "";
                    String dataTexto = "";
                    String horaTexto = "";
                    String significadoTexto = "";

                    if (idIndex != -1) id = cursor.getInt(idIndex);
                    if (tituloIndex != -1) titulo = cursor.getString(tituloIndex);
                    if (sonhoIndex != -1) sonhoTexto = cursor.getString(sonhoIndex);
                    if (dataIndex != -1) dataTexto = cursor.getString(dataIndex);
                    if (horaIndex != -1) horaTexto = cursor.getString(horaIndex);
                    if (significadoIndex != -1) significadoTexto = cursor.getString(significadoIndex);

                    Sonho sonhoObj = new Sonho(titulo, sonhoTexto, dataTexto, horaTexto);
                    sonhoObj.setId(id);
                    sonhoObj.setSignificado(significadoTexto);
                    sonhosList.add(sonhoObj);
                } while (cursor.moveToNext());
            }
        } catch (SQLException e) {
            Log.e("searchSonhos", "Erro ao pesquisar sonhos: " + e.getMessage());
        } finally {
            if (cursor != null) {
                cursor.close();
            }
            db.close();
        }
        return sonhosList;
    }
}