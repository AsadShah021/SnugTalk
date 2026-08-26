import { PageHeader } from "@/components/dashboard/app-shell";
import { MessageThread } from "@/components/dashboard/message-thread";

export default function MessagesPage() {
  return (
    <>
      <PageHeader
        title="Messages"
        description="Encrypted text conversations with your listeners. No rush to reply."
        badge="Unlimited on your plan"
      />
      <MessageThread />
    </>
  );
}
