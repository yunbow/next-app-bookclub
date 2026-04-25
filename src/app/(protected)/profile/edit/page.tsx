import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfileEditForm } from "@/features/profile/components/ProfileEditForm";
import { getAllGenres } from "@/features/genre/server/genre-actions";

export default async function ProfileEditPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, allGenres] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        username: true,
        email: true,
        image: true,
        favoriteGenresList: { select: { genreId: true } },
      },
    }),
    getAllGenres(),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <ProfileEditForm
      currentName={user.name}
      currentUsername={user.username || ""}
      currentImage={user.image}
      email={user.email}
      allGenres={allGenres}
      currentGenreIds={user.favoriteGenresList.map((r) => r.genreId)}
    />
  );
}
