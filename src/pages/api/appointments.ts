import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from 'prisma/client';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { appointmentId } = req.query;
  const { patientId, practitionerId, startDate, endDate } = req.body;

  switch (req.method) {
    case 'GET':
      const appointments = await prisma.appointment.findMany();
      res.status(200).json(appointments);
      break;
    case 'POST':
      const appointment = await prisma.appointment.create({
        data: {
          patientId: parseInt(patientId),
          practitionerId: parseInt(practitionerId),
          startDate: startDate,
          endDate: endDate,
        },
      });
      res.status(200).json(appointment);
      break;
    case 'DELETE':
      const deletedAppointment = await prisma.appointment.delete({
        where: {
          id: +appointmentId,
        },
      });
      res.status(200).json(deletedAppointment);
      break;
    case 'PUT':
      const updatedAppointment = await prisma.appointment.update({
        where: {
          id: +appointmentId,
        },
        data: {
          patientId: parseInt(patientId),
          practitionerId: parseInt(practitionerId),
          startDate: startDate,
          endDate: endDate,
        },
      });
      res.status(200).json(updatedAppointment);
      break;
  }
};
