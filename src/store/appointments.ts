import { Appointment } from '@prisma/client';
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';
import config from 'config';
import { parseIds } from 'store/utils';

const SERVER_API_ENDPOINT = config.get('SERVER_API_ENDPOING', '/api');

export const getAppointments = createAsyncThunk('getAppointments', async () => {
  const response = await fetch(`${SERVER_API_ENDPOINT}/appointments`);
  const parsedResponse = await response.json();
  return parseIds(parsedResponse) as Appointment[];
});

export const addAppointment = createAsyncThunk(
  'addAppointment',
  async (data: any) => {
    const response = await fetch(`${SERVER_API_ENDPOINT}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const parsedResponse = await response.json();
    return parseIds(parsedResponse) as Appointment;
  },
);

export const deleteAppointment = createAsyncThunk(
  'deleteAppointment',
  async (appointmentId: number) => {
    const response = await fetch(
      `${SERVER_API_ENDPOINT}/appointments?appointmentId=${appointmentId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    const parsedResponse = await response.json();
    return parseIds(parsedResponse) as Appointment;
  },
);

export const editAppointment = createAsyncThunk(
  'editAppointment',
  async (data: any) => {
    const response = await fetch(
      `${SERVER_API_ENDPOINT}/appointments?appointmentId=${data.appointmentId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );
    const parsedResponse = await response.json();
    return parseIds(parsedResponse) as Appointment;
  },
);

const appointmentsAdapter = createEntityAdapter<Appointment>();

export const appointmentsSelectors = appointmentsAdapter.getSelectors();

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState: appointmentsAdapter.getInitialState({
    entities: [],
    loading: false,
    error: null,
  }),
  reducers: {},
  extraReducers: (builder) => {
    //getAppointments
    builder.addCase(getAppointments.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAppointments.fulfilled, (state, action) => {
      appointmentsAdapter.setAll(state, action.payload);
      state.error = null;
      state.loading = false;
    });
    builder.addCase(getAppointments.rejected, (state, action) => {
      state.error = action.error;
      state.loading = false;
    });
    //addAppointment
    builder.addCase(addAppointment.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(addAppointment.fulfilled, (state, action) => {
      appointmentsAdapter.addOne(state, action.payload);
      state.error = null;
      state.loading = false;
    });
    builder.addCase(addAppointment.rejected, (state, action) => {
      state.error = action.error;
      state.loading = false;
    });
    //deleteAppointment
    builder.addCase(deleteAppointment.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteAppointment.fulfilled, (state, action) => {
      appointmentsAdapter.removeOne(state, action.payload.id);
      state.error = null;
      state.loading = false;
    });
    builder.addCase(deleteAppointment.rejected, (state, action) => {
      state.error = action.error;
      state.loading = false;
    });
    //editAppointment
    builder.addCase(editAppointment.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(editAppointment.fulfilled, (state, action) => {
      appointmentsAdapter.upsertOne(state, action.payload);
      state.error = null;
      state.loading = false;
    });
    builder.addCase(editAppointment.rejected, (state, action) => {
      state.error = action.error;
      state.loading = false;
    });
  },
});

export default appointmentsSlice;
