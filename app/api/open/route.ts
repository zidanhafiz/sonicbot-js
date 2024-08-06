import { openMysteryBox } from "@/actions/actions";
import { getKeypair, getToken } from "@/utils/solanaUtils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { privateKey } = await req.json();

  if (!privateKey) {
    return NextResponse.json(
      { error: "Please fill all the fields" },
      { status: 400 },
    );
  }

  try {
    const token = await getToken(privateKey);
    const keypair = getKeypair(privateKey);

    const open = await openMysteryBox(token, keypair, 3);

    const message = `Success open mystery box, Amount: ${open.data.amount}`;
    console.log(message);
    return NextResponse.json({ success: message }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
