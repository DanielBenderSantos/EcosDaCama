package devandroid.bender.ecosdacama.util;

import android.content.Context;
import android.os.Environment;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;

import devandroid.bender.ecosdacama.model.Sonho;

public class SonhosExporter {

    public static File exportSonhos(Context context, List<Sonho> sonhos) {
        File exportDir = context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS);
        if (exportDir != null && !exportDir.exists()) {
            exportDir.mkdirs();
        }

        File file = new File(exportDir, "sonhos_exportados.txt");

        try (FileWriter writer = new FileWriter(file)) {
            for (Sonho sonho : sonhos) {
                writer.write("Título: " + sonho.getTitulo() + "\n");
                writer.write("Sonho: " + sonho.getSonho() + "\n");
                writer.write("Data: " + sonho.getData() + "\n");
                writer.write("Hora: " + sonho.getHora() + "\n");
                writer.write("\n------------------\n\n");
            }
            writer.flush();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return file;
    }
}
