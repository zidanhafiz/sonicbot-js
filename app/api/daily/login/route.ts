import { dailyLogin } from "@/actions/actions";
import { getKeypair, getToken } from "@/utils/solanaUtils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { privateKey } = await req.json();

  if (!privateKey) {
    return NextResponse.json({ error: 'Please fill all the fields' }, { status: 400 });
  }

  try {
    const token = await getToken(privateKey);
    const keypair = getKeypair(privateKey);
    const claimLogin = await dailyLogin(token, keypair);

    const message = `Daily login has been success, accumulative days: ${claimLogin.data.accumulative_days}`;
    console.log(message);
    return NextResponse.json({ success: message }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}