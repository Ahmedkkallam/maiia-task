import { useState, useEffect } from 'react';
import { Button, MenuItem, Snackbar, TextField } from '@material-ui/core';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

import { getPatients, patientsSelectors } from 'store/patients';
import { getPractitioners, practitionersSelectors } from 'store/practitioners';
import { addAppointment } from 'store/appointments';
import {
  getAvailabilities,
  availabilitiesSelectors,
} from 'store/availabilities';

const AppointmentForm = () => {
  const [snackBarOpened, setSnackBarOpened] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const [practitionerId, setPractitionerId] = useState('');
  const [day, setDay] = useState('');
  const [days, setDays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const dispatch = useDispatch();
  const patients = useSelector((state) =>
    patientsSelectors.selectAll(state.patients),
  );
  const practitioners = useSelector((state) =>
    practitionersSelectors.selectAll(state.practitioners),
  );
  const availabilities = useSelector((state) =>
    availabilitiesSelectors.selectAll(state.availabilities),
  );

  useEffect(() => {
    dispatch(getPatients());
    dispatch(getPractitioners());
  }, []);

  useEffect(() => {
    if (availabilities.length > 0 && practitionerId) {
      availabilities.forEach((availability) => {
        const date = availability.startDate.split('T')[0];
        days.push(date);
      });

      setDays(Array.from(new Set([...days])));
    } else {
      setDays([]);
    }
  }, [availabilities]);

  useEffect(() => {
    if (day) {
      const timeArray = [];
      availabilities.forEach((availability) => {
        if (availability.startDate.split('T')[0] === day) {
          timeArray.push(availability);
        }
      });

      setTimeSlots(Array.from(new Set([...timeArray])));
    } else {
      setTimeSlots([]);
    }
  }, [day]);

  useEffect(() => {
    if (practitionerId) {
      dispatch(getAvailabilities(practitionerId));
    } else {
      setDays([]);
      setTimeSlots([]);
    }
  }, [practitionerId]);

  const initialValues = {
    practitioner: '',
    patient: '',
    day: '',
    timeSlot: '',
  };

  const validationSchema = yup.object({
    practitioner: yup.string().required("Practitioner can't be blank."),
    patient: yup.string().required("Patient can't be blank."),
    day: yup.string().required("Day can't be blank."),
    timeSlot: yup.string().required("Time slot can't be blank."),
  });

  const onSubmit = async (formData, { resetForm }) => {
    const availability = availabilities.find(
      (item) => item.id === formData.timeSlot,
    );
    const data = {
      startDate: availability.startDate,
      endDate: availability.endDate,
      practitionerId: formData.practitioner,
      patientId: formData.patient,
    };
    const res = await dispatch(addAppointment(data));

    if (res.meta.requestStatus === 'fulfilled') {
      setSnackBarMessage('Appointment added successfully');
      setSnackBarOpened(true);
      resetForm();
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
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {(formikProps) => (
        <Form noValidate style={{ marginTop: '1rem' }}>
          <TextField
            select
            SelectProps={{ displayEmpty: true }}
            fullWidth
            name="practitioner"
            value={formikProps.values.practitioner}
            onChange={(e) => {
              formikProps.handleChange(e);
              setPractitionerId(e.target.value);
              e.target.name = 'day';
              e.target.value = '';
              formikProps.handleChange(e);
              e.target.name = 'timeSlot';
              e.target.value = '';
              formikProps.handleChange(e);
            }}
            error={
              formikProps.touched.practitioner &&
              Boolean(formikProps.errors.practitioner)
            }
            helperText={
              formikProps.touched.practitioner &&
              formikProps.errors.practitioner
            }
          >
            <MenuItem value={''}>Select Practitioner</MenuItem>

            {practitioners.map((practitioner, index) => (
              <MenuItem key={index} value={practitioner.id}>
                {practitioner.firstName} {practitioner.lastName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            SelectProps={{ displayEmpty: true }}
            fullWidth
            name="patient"
            value={formikProps.values.patient}
            onChange={formikProps.handleChange}
            error={
              formikProps.touched.patient && Boolean(formikProps.errors.patient)
            }
            helperText={
              formikProps.touched.patient && formikProps.errors.patient
            }
          >
            <MenuItem value={''}>Select Patient</MenuItem>

            {patients.map((patient, index) => (
              <MenuItem key={index} value={patient.id}>
                {patient.firstName} {patient.lastName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            SelectProps={{ displayEmpty: true }}
            fullWidth
            name="day"
            value={formikProps.values.day}
            onChange={(e) => {
              formikProps.handleChange(e);
              setDay(e.target.value);
              e.target.name = 'timeSlot';
              e.target.value = '';
              formikProps.handleChange(e);
            }}
            error={formikProps.touched.day && Boolean(formikProps.errors.day)}
            helperText={formikProps.touched.day && formikProps.errors.day}
          >
            <MenuItem value={''}>Select Day</MenuItem>

            {days.map((day, index) => (
              <MenuItem key={index} value={day}>
                {day}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            SelectProps={{ displayEmpty: true }}
            fullWidth
            name="timeSlot"
            value={formikProps.values.timeSlot}
            onChange={(e) => {
              formikProps.handleChange(e);
            }}
            error={
              formikProps.touched.timeSlot &&
              Boolean(formikProps.errors.timeSlot)
            }
            helperText={
              formikProps.touched.timeSlot && formikProps.errors.timeSlot
            }
          >
            <MenuItem value={''}>Select TimeSlot</MenuItem>

            {timeSlots.map((timeSlot, index) => (
              <MenuItem key={index} value={timeSlot.id}>
                {moment(timeSlot.startDate).format('h:mm a')} to{' '}
                {moment(timeSlot.endDate).format('h:mm a')}
              </MenuItem>
            ))}
          </TextField>

          <Button
            color="primary"
            variant="contained"
            fullWidth
            type="submit"
            style={{ marginTop: '1rem' }}
          >
            Submit
          </Button>
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
        </Form>
      )}
    </Formik>
  );
};

export default AppointmentForm;
