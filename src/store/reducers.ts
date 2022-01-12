import timeslots from './timeslots';
import patients from './patients';
import practitioners from './practitioners';
import availabilities from './availabilities';
import appointments from './appointments';

export default {
  timeslots: timeslots.reducer,
  patients: patients.reducer,
  practitioners: practitioners.reducer,
  availabilities: availabilities.reducer,
  appointments: appointments.reducer,
};
