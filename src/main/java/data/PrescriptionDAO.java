package data;

import com.hubspot.rosetta.jdbi.RosettaMapperFactory;
import models.Prescription;
import org.skife.jdbi.v2.sqlobject.Bind;
import org.skife.jdbi.v2.sqlobject.GetGeneratedKeys;
import org.skife.jdbi.v2.sqlobject.SqlQuery;
import org.skife.jdbi.v2.sqlobject.SqlUpdate;
import org.skife.jdbi.v2.sqlobject.customizers.RegisterMapperFactory;

import java.util.List;

/**
 * Created by keegan on 4/20/15.
 */
@RegisterMapperFactory(RosettaMapperFactory.class)
public interface PrescriptionDAO {

    @SqlQuery("SELECT * FROM prescriptions")
    public List<Prescription> getAll();

    @SqlQuery("SELECT * FROM prescriptions WHERE id = :id LIMIT 1")
    public Prescription get(@Bind("id") int id);

    @SqlUpdate("DELETE FROM prescriptions WHERE id = :id LIMIT 1")
    public void delete(@Bind("id") int id);

    @SqlUpdate("INSERT INTO prescriptions (name, userId, displayName, quantity, notes, dosage, remind) VALUES (:name, :userId, :displayName, :quantity, :notes, :dosage, :remind)")
    @GetGeneratedKeys
    public int insert(@Bind("name") String name, @Bind("userId") int userId, @Bind("displayName") String displayName, @Bind("quantity") double quantity, @Bind("notes") String notes, @Bind("dosage") double dosage, @Bind("remind") boolean remind);

    @SqlQuery("SELECT * FROM prescriptions WHERE userId = :userId")
    public List<Prescription> getByUserId(@Bind("userId") int userId);

    @SqlQuery("SELECT * FROM prescriptions WHERE userId = :userId AND remind = :remind")
    public List<Prescription> getByUserIdAndRemind(@Bind("userId") int userId, @Bind("remind") boolean remind);

    @SqlUpdate("DELETE FROM prescriptions WHERE userId = :userId")
    public void deleteByUserId(@Bind("userId") int userId);

    @SqlUpdate("UPDATE prescriptions SET name = :name WHERE id = :id LIMIT 1")
    public void setName(@Bind("id") int id, @Bind("name") String name);

    @SqlUpdate("UPDATE prescriptions SET userId = :userId WHERE id = :id LIMIT 1")
    public void setUserId(@Bind("id") int id, @Bind("userId") Integer userId);

    @SqlUpdate("UPDATE prescriptions SET displayName = :displayName WHERE id = :id LIMIT 1")
    public void setDisplayName(@Bind("id") int id, @Bind("displayName") String displayName);

    @SqlUpdate("UPDATE prescriptions SET quantity = :quantity WHERE id = :id LIMIT 1")
    public void setQuantity(@Bind("id") int id, @Bind("quantity") Integer quantity);

    @SqlUpdate("UPDATE prescriptions SET notes = :notes WHERE id = :id LIMIT 1")
    public void setNotes(@Bind("id") int id, @Bind("notes") String notes);

    @SqlUpdate("UPDATE prescriptions SET dosage = :dosage WHERE id = :id LIMIT 1")
    public void setDosage(@Bind("id") int id, @Bind("dosage") Double dosage);

    @SqlUpdate("UPDATE prescriptions SET remind = :remind WHERE id = :id LIMIT 1")
    public void setRemind(@Bind("id") int id, @Bind("remind") boolean remind);
}
