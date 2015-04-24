package logic;

import com.google.common.base.Optional;
import data.PillEventDAO;
import data.RemindersDAO;
import models.PillEvent;
import models.Reminder;
import org.joda.time.DateTime;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

/**
 * Created by keegan on 4/23/15.
 */
public class RemindersHandler {

    private RemindersDAO remindersDAO;
    private PillEventDAO pillEventDAO;

    @Inject
    public RemindersHandler(RemindersDAO remindersDAO, PillEventDAO pillEventDAO) {
        this.remindersDAO = remindersDAO;
        this.pillEventDAO = pillEventDAO;
    }

    public List<Reminder> generateReminders(int prescriptionId, int year, int month, int date) {
        Calendar cal = Calendar.getInstance();
        cal.set(year, month, date);

        return getAll(prescriptionId, cal);
    }

    private List<Reminder> getAll(int prescriptionId, Calendar cal) {
        List<Reminder> result = new ArrayList<>();
        List<PillEvent> events = pillEventDAO.getAllByPrescriptionIdAndDay(prescriptionId, cal.DAY_OF_WEEK);

        for (PillEvent event : events) {
            cal.set(cal.YEAR, cal.MONTH, cal.DATE, event.getHour(), event.getMinute());
            long eventTime = cal.getTimeInMillis();
            Optional<Reminder> reminder = Optional.of(remindersDAO.getByPrescriptionIdAndTime(prescriptionId, eventTime));
            if (!reminder.isPresent()) {
                int reminderId = remindersDAO.insert(prescriptionId, false, parseTime(eventTime));
                result.add(remindersDAO.get(reminderId));
            } else {
                result.add(reminder.get());
            }
        }

        return result;
    }

    public List<Reminder> generateReminders(int prescriptionId, long time) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date(time));

        return getAll(prescriptionId, cal);
    }

    public void deletePastTime(int prescriptionId, long time) {
        List<Reminder> reminders = remindersDAO.getPastTime(prescriptionId, time);
        for (Reminder reminder : reminders) {
            remindersDAO.delete(reminder.getId());
        }
    }

    public static String parseTime(long time) {
        DateTime t = new DateTime(time);
        String ts = t.toString();
        ts = ts.replace("T", " ");
        ts = ts.substring(0, 19);

        return ts;
    }
}