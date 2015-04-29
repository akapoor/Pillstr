package data;

import com.hubspot.rosetta.jdbi.RosettaMapperFactory;
import models.Reminder;
import org.joda.time.DateTime;
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
public interface RemindersDAO {

    @SqlQuery("SELECT * FROM reminders")
    public List<Reminder> getAll();

    @SqlQuery("SELECT * FROM reminders WHERE id = :id LIMIT 1")
    public Reminder get(@Bind("id") int id);

    @SqlUpdate("DELETE FROM reminders WHERE id = :id LIMIT 1")
    public void delete(@Bind("id") int id);

    @SqlUpdate("INSERT INTO reminders (prescriptionId, taken, time) VALUES (:prescriptionId, :taken, :time)")
    @GetGeneratedKeys
    public int insert(@Bind("prescriptionId") int prescriptionId, @Bind("taken") boolean taken, @Bind("time") String time);

    @SqlQuery("SELECT * FROM reminders WHERE prescriptionId = :prescriptionId")
    public List<Reminder> getByPrescriptionId(@Bind("prescriptionId") int prescriptionId);

    @SqlQuery("SELECT * FROM reminders WHERE prescriptionId = :prescriptionId AND time > :time")
    public List<Reminder> getPastTime(@Bind("prescriptionId") int prescriptionId, @Bind("time") long time);

    @SqlQuery("SELECT * FROM reminders WHERE prescriptionId = :prescriptionId AND time = :time LIMIT 1")
    public Reminder getByPrescriptionIdAndTime(@Bind("prescriptionId") int prescriptionId, @Bind("time") long time);

    @SqlUpdate("DELETE FROM reminders WHERE prescriptionId = :prescriptionId")
    public void deleteByPrescriptionId(@Bind("prescriptionId") int prescriptionId);
}
