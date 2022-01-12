import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import DoctorIcon from '@material-ui/icons/AssignmentInd';
import DateIcon from '@material-ui/icons/Event';
import TimeIcon from '@material-ui/icons/Schedule';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import moment from 'moment';

import EditAppointmentDialog from './EditAppointmentDialog';
import {
  getAppointments,
  appointmentsSelectors,
  deleteAppointment,
} from 'store/appointments';
import { getPatients, patientsSelectors } from 'store/patients';
import { getPractitioners, practitionersSelectors } from 'store/practitioners';

const AppointmentList = () => {
  const [filter, setFilter] = useState('');
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [snackBarOpened, setSnackBarOpened] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const [formatedAppointments, setFormatedAppointments] = useState([]);
  const dispatch = useDispatch();
  const appointments = useSelector((state) =>
    appointmentsSelectors.selectAll(state.appointments),
  );
  const practitioners = useSelector((state) =>
    practitionersSelectors.selectAll(state.practitioners),
  );
  const patients = useSelector((state) =>
    patientsSelectors.selectAll(state.patients),
  );

  useEffect(() => {
    if (appointments) {
      const _appointments = appointments.map((appointment) => {
        const _appointment = { ...appointment };
        _appointment.patient = patients.find(
          (patient) => patient.id === appointment.patientId,
        );
        _appointment.practitioner = practitioners.find(
          (practitioner) => practitioner.id === appointment.practitionerId,
        );
        return _appointment;
      });
      setFormatedAppointments(_appointments);
    }
  }, [appointments]);

  useEffect(() => {
    if (filter != '') {
      const _filtered = formatedAppointments.filter(
        (appointment) =>
          appointment.id.toString().includes(filter) ||
          `${appointment.patient.firstName.toLowerCase()} ${appointment.patient.lastName.toLowerCase()}`.includes(
            filter.toLowerCase(),
          ) ||
          `${appointment.practitioner.firstName.toLowerCase()} ${appointment.practitioner.lastName.toLowerCase()}`.includes(
            filter.toLowerCase(),
          ),
      );
      setFilteredAppointments(_filtered);
    } else {
      setFilteredAppointments(formatedAppointments);
    }
  }, [filter, formatedAppointments]);

  useEffect(() => {
    dispatch(getAppointments());
    dispatch(getPatients());
    dispatch(getPractitioners());
  }, []);

  const handleDelete = async (id) => {
    const res = await dispatch(deleteAppointment(id));

    if (res.meta.requestStatus === 'fulfilled') {
      setSnackBarMessage(`Appointment #${id} deleted successfully`);
      setSnackBarOpened(true);
    } else {
      setSnackBarMessage('Something went wrong!');
      setSnackBarOpened(true);
    }
  };

  const handleSnackBarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackBarOpened(false);
  };

  return (
    <div>
      <Grid container justify="flex-end">
        <Grid item>
          <TextField
            placeholder="Search Appointments"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        message={snackBarMessage}
        onClose={handleSnackBarClose}
        open={snackBarOpened}
        autoHideDuration={3000}
        color="green"
      />

      <Grid container spacing={2} style={{ marginTop: '1.5rem' }}>
        {filteredAppointments &&
          filteredAppointments.map((appointment) => (
            <Grid key={appointment.id} item xs={12} md={6} lg={4}>
              <Card className="timeSlot__item btn">
                <CardHeader
                  title={<Typography>Appointment #{appointment.id}</Typography>}
                />
                <CardContent>
                  <Grid container direction="row" alignItems="center">
                    <Grid item style={{ marginRight: '0.5rem' }}>
                      <PersonIcon />
                    </Grid>
                    <Grid item>
                      Patient: {appointment.patient.firstName}{' '}
                      {appointment.patient.lastName}
                    </Grid>
                  </Grid>
                  <Grid container direction="row" alignItems="center">
                    <Grid item style={{ marginRight: '0.5rem' }}>
                      <DoctorIcon />
                    </Grid>
                    <Grid item>
                      Practitioner: {appointment.practitioner.firstName}{' '}
                      {appointment.practitioner.lastName}
                    </Grid>
                  </Grid>
                  <Grid container direction="row" alignItems="center">
                    <Grid item style={{ marginRight: '0.5rem' }}>
                      <DateIcon />
                    </Grid>
                    <Grid item>
                      Date:{' '}
                      {moment(appointment.startDate).format('MMMM Do YYYY')}
                    </Grid>
                  </Grid>
                  <Grid container direction="row" alignItems="center">
                    <Grid item style={{ marginRight: '0.5rem' }}>
                      <TimeIcon />
                    </Grid>
                    <Grid item>
                      Time: {moment(appointment.startDate).format('h:mma')} to{' '}
                      {moment(appointment.endDate).format('h:mma')}
                    </Grid>
                  </Grid>
                </CardContent>
                <CardActions
                  disableSpacing
                  style={{ justifyContent: 'flex-end' }}
                >
                  <EditAppointmentDialog
                    appointment={appointment}
                    practitioners={practitioners}
                    patients={patients}
                  />
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => {
                        handleDelete(appointment.id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>
    </div>
  );
};

export default AppointmentList;
