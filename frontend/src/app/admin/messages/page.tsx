import { FullHeight, PageHeader } from "@/components/dashboard/app-shell";
import { TeamChatInbox } from "@/components/dashboard/team-chat-inbox";

export default function AdminMessagesPage() {
  return (
    <FullHeight>
      <PageHeader
        title="Messages"
        description="Every member conversation in one queue. Replies go out instantly."
      />
      <TeamChatInbox />
    </FullHeight>
  );
}
