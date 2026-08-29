import prisma from "./lib/prisma";
import {
  createPatient,
  deletePatient,
  getPatient,
  searchPatients,
  updatePatientPhone,
} from "./patients";
import { createDoctor, deleteDoctor, getDoctor, listDoctorsBySpecialty } from "./doctors";
import {
  bookAppointment,
  cancelAllPatientAppointments,
  deleteAppointment,
  getAppointmentFull,
  getDoctorUpcomingAppointments,
  setAppointmentStatus,
} from "./appointments";

async function main() {
  console.log("\n── Patients ──────────────────────────");

  const patient = await createPatient({
    name: "Test Patient",
    email: "test.patient@example.com",
    phone: "9999999999",
  });
  console.log("Created patient:", patient.name, patient.id);

  const found = await getPatient(patient.id);
  console.log("Found patient:", found.name);

  const searchResults = await searchPatients("Test");
  console.log("Matching patients:", searchResults.length);

  const updated = await updatePatientPhone(patient.id, "8888888888");
  console.log("Updated phone:", updated.phone);

  const deletedPatient = await deletePatient(patient.id);
  console.log("Deleted patient:", deletedPatient.id, deletedPatient.email);

  console.log("\n── Doctors ───────────────────────────");

  const doctor = await createDoctor({
    name: "Dr. Test",
    specialty: "General Medicine",
    email: "dr.test@hospital.io",
  });
  console.log("Created doctor:", doctor.name, doctor.id);

  const doctorById = await getDoctor(doctor.id);
  console.log("Fetched doctor:", doctorById.name);

  const specialists = await listDoctorsBySpecialty("General");
  console.log("General Medicine doctors:", specialists.length);

  console.log("\n── Appointments ──────────────────────");

  const patientForBooking = await createPatient({
    name: "Booking Patient",
    email: "booking.patient@example.com",
    phone: "7777777777",
  });

  const appt = await bookAppointment(
    patientForBooking.id,
    doctor.id,
    new Date("2024-09-01T09:00:00"),
    "Initial consultation",
  );
  console.log("Booked appointment:", appt.id, "for", appt.patient.name);

  const full = await getAppointmentFull(appt.id);
  console.log("Full appointment:", full.patient.name, "with", full.doctor.name);

  const schedule = await getDoctorUpcomingAppointments(doctor.id);
  console.log("Doctor schedule:", schedule.length, "appointment(s)");

  const updatedStatus = await setAppointmentStatus(appt.id, "completed");
  console.log("Status updated to:", updatedStatus.status);

  const cancelledCount = await cancelAllPatientAppointments(patientForBooking.id);
  console.log("Cancelled scheduled appointments:", cancelledCount);

  const deletedAppointment = await deleteAppointment(appt.id);
  console.log("Deleted appointment:", deletedAppointment.id);

  const deletedDoctor = await deleteDoctor(doctor.id);
  console.log("Deleted doctor:", deletedDoctor.id, deletedDoctor.name);

  console.log("\n── Cleanup ───────────────────────────");
  await prisma.patient.deleteMany({ where: { id: patientForBooking.id } });
  console.log("Test data cleaned up.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
