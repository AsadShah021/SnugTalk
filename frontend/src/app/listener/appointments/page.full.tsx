import { PageHeader } from "@/components/dashboard/app-shell";
import { AppointmentRow } from "@/components/dashboard/appointment-row";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { appointments } from "@/lib/data/demo";
import { formatRelativeDay } from "@/lib/utils";

export default function AppointmentsPage() {
  const today = appointments.filter(
    (appointment) => formatRelativeDay(appointment.startsAt) === "Today",
  );
  const upcoming = appointments.filter(
    (appointment) => formatRelativeDay(appointment.startsAt) !== "Today",
  );

  return (
    <>
      <PageHeader
        title="Appointments"
        description="Everyone who has booked time with you, in your local timezone."
        badge={`${appointments.length} scheduled`}
      />

      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Today ({today.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="flex flex-col gap-4">
          {today.length > 0 ? (
            today.map((appointment, index) => (
              <AppointmentRow
                key={appointment.id}
                appointment={appointment}
                featured={index === 0}
              />
            ))
          ) : (
            <Card>
              <CardContent className="text-muted-foreground p-10 text-center text-sm">
                Nothing booked today. Enjoy the quiet.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="flex flex-col gap-4">
          {upcoming.map((appointment) => (
            <AppointmentRow key={appointment.id} appointment={appointment} />
          ))}
        </TabsContent>
      </Tabs>
    </>
  );
}
