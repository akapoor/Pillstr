package resources;

import com.google.common.base.Optional;
import data.RemindersDAO;
import logic.RemindersHandler;
import models.Reminder;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.List;

/**
 * Created by keegan on 4/20/15.
 */
@Path("/reminders")
@Produces(MediaType.APPLICATION_JSON)
public class RemindersResource {

    private RemindersDAO remindersDAO;
    private RemindersHandler remindersHandler;

    @Inject
    public RemindersResource(RemindersDAO remindersDAO, RemindersHandler remindersHandler) {
        this.remindersDAO = remindersDAO;
        this.remindersHandler = remindersHandler;
    }

    @GET
    public List<Reminder> getAll() {
        return remindersDAO.getAll();
    }

    @GET
    @Path("/{id}")
    public Reminder get(@PathParam("id") int id) {
        return remindersDAO.get(id);
    }

    @DELETE
    @Path("{id}")
    public void delete(@PathParam("id") int id) {
        remindersDAO.delete(id);
    }

    @POST
    public int post(@QueryParam("prescriptionId") int prescriptionId, @QueryParam("taken") boolean taken, @QueryParam("time") long time) {
        return remindersDAO.insert(prescriptionId, taken, RemindersHandler.parseTime(time));
    }

    @GET
    @Path("/-/by-prescriptionId/{prescriptionId}")
    public List<Reminder> getByPrescriptionId(@PathParam("prescriptionId") int prescriptionId, @QueryParam("time") Optional<Long> time, @QueryParam("year") Optional<Integer> year, @QueryParam("month") Optional<Integer> month, @QueryParam("date") Optional<Integer> date) {
        if (time.isPresent()) {
            return remindersHandler.generateReminders(prescriptionId, time.get());
        }
        if (year.isPresent() && month.isPresent() && date.isPresent()) {
            return remindersHandler.generateReminders(prescriptionId, year.get(), month.get(), date.get());
        }

        return remindersDAO.getByPrescriptionId(prescriptionId);
    }
    @DELETE
    @Path("/-/by-prescriptionId/{prescriptionId}/reminders-past-now")
    public void deletePastTime(@PathParam("prescriptionId") int prescriptionId) {
        remindersHandler.deletePastNow(prescriptionId);
    }
    @DELETE
    @Path("/-/by-prescriptionId/{prescriptionId}")
    public void deleteByPrescriptionId(@PathParam("prescriptionId") int prescriptionId) {
        remindersDAO.deleteByPrescriptionId(prescriptionId);
    }

    @GET
    @Path("/-/by-prescriptionId-for-entire-week/{prescriptionId}/{year}/{month}/{date}")
    public List<Reminder> getByPrescriptionIdForEntireWeek(@PathParam("prescriptionId") int prescriptionId, @PathParam("year")int year, @PathParam("month") int month, @PathParam("date") int date) {
        month--;
        return remindersHandler.generateRemindersForEntireWeek(prescriptionId, year, month, date);
    }

    @PUT
    @Path("/{id}/taken/{taken}")
    public void setTaken(@PathParam("id") int id, @PathParam("taken") boolean taken) {
        remindersDAO.setTaken(id, taken);
    }
}
