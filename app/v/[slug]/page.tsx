import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

export default async function ViewFeedbackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const feedback = await prisma.feedback.findUnique({
    where: { slug },
  });

  if (!feedback) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white flex justify-center p-4 sm:p-8 font-sans">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={feedback.imageUrl}
        alt="Annotated Feedback"
        className="max-w-full h-auto self-start border border-black shadow-sm"
        draggable={false}
      />
    </div>
  );
}
