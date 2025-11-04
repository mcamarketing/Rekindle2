export function LeadDetail({ leadId }: { leadId: string }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900">Lead Detail: {leadId}</h1>
      </div>
    </div>
  );
}
