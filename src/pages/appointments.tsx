import AppointmentForm from '../components/AppointmentForm';
import AppointmentList from '../components/AppointmentList';

const AppointmentsPage = () => {
  return (
    <>
      <h1>Appointments</h1>
      <AppointmentForm />
      <AppointmentList />
    </>
  );
};

AppointmentsPage.pageTitle = 'Appointments';
AppointmentsPage.pageSubtitle = "Let's get to work 👩‍💻";

export default AppointmentsPage;
