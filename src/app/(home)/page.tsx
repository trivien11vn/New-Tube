import { trpc } from "@/trpc/server";

export default async function Home() {
  const data = await trpc.hello({
    text: "Tri Vien"
  })

  return (
    <div>
      Client component says: {data?.greeting}
    </div>
  );
}
