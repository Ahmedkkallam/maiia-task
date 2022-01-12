import { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Formik } from 'formik';
import {
  DialogContent,
  IconButton,
  MenuItem,
  Snackbar,
  TextField,
  Tooltip,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import * as yup from 'yup';
import moment from 'moment';

import {
  getAvailabilities,
  availabilitiesSelectors,
} from 'store/availabilities';
import { editAppointment } from 'store/appointments';

const EditAppointmentDialog = (props) => {
  const [snackBarOpened, setSnackBarOpened] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const dispatch = useDispatch();
  const [timeSlot, setTimeSlot] = useState('');
  const availabilities = useSelector((state) =>
    availabilitiesSelectors.selectAll(state.availabilities),
  );
  const {
    onClose,
    selectedValue,
    open,
    appointment,
    practitioners,
    patients,
  } = props;

  useEffect(() => {
    dispatch(getAvailabilities(appointment.practitionerId));
  }, [appointment.practitionerId]);

  useEffect(() => {
    if (availabilities) {
      const availability = availabilities.find(
        (item) =>
          item.startDate === props.appointment.startDate &&
          item.startDate === props.appointment.startDate,
      );
      if (availability) {
        setTimeSlot(availability.id);
      }
    }
  }, [availabilities]);

  const handleClose = () => {
    onClose(selectedValue);
  };

  const initialValues = {
    practitioner: appointment.practitionerId,
    patient: appointment.patientId,
    timeSlot: timeSlot,
  };

  const validationSchema = yup.object({
    practitioner: yup.string().required("Practitioner can't be blank."),
    patient: yup.string().required("Patient can't be blank."),
    timeSlot: yup.string().required("Time slot can't be blank."),
  });

  const onSubmit = async (formData) => {
    const availability = availabilities.find(
      (item) => item.id === formData.timeSlot,
    );
    const data = {
      startDate: availability.startDate,
      endDate: availability.endDate,
      practitionerId: formData.practitioner,
      patientId: formData.patient,
      appointmentId: appointment.id,
    };
    const res = await dispatch(editAppointment(data));

    if (res.meta.requestStatus === 'fulfilled') {
      setSnackBarMessage('Appointment updated successfully');
      setSnackBarOpened(true);
      handleClose();
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
    <>
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

      <Dialog
        onClose={handleClose}
        aria-labelledby="simple-dialog-title"
        open={open}
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogTitle id="form-dialog-title">
          Edit Appointment #{appointment.id}
        </DialogTitle>
        <DialogContent style={{ paddingBottom: '2rem' }}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {(formikProps) => (
              <Form>
                <TextField
                  select
                  SelectProps={{ displayEmpty: true }}
                  fullWidth
                  margin="normal"
                  name="practitioner"
                  value={formikProps.values.practitioner}
                  onChange={(e) => {
                    formikProps.handleChange(e);
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
                  margin="normal"
                  name="patient"
                  value={formikProps.values.patient}
                  onChange={formikProps.handleChange}
                  error={
                    formikProps.touched.patient &&
                    Boolean(formikProps.errors.patient)
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
                  margin="normal"
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

                  {availabilities.map((timeSlot, index) => (
                    <MenuItem key={index} value={timeSlot.id}>
                      {moment(timeSlot.startDate).format(
                        'MMMM Do YYYY, h:mm:ss a',
                      )}{' '}
                      to {moment(timeSlot.endDate).format('h:mm a')}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  style={{ float: 'right', marginTop: '1.5rem' }}
                  color="primary"
                  type="submit"
                  variant="outlined"
                >
                  Submit
                </Button>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
};

const EditDialog = (props) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Tooltip title="Delete">
        <IconButton onClick={handleClickOpen}>
          <EditIcon />
        </IconButton>
      </Tooltip>

      <EditAppointmentDialog open={open} onClose={handleClose} {...props} />
    </div>
  );
};
export default EditDialog;
