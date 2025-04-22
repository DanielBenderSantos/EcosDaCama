package devandroid.bender.ecosdacama.database;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

public class EcosDaCamaDB extends SQLiteOpenHelper {

    // Nome do banco de dados e versão
    private static final String DATABASE_NAME = "sonhos_db";
    private static final int DATABASE_VERSION = 2; // Atualize a versão

    // Nome da tabela
    public static final String TABLE_SONHOS = "sonhos";

    // Colunas da tabela
    public static final String COLUMN_ID = "id";
    public static final String COLUMN_TITULO = "titulo";  // Nova coluna para título
    public static final String COLUMN_SONHO = "sonho";
    public static final String COLUMN_DATA = "data";
    public static final String COLUMN_HORA = "hora";

    // SQL para criar a tabela
    private static final String TABLE_CREATE =
            "CREATE TABLE " + TABLE_SONHOS + " (" +
                    COLUMN_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    COLUMN_TITULO + " TEXT, " + // Adicionando a coluna TITULO
                    COLUMN_SONHO + " TEXT, " +
                    COLUMN_DATA + " TEXT, " +
                    COLUMN_HORA + " TEXT);";

    // SQL para atualizar a tabela, caso a versão seja alterada
    private static final String TABLE_ALTER =
            "ALTER TABLE " + TABLE_SONHOS + " ADD COLUMN " + COLUMN_TITULO + " TEXT;";

    public EcosDaCamaDB(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        // Cria a tabela quando o banco de dados é criado
        db.execSQL(TABLE_CREATE);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        // Se a versão do banco de dados for atualizada, executa o ALTER
        if (oldVersion < 2) {
            db.execSQL(TABLE_ALTER);
        }
    }
}
