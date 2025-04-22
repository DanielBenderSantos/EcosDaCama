package devandroid.bender.ecosdacama.view;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import devandroid.bender.ecosdacama.R;
import devandroid.bender.ecosdacama.model.Sonho;
import java.util.List;

public class SonhoAdapter extends RecyclerView.Adapter<SonhoAdapter.SonhoViewHolder> {

    private List<Sonho> sonhos;

    public SonhoAdapter(List<Sonho> sonhos) {
        this.sonhos = sonhos;
    }

    @NonNull
    @Override
    public SonhoViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View itemView = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_dream_card, parent, false); // Certifique-se de ter o layout item_sonho.xml
        return new SonhoViewHolder(itemView);
    }

    @Override
    public void onBindViewHolder(@NonNull SonhoViewHolder holder, int position) {
        Sonho sonho = sonhos.get(position);
        holder.tvTituloSonho.setText(sonho.getTitulo());
        holder.tvDescricaoSonho.setText(sonho.getSonho());
        holder.tvDataHora.setText(sonho.getData() + " - " + sonho.getHora());
    }

    @Override
    public int getItemCount() {
        return sonhos.size();
    }

    public static class SonhoViewHolder extends RecyclerView.ViewHolder {

        public TextView tvTituloSonho;
        public TextView tvDescricaoSonho;
        public TextView tvDataHora;

        public SonhoViewHolder(View itemView) {
            super(itemView);
            tvTituloSonho = itemView.findViewById(R.id.tvTituloSonho);
            tvDescricaoSonho = itemView.findViewById(R.id.tvDescricaoSonho);
            tvDataHora = itemView.findViewById(R.id.tvDataHora);
        }
    }
}
