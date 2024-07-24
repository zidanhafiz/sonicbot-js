import { doTransaction } from "@/actions/actions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { fromPrivateKey, toPublicKey, transaction, amount, delay } = await req.json();

  if (!fromPrivateKey || !toPublicKey || !transaction || !amount || !delay) {
    return NextResponse.json({ error: 'Please fill all the fields' }, { status: 400 });
  }

  try {
    const res = await doTransaction({ fromPrivateKey, toPublicKey, amount });
    return NextResponse.json({ success: res.success }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}