import Link from "next/link";

export default function Home() {
  return (
    <main className="p-6 pt-16 max-w-xl mx-auto">
      <h1 className="text-xl mb-10 font-bold text-center">Welcome to my sonic bot</h1>
      <p>Choose your option:</p>
      <div className="flex flex-col gap-6 mt-5">
        <Link href='/send' className="btn btn-primary">Automatic Send</Link>
        <Link href='/daily' className="btn btn-primary">Daily Claim</Link>
        <Link href='/open-box' className="btn btn-primary">Open Box</Link>
      </div>
    </main>
  );
}
