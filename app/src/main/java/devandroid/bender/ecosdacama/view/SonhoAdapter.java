package devandroid.bender.ecosdacama.view;

import android.content.DialogInterface;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import devandroid.bender.ecosdacama.R;
import devandroid.bender.ecosdacama.model.Sonho;
import devandroid.bender.ecosdacama.database.EcosDaCamaDB;
import java.util.List;

public class SonhoAdapter extends RecyclerView.Adapter<SonhoAdapter.SonhoViewHolder> {

    private List<Sonho> sonhos;
    private OnItemClickListener listener;
    private EcosDaCamaDB dbHelper;

    public SonhoAdapter(List<Sonho> sonhos, OnItemClickListener listener, EcosDaCamaDB dbHelper) {
        this.sonhos = sonhos;
        this.listener = listener;
        this.dbHelper = dbHelper;
    }

    @NonNull
    @Override
    public SonhoViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_dream_card, parent, false);
        return new SonhoViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull SonhoViewHolder holder, int position) {
        Sonho sonho = sonhos.get(position);
        holder.bind(sonho);
    }

    @Override
    public int getItemCount() {
        return sonhos.size();
    }

    class SonhoViewHolder extends RecyclerView.ViewHolder {
        TextView titulo, data;
        ImageButton btnDelete;

        SonhoViewHolder(@NonNull View itemView) {
            super(itemView);
            titulo = itemView.findViewById(R.id.tituloCard);
            data = itemView.findViewById(R.id.dataCard);
            btnDelete = itemView.findViewById(R.id.btnDelete); // Certifique-se de que esse botão existe no seu XML
        }

        void bind(final Sonho sonho) {
            titulo.setText(sonho.getTitulo());
            data.setText(sonho.getData());

            itemView.setOnClickListener(v -> listener.onItemClick(sonho));

            // Ao clicar no botão de excluir, exibe o AlertDialog de confirmação
            btnDelete.setOnClickListener(v -> {
                new AlertDialog.Builder(itemView.getContext())
                        .setTitle("Excluir sonho")
                        .setMessage("Você tem certeza que deseja excluir este sonho?")
                        .setPositiveButton("Sim", (dialog, which) -> {
                            // Código para deletar o sonho
                            dbHelper.deleteSonho(sonho.getId());

                            // Atualiza a lista de sonhos após a exclusão
                            int position = getAdapterPosition();
                            if (position != RecyclerView.NO_POSITION) {
                                sonhos.remove(position);
                                notifyItemRemoved(position);
                            }
                            Toast.makeText(itemView.getContext(), "Sonho excluído!", Toast.LENGTH_SHORT).show();
                        })
                        .setNegativeButton("Não", null)
                        .show();
            });
        }
    }

    // Interface para comunicação entre o adapter e a activity
    public interface OnItemClickListener {
        void onItemClick(Sonho sonho);
        void onDeleteSonho(Sonho sonho);
    }

    public void updateList(List<Sonho> novosSonhos) {
        this.sonhos = novosSonhos;
        notifyDataSetChanged();  // Notifica o RecyclerView para atualizar a exibição
    }
}
