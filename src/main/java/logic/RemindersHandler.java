package logic;

import com.google.common.base.Optional;
import data.PillEventDAO;
import data.PrescriptionDAO;
import data.RemindersDAO;
import models.PillEvent;
import models.Prescription;
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
    private PrescriptionDAO prescriptionDAO;

    @Inject
    public RemindersHandler(RemindersDAO remindersDAO, PillEventDAO pillEventDAO, PrescriptionDAO prescriptionDAO) {
        this.remindersDAO = remindersDAO;
        this.pillEventDAO = pillEventDAO;
        this.prescriptionDAO = prescriptionDAO;
    }

    public List<Reminder> getAllRemindersByUserId(int userId, int year, int month, int date) {
        List<Reminder> result = new ArrayList<>();
        for (Prescription prescription : prescriptionDAO.getByUserId(userId)) {
            result.addAll(generateRemindersForEntireWeek(prescription.getId(), year, month, date));
        }

        return result;
    }

    public List<Reminder> generateRemindersForEntireWeek(int prescriptionId, int year, int month, int date) {
        Calendar cal = Calendar.getInstance();
        cal.set(year, month, date);
        cal.set(Calendar.WEEK_OF_YEAR, cal.get(Calendar.WEEK_OF_YEAR)-1);
        cal.set(Calendar.DAY_OF_WEEK, 0);

        List<Reminder> result = new ArrayList<>();
        for (int i=0; i<7; i++) {
            cal.add(Calendar.DATE, 1);
            result.addAll(getAll(prescriptionId, cal));
        }

        return result;
    }

    public List<Reminder> generateReminders(int prescriptionId, int year, int month, int date) {
        Calendar cal = Calendar.getInstance();
        cal.set(year, month, date);

        return getAll(prescriptionId, cal);
    }

    private List<Reminder> getAll(int prescriptionId, Calendar cal) {
        List<Reminder> result = new ArrayList<>();
        List<PillEvent> events = pillEventDAO.getAllByPrescriptionIdAndDay(prescriptionId, cal.get(Calendar.DAY_OF_WEEK)-1);

        for (PillEvent event : events) {
            cal.set(cal.get(Calendar.YEAR), cal.get(Calendar.MONTH), cal.get(Calendar.DATE), event.getHour(), event.getMinute(), 0);
            long eventTime = cal.getTimeInMillis();
            Optional<Reminder> reminder = Optional.fromNullable(remindersDAO.getByPrescriptionIdAndTime(prescriptionId, parseTime(eventTime)));
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
        List<Reminder> reminders = remindersDAO.getPastTime(prescriptionId, parseTime(time));
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
