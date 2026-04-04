import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ReceiptUploadForm } from '@/components/upload/receipt-upload-form';

export default async function UploadPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Safe-area-aware top padding for iPhone notch */}
      <div className="flex flex-1 flex-col px-6 pb-10 pt-safe-top">
        <div className="flex flex-1 flex-col justify-center">
          <div className="mx-auto w-full max-w-sm space-y-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">Upload Receipt</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Signed in as {session.user.email}
              </p>
            </div>
            <ReceiptUploadForm />
          </div>
        </div>
      </div>
    </div>
  );
}
